import { useRef, useState, useCallback, useEffect } from "react";
import { useToastStore } from "@/shared/stores/useToastStore";

type HealthcareFlowState = "IDLE" | "RECORDING" | "UPLOADING";

interface UseHealthcareCameraProps {
    onComplete: (videoBlob: Blob) => Promise<void>;
    onIdleChange: (isIdle: boolean) => void;
}

export const useHealthcareCamera = ({ onComplete, onIdleChange }: UseHealthcareCameraProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [flowState, setFlowState] = useState<HealthcareFlowState>("IDLE");
    const [recordingTimeLeft, setRecordingTimeLeft] = useState(10);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToastStore();

    // Idle 상태 변경 알림
    useEffect(() => {
        onIdleChange(flowState === "IDLE");
    }, [flowState, onIdleChange]);

    // 카메라 초기화
    const initializeCamera = useCallback(async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setError("이 브라우저에서는 카메라를 사용할 수 없습니다.");
            return;
        }
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false,
            });
            setStream(mediaStream);
        } catch (err) {
            console.error(err);
            setError("카메라 권한이 필요합니다.");
        }
    }, []);

    // 카메라 스트림을 video 엘리먼트에 연결
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => { });
        }
    }, [stream]);

    // 스트림 정리 (Cleanup)
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [stream]);

    // 컴포넌트 마운트 시 카메라 초기화 및 타이머 정리
    useEffect(() => {
        setTimeout(() => {
            initializeCamera().catch(console.error);
        }, 0);

        return () => {
            if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
        };
    }, [initializeCamera]);

    const stopRecording = useCallback(() => {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
            recorderRef.current.stop();
        }
    }, []);

    const startRecording = useCallback(() => {
        if (!stream) return;
        setFlowState("RECORDING");
        chunksRef.current = [];

        try {
            const mimeType = MediaRecorder.isTypeSupported("video/mp4")
                ? "video/mp4"
                : "video/webm";
            const recorder = new MediaRecorder(stream, { mimeType });
            recorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });

                if (blob.size === 0) {
                    console.error('[Healthcare] 녹화된 영상이 비어있습니다.');
                    showToast({ message: "녹화된 영상이 비어있습니다. 다시 시도해주세요.", type: "error" });
                    setFlowState("IDLE");
                    return;
                }

                setFlowState("UPLOADING");
                onComplete(blob).catch((e) => {
                    console.error(e);
                    showToast({ message: "업로드에 실패했습니다. 잠시 후 다시 시도해주세요.", type: "error" });
                    setFlowState("IDLE");
                });
            };

            // iOS Safari 최적화: 100ms 단위로 데이터 수집
            recorder.start(100);
            setRecordingTimeLeft(10);

            // 카운트다운 타이머
            let currentTime = 10;
            const countdownInterval = setInterval(() => {
                currentTime -= 1;
                setRecordingTimeLeft(currentTime);
                if (currentTime <= 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);

            // iOS Safari 데이터 유실 방지: 백업 데이터 요청
            const requestDataInterval = setInterval(() => {
                if (recorderRef.current?.state === 'recording') {
                    recorderRef.current.requestData();
                }
            }, 1000);

            // 10초 후 자동 중지
            recordingTimerRef.current = setTimeout(() => {
                clearInterval(countdownInterval);
                clearInterval(requestDataInterval);
                if (recorderRef.current && recorderRef.current.state === 'recording') {
                    recorderRef.current.requestData();
                }
                setTimeout(() => {
                    stopRecording();
                }, 100);
            }, 10000);

        } catch (e) {
            console.error(e);
            showToast({ message: "녹화를 시작할 수 없습니다.", type: "error" });
            setFlowState("IDLE");
        }
    }, [stream, showToast, stopRecording, onComplete]);

    return {
        videoRef,
        flowState,
        recordingTimeLeft,
        error,
        startRecording
    };
};
