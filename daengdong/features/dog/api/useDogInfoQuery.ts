import { useQuery } from '@tanstack/react-query';
import { DogInfo } from '@/entities/dog/model/types';

// Mock API Call
const fetchDogInfo = async (): Promise<DogInfo | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return null to simulate new registration
    return null;

    /* Uncomment to simulate existing dog
    return {
      id: 1,
      name: '멍멍이',
      breed: '골든 리트리버',
      birthDate: '2020-05-05',
      isBirthDateUnknown: false,
      weight: 25.5,
      gender: 'MALE',
      neutered: 'YES',
      imageUrl: null,
    };
    */
};

export const useDogInfoQuery = () => {
    return useQuery({
        queryKey: ['dogInfo'],
        queryFn: fetchDogInfo,
        staleTime: 1000 * 60 * 5,
    });
};
