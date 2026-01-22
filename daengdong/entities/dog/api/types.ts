import { DogInfo, CreateDogParams, UpdateDogParams, DogResponse } from '../model/types';

export interface DogRepository {
    getDogInfo(): Promise<DogInfo | null>;
    createDog(params: CreateDogParams): Promise<DogResponse>;
    updateDog(params: UpdateDogParams): Promise<DogResponse>;
}
