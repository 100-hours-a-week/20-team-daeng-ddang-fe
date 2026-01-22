import { http } from '@/shared/api/http';
import { DogInfo, DogResponse, Breed, CreateDogParams, UpdateDogParams } from '@/entities/dog/model/types';
import { ApiResponse } from '@/shared/api/types';
import { dogApi } from './index';

// GET /api/v3/users/dogs
export const getDogInfo = async (): Promise<DogInfo | null> => {
    return dogApi.getDogInfo();
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
export const createDog = async (params: CreateDogParams): Promise<DogResponse> => {
    return dogApi.createDog(params);
};

// PATCH /api/v3/users/dogs
export const updateDog = async (params: UpdateDogParams): Promise<DogResponse> => {
    return dogApi.updateDog(params);
};
