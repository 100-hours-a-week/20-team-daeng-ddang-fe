import { DogInfo, DogResponse, CreateDogParams, UpdateDogParams } from '../model/types';
import { DogRepository } from './types';

const mockDogData: DogInfo = {
    id: 1,
    name: "초코",
    breed: "진돗개",
    breedId: 2,
    birthDate: "2023-12-23",
    isBirthDateUnknown: false,
    weight: 20.2,
    gender: "MALE",
    isNeutered: true,
    imageUrl: "https://cdn.example.com/dogs/choco.png",
};

let hasDogData = true; // Mock 상태: true면 데이터 있음, false면 없음

export const dogRepositoryMock: DogRepository = {
    async getDogInfo(): Promise<DogInfo | null> {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!hasDogData) {
            return null;
        }

        return { ...mockDogData };
    },

    async createDog(params: CreateDogParams): Promise<DogResponse> {
        await new Promise(resolve => setTimeout(resolve, 800));

        const newDog: DogResponse = {
            dogId: 1,
            name: params.name,
            breed: "진돗개",
            breedId: params.breedId,
            gender: params.gender || "MALE",
            isNeutered: params.isNeutered || false,
            birthDate: params.birthDate,
            weight: params.weight,
            profileImageUrl: params.profileImageUrl ?? null,
        };

        // Mock 상태 업데이트
        hasDogData = true;
        mockDogData.id = newDog.dogId;
        mockDogData.name = newDog.name;
        mockDogData.breedId = newDog.breedId;
        mockDogData.birthDate = newDog.birthDate ?? null;
        mockDogData.weight = newDog.weight;
        mockDogData.gender = newDog.gender;
        mockDogData.isNeutered = newDog.isNeutered;
        mockDogData.imageUrl = newDog.profileImageUrl ?? undefined;

        return newDog;
    },

    async updateDog(params: UpdateDogParams): Promise<DogResponse> {
        await new Promise(resolve => setTimeout(resolve, 800));

        const updatedDog: DogResponse = {
            dogId: mockDogData.id || 1,
            name: params.name,
            breed: "진돗개",
            breedId: params.breedId,
            gender: params.gender,
            isNeutered: params.isNeutered,
            birthDate: params.birthDate,
            weight: params.weight,
            profileImageUrl: params.profileImageUrl ?? null,
        };

        // Mock 상태 업데이트
        Object.assign(mockDogData, {
            name: updatedDog.name,
            breedId: updatedDog.breedId,
            birthDate: updatedDog.birthDate,
            weight: updatedDog.weight,
            gender: updatedDog.gender,
            isNeutered: updatedDog.isNeutered,
            imageUrl: updatedDog.profileImageUrl,
        });

        return updatedDog;
    },
};
