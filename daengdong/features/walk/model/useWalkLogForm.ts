import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useWalkStore } from '@/entities/walk/model/walkStore';
import { useWriteWalkDiary } from '@/features/walk/model/useWalkMutations';
import fileApi from '@/shared/api/file';
import { resolveS3Url } from '@/shared/utils/resolveS3Url';

const base64ToBlob = (base64: string): Blob => {
    if (!base64 || !base64.includes(';base64,')) {
        throw new Error('Invalid base64 Data URI format');
    }
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    try {
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    } catch {
        throw new Error('Failed to decode base64 string');
    }
};

export const useWalkLogForm = () => {
    const [log, setLog] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const MAX_LENGTH = 500;

    const router = useRouter();
    const { walkId } = useParams();
    const { showToast } = useToastStore();
    const { mutate: writeDiary } = useWriteWalkDiary();
    const { walkResult } = useWalkStore();

    const handleSubmit = async () => {
        if (!walkId) return;

        let mapImageUrl = null;

        if (walkResult?.imageUrl) {
            if (walkResult.imageUrl.startsWith('http')) {
                mapImageUrl = walkResult.imageUrl;
            } else {
                try {
                    setIsUploading(true);
                    const blob = base64ToBlob(walkResult.imageUrl);
                    const fileType = "IMAGE";
                    const contentType = blob.type;
                    const uploadContext = "WALK";

                    const { presignedUrl, objectKey } = await fileApi.getPresignedUrl(fileType, contentType, uploadContext);
                    await fileApi.uploadFile(presignedUrl, blob, contentType);

                    mapImageUrl = resolveS3Url(objectKey);
                } catch (error) {
                    console.error("Image upload failed", error);
                    showToast({
                        message: "이미지 업로드에 실패했습니다. 일지만 저장됩니다.",
                        type: "error"
                    });
                } finally {
                    setIsUploading(false);
                }
            }
        }

        writeDiary(
            {
                walkId: Number(walkId),
                memo: log,
                mapImageUrl: mapImageUrl || undefined
            },
            {
                onSuccess: () => {
                    showToast({
                        message: '산책일지가 작성되었습니다.',
                        type: 'success',
                        duration: 2000,
                    });
                    router.push('/walk');
                },
            }
        );
    };

    return {
        log,
        setLog,
        isUploading,
        handleSubmit,
        MAX_LENGTH
    };
};
