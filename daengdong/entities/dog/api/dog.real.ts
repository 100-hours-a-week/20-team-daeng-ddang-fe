import { isAxiosError } from 'axios';
import { http } from '@/shared/api/http';
import { DogInfo, DogResponse, CreateDogParams, UpdateDogParams } from '../model/types';
import { ApiResponse } from '@/shared/api/types';
import { DogRepository } from './types';

export const dogRepositoryReal: DogRepository = {
    async getDogInfo(): Promise<DogInfo | null> {
        try {
            const response = await http.get<ApiResponse<DogResponse>>('/users/dogs');
            const data = response.data.data;

            return {
                id: data.dogId,
                name: data.name,
                breed: data.breed,
                breedId: data.breedId,
                birthDate: data.birthDate ?? null,
                isBirthDateUnknown: false,
                weight: data.weight,
                gender: data.gender,
                neutered: data.neutered,
                region: data.region,
                imageUrl: data.profileImageUrl ?? null,
            };
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    async createDog(params: CreateDogParams): Promise<DogResponse> {
        const response = await http.post<ApiResponse<DogResponse>>('/users/dogs', params);
        return response.data.data;
    },

    async updateDog(params: UpdateDogParams): Promise<DogResponse> {
        const response = await http.patch<ApiResponse<DogResponse>>('/users/dogs', params);
        return response.data.data;
    },
};
