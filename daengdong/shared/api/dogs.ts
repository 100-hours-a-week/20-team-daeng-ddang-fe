import { http } from './http';
import { DogInfo, Gender, Neutered } from '@/entities/dog/model/types';

interface ApiResponse<T> {
    message: string;
    data: T;
    errorCode: string | null;
}

export interface Breed {
    id: number;
    name: string;
}

interface DogResponse {
    dogId: number;
    name: string;
    breed: string; // "골든 리트리버"
    gender: Gender;
    isNeutered: boolean;
    birth: string; // "2021-01-01"
    weight: number;
    profileImageUrl: string | null;
}

interface BreedsResponse {
    breeds: Breed[];
}

// GET /api/v3/users/dogs
export const getDogInfo = async (): Promise<DogInfo | null> => {
    try {
        const response = await http.get<ApiResponse<DogResponse>>('/users/dogs');
        const data = response.data.data;

        // Map API response to Domain Model
        return {
            id: data.dogId,
            name: data.name,
            breed: data.breed,
            birthDate: data.birth,
            isBirthDateUnknown: false, // API doesn't seem to track this explicitly, assume known if date exists
            weight: data.weight,
            gender: data.gender,
            neutered: data.isNeutered ? 'YES' : 'NO',
            imageUrl: data.profileImageUrl,
        };
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null; // Return null if no dog found
        }
        throw error;
    }
};

// GET /api/v3/dogs/breeds
export const getBreeds = async (keyword?: string): Promise<Breed[]> => {
    const params = keyword ? { keyword } : {};
    const response = await http.get<ApiResponse<BreedsResponse>>('/dogs/breeds', { params });
    return response.data.data.breeds;
};

export interface CreateDogParams {
    name: string;
    breedId: number;
    birthDate: string;
    weight: number;
    profileImageUrl?: string;
    gender?: Gender;
    isNeutered?: boolean;
}

// POST /api/v3/dogs
export const createDog = async (params: CreateDogParams): Promise<void> => {
    await http.post<ApiResponse<any>>('/dogs', params);
};

// PATCH /api/v3/users/dogs
export const updateDog = async (params: Partial<CreateDogParams>): Promise<void> => {
    await http.patch<ApiResponse<any>>('/users/dogs', params);
};
