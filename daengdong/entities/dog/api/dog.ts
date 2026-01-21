import { http } from '@/shared/api/http';
import { DogInfo, DogResponse, Breed, CreateDogParams } from '@/entities/dog/model/types';
import { ApiResponse } from '@/shared/api/types';

// GET /api/v3/users/dogs
export const getDogInfo = async (): Promise<DogInfo | null> => {
    try {
        const response = await http.get<ApiResponse<DogResponse>>('/users/dogs');
        const data = response.data.data;

        return {
            id: data.dogId,
            name: data.name,
            breed: data.breed,
            birthDate: data.birth,
            isBirthDateUnknown: false,
            weight: data.weight,
            gender: data.gender,
            isNeutered: data.isNeutered,
            imageUrl: data.profileImageUrl,
        };
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

interface BreedsResponse {
    breeds: Breed[];
}

// GET /api/v3/dogs/breeds
export const getBreeds = async (keyword?: string): Promise<Breed[]> => {
    const params = keyword ? { keyword } : {};
    const response = await http.get<ApiResponse<BreedsResponse>>('/dogs/breeds', { params });
    return response.data.data.breeds;
};

// POST /api/v3/users/dogs
export const createDog = async (params: CreateDogParams): Promise<void> => {
    await http.post<ApiResponse<any>>('/users/dogs', params);
};
