import { useCallback, useEffect, useRef, useState } from 'react';
import { useToastStore } from '@/shared/stores/useToastStore';

export type RecordingState = 'IDLE' | 'COUNTDOWN' | 'RECORDING' | 'PROCESSING';

export interface UseVideoRecorderOptions {
    recordingDuration?: number; // 기본값: 5초
    countdownDuration?: number; // 기본값: 3초
    onRecordingComplete: (blob: Blob) => void | Promise<void>;
    onError?: (error: Error) => void;
    autoStart?: boolean; // 카메라 자동 시작 여부
}

export interface UseVideoRecorderReturn {
    // 상태
    stream: MediaStream | null;
    state: RecordingState;
    countdown: number;
    recordingTimeLeft: number;
    error: string | null;
    previewURL: string | null;

    // 액션
    startCountdown: () => void;
    stopRecording: () => void;
    initializeCamera: () => Promise<void>;
}

export const useVideoRecorder = ({
    recordingDuration = 5,
    countdownDuration = 3,
    onRecordingComplete,
    onError,
    autoStart = true,
}: UseVideoRecorderOptions): UseVideoRecorderReturn => {
    const videoChunksRef = useRef<Blob[]>([]);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const countdownTimerRef = useRef<number | null>(null);
    const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const [state, setState] = useState<RecordingState>('IDLE');
    const [countdown, setCountdown] = useState(countdownDuration);
    const [recordingTimeLeft, setRecordingTimeLeft] = useState(recordingDuration);
    const [error, setError] = useState<string | null>(null);

    const { showToast } = useToastStore();

    // 카메라 초기화
    const initializeCamera = useCallback(async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            const errorMsg = '이 브라우저에서는 카메라를 사용할 수 없습니다.';
            setError(errorMsg);
            onError?.(new Error(errorMsg));
            return;
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: true,
            });
            setStream(mediaStream);
            setError(null);
        } catch (err) {
            console.error(err);
            const errorMsg = '카메라 권한이 필요합니다.';
            setError(errorMsg);
            onError?.(err as Error);
        }
    }, [onError]);

    // 녹화 중지
    const stopRecording = useCallback(() => {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            recorderRef.current.stop();
        }
    }, []);

    // 녹화 시작
    const startRecording = useCallback(() => {
        if (!stream) return;

        setState('RECORDING');
        videoChunksRef.current = [];

        try {
            // iOS Safari 호환성: MP4 우선, WebM 대체
            const mimeType = MediaRecorder.isTypeSupported('video/mp4')
                ? 'video/mp4'
                : 'video/webm';

            const recorder = new MediaRecorder(stream, { mimeType });
            recorderRef.current = recorder;

            // 데이터 수집
            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    videoChunksRef.current.push(e.data);
                }
            };

            // 녹화 완료
            recorder.onstop = () => {
                const blob = new Blob(videoChunksRef.current, { type: mimeType });

                // iOS에서 blob이 비어있는 경우 에러 처리
                if (blob.size === 0) {
                    console.error('[useVideoRecorder] Blob is empty!');
                    showToast({ message: '녹화된 영상이 비어있습니다. 다시 시도해주세요.', type: 'error' });
                    setState('IDLE');
                    return;
                }

                const url = URL.createObjectURL(blob);
                setPreviewURL(url);
                setState('PROCESSING');

                // 녹화 완료 콜백 실행
                Promise.resolve(onRecordingComplete(blob)).catch((e) => {
                    console.error(e);
                    showToast({ message: '처리에 실패했습니다. 다시 시도해주세요.', type: 'error' });
                    setState('IDLE');
                });
            };

            // iOS Safari: 작은 timeslice로 자주 데이터 수집 (100ms)
            recorder.start(100);
            setRecordingTimeLeft(recordingDuration);

            // 1초마다 카운트다운
            let currentTime = recordingDuration;
            const countdownInterval = setInterval(() => {
                currentTime -= 1;
                setRecordingTimeLeft(currentTime);
                if (currentTime <= 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);

            // iOS Safari: 주기적으로 데이터 요청 (백업)
            const requestDataInterval = setInterval(() => {
                if (recorderRef.current?.state === 'recording') {
                    recorderRef.current.requestData();
                }
            }, 1000);

            // 녹화 시간 후 자동 종료
            recordingTimerRef.current = setTimeout(() => {
                clearInterval(countdownInterval);
                clearInterval(requestDataInterval);

                // 최종 데이터 요청
                if (recorderRef.current && recorderRef.current.state === 'recording') {
                    recorderRef.current.requestData();
                }

                // 약간의 딜레이 후 stop (데이터 수집 완료 대기)
                setTimeout(() => {
                    stopRecording();
                }, 100);
            }, recordingDuration * 1000);
        } catch (e) {
            console.error(e);
            showToast({ message: '녹화를 시작할 수 없습니다.', type: 'error' });
            setState('IDLE');
        }
    }, [stream, recordingDuration, onRecordingComplete, showToast, stopRecording]);

    // 카운트다운 시작
    const startCountdown = useCallback(() => {
        if (!stream) return;
        if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);

        setCountdown(countdownDuration);
        setState('COUNTDOWN');

        const countdownInterval = window.setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    window.clearInterval(countdownInterval);
                    startRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        countdownTimerRef.current = countdownInterval;
    }, [stream, countdownDuration, startRecording]);

    // 초기화 시 카메라 자동 시작
    useEffect(() => {
        if (autoStart) {
            setTimeout(() => {
                initializeCamera().catch(console.error);
            }, 0);
        }

        return () => {
            if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);
            if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
        };
    }, [autoStart, initializeCamera]);

    // 스트림 및 미리보기 URL 정리
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            if (previewURL) {
                URL.revokeObjectURL(previewURL);
            }
        };
    }, [stream, previewURL]);

    return {
        stream,
        state,
        countdown,
        recordingTimeLeft,
        error,
        previewURL,
        startCountdown,
        stopRecording,
        initializeCamera,
    };
};
