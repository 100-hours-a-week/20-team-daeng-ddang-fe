"use client";

import { useState } from "react";
import Image from "next/image";
import { resolveS3Url } from "@/shared/utils/resolveS3Url";
import { DefaultDogImage } from "./DefaultDogImage";

interface DogProfileImageProps {
    src?: string | null;
    alt: string;
    size: number;
    priority?: boolean;
}

export const DogProfileImage = ({ src, alt, size, priority = false }: DogProfileImageProps) => {
    const [isError, setIsError] = useState(false);
    const resolvedUrl = resolveS3Url(src);

    if (!resolvedUrl || isError) {
        return <DefaultDogImage size={size} />;
    }

    return (
        <Image
            src={resolvedUrl}
            alt={alt}
            width={size}
            height={size}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            priority={priority}
            onError={() => setIsError(true)}
        />
    );
};
