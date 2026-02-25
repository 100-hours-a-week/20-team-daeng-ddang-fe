import styled from '@emotion/styled';
import { useRef, ChangeEvent } from 'react';
import { colors } from '@/shared/styles/tokens';
import Image from 'next/image';

interface ProfileImageUploaderProps {
    imagePreview: string | null;
    onImageChange: (file: File | null) => void;
    onImageRemove: () => void;
}

export function ProfileImageUploader({
    imagePreview,
    onImageChange,
    onImageRemove,
}: ProfileImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('이미지 크기는 10MB 이하여야 합니다.');
                return;
            }
            onImageChange(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Container>
            <ImageWrapper onClick={handleClick} hasImage={!!imagePreview}>
                {imagePreview ? (
                    <Image
                        src={imagePreview}
                        alt="Dog Profile"
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover' }}
                        priority={imagePreview.startsWith('http')}
                    />
                ) : (
                    <PlaceholderIcon />
                )}
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
            </ImageWrapper>
            {imagePreview && (
                <RemoveButton type="button" onClick={onImageRemove}>
                    <CloseIcon />
                </RemoveButton>
            )}
        </Container>
    );
}

const PlaceholderIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="4" r="2" />
        <circle cx="18" cy="8" r="2" />
        <circle cx="20" cy="16" r="2" />
        <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
    </svg>
);

const CloseIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
            d="M9 3L3 9M3 3L9 9"
            stroke="#666"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const Container = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
`;

const ImageWrapper = styled.div<{ hasImage: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: ${colors.gray[50]};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid ${colors.gray[200]};
  
  &:hover {
    background-color: ${colors.gray[200]};
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background: white;
  border: 1px solid ${colors.gray[200]};
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;
