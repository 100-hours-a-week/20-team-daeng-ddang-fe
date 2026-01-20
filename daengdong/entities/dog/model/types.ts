export type Gender = 'MALE' | 'FEMALE';

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

export interface DogFormValues {
    name: string;
    breedId: number; // Changed from breed string
    breedName: string; // Display name
    birthDate: string; // Form input string
    isBirthDateUnknown: boolean;
    weight: string; // Form input string (for decimal handling)
    gender: Gender;
    isNeutered: boolean;
    imageFile?: File | null;
}
