import { useState, useRef } from "react";
import { useToastStore } from "@/shared/stores/useToastStore";

type VideoUploadStep = 'SIDE' | 'BACK';

interface UseVideoUploadProps {
    onComplete: (videoBlob: Blob, backVideoBlob?: Blob) => void;
    requireBackVideo?: boolean;
}

export const useVideoUpload = ({ onComplete, requireBackVideo = false }: UseVideoUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToastStore();

    const [step, setStep] = useState<VideoUploadStep>('SIDE');
    const [sideVideo, setSideVideo] = useState<Blob | null>(null);

    const validateVideoDuration = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                const duration = video.duration;

                console.log("Video duration:", duration);

                if (duration > 10.5) {
                    showToast({
                        message: "10초 이내의 영상만 업로드 가능합니다.",
                        type: "error"
                    });
                    resolve(false);
                } else {
                    resolve(true);
                }
            };

            video.onerror = () => {
                showToast({
                    message: "영상 파일을 읽을 수 없습니다.",
                    type: "error"
                });
                resolve(false);
            };

            video.src = URL.createObjectURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        e.target.value = '';

        if (!file.type.startsWith('video/')) {
            showToast({
                message: "영상 파일만 업로드 가능합니다.",
                type: "error"
            });
            return;
        }

        const isValid = await validateVideoDuration(file);
        if (!isValid) return;

        if (step === 'SIDE') {
            if (requireBackVideo) {
                setSideVideo(file);
                setStep('BACK');
                showToast({ message: "측면 영상이 저장되었습니다!", type: "success" });
            } else {
                onComplete(file);
            }
        } else {
            if (sideVideo) {
                onComplete(sideVideo, file);
            }
        }
    };

    const handleSkip = () => {
        if (sideVideo) {
            onComplete(sideVideo);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return {
        fileInputRef,
        step,
        sideVideo,
        handleFileChange,
        handleSkip,
        handleUploadClick
    };
};
