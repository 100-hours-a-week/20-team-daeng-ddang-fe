export type Gender = 'MALE' | 'FEMALE';

export interface Breed {
    breedId: number;
    name: string;
}

export interface DogResponse {
    dogId: number;
    name: string;
    breed: string;
    breedId?: number;
    gender: Gender;
    neutered: boolean;
    birthDate: string | null; // "2021-01-01" or null
    birthUnknown: boolean;
    weight: number;
    profileImageUrl: string | null;
}

export interface DogInfo {
    id?: number;
    name: string;
    breed: string;
    breedId?: number;
    birthDate: string | null; // YYYY-MM-DD
    isBirthDateUnknown: boolean;
    weight: number;
    gender: Gender;
    neutered: boolean;
    imageUrl?: string | null;
}

export interface DogFormValues {
    name: string;
    breedId: number;
    breedName: string;
    birthDate: string | null;
    isBirthDateUnknown: boolean;
    weight: string;
    gender: Gender;
    neutered: boolean;
    imageFile?: File | null;
    isImageDeleted?: boolean;
}

export interface CreateDogParams {
    name: string;
    breedId: number;
    birthDate: string | null;
    isBirthUnknown: boolean;
    weight: number;
    profileImageUrl?: string | null;
    gender?: Gender;
    isNeutered?: boolean;
}

export interface UpdateDogParams {
    name: string;
    breedId: number;
    birthDate: string | null;
    isBirthUnknown: boolean;
    gender: Gender;
    isNeutered: boolean;
    weight: number;
    profileImageUrl?: string | null;
}