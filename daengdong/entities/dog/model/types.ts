export type Gender = 'MALE' | 'FEMALE';

export interface Breed {
    breedId: number;
    name: string;
}

// 서버
export interface DogResponse {
    dogId: number;
    name: string;
    breed: string;
    gender: Gender;
    isNeutered: boolean;
    birth: string; // "2021-01-01"
    weight: number;
    profileImageUrl: string | null;
}

// 프론트
export interface DogInfo {
    id?: number;
    name: string;
    breed: string;
    birthDate: string | null; // YYYY-MM-DD
    isBirthDateUnknown: boolean;
    weight: number;
    gender: Gender;
    isNeutered: boolean;
    imageUrl?: string | null;
}

// 폼
export interface DogFormValues {
    name: string;
    breedId: number;
    breedName: string;
    birthDate: string;
    isBirthDateUnknown: boolean;
    weight: string;
    gender: Gender;
    isNeutered: boolean;
    imageFile?: File | null;
}

export interface CreateDogParams {
    name: string;
    breedId: number;
    birthDate: string;
    weight: number;
    profileImageUrl?: string;
    gender?: Gender;
    isNeutered?: boolean;
}