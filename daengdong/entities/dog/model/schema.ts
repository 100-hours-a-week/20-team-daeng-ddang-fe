import { z } from 'zod';
import dayjs from 'dayjs';

export const DogSchema = z.object({
    name: z
        .string()
        .min(2, '이름은 최소 2자 이상이어야 합니다.')
        .max(15, '이름은 최대 15자까지 가능합니다.')
        .regex(/^[가-힣a-zA-Z]+$/, '올바르지 않은 이름형식입니다.'),
    breedId: z.number({ message: '견종을 선택해주세요.' }).min(1, '견종을 선택해주세요.'),
    breedName: z.string().min(1, '견종을 선택해주세요.'),
    birthDate: z.string().nullable(),
    isBirthDateUnknown: z.boolean(),
    weight: z
        .string()
        .min(1, '몸무게를 입력해주세요.')
        .refine((val) => parseFloat(val) > 0, '몸무게는 0kg보다 커야 합니다.')
        .refine((val) => parseFloat(val) <= 200, '몸무게는 200kg 이하로 입력해주세요.')
        .regex(/^\d+(\.\d)?$/, '소수점 첫째 자리까지만 입력 가능합니다.'),
    gender: z.enum(['MALE', 'FEMALE'], { message: '성별을 선택해주세요.' }),
    neutered: z.boolean({ message: '중성화 여부를 선택해주세요.' }),
    imageFile: z.any().optional(),
    isImageDeleted: z.boolean().optional(),
}).refine((data) => data.isBirthDateUnknown || (data.birthDate && data.birthDate.length > 0), {
    message: "생년월일을 선택해주세요.",
    path: ["birthDate"],
}).refine((data) => {
    if (data.isBirthDateUnknown) return true;
    if (!data.birthDate) return false;
    return !dayjs(data.birthDate).isAfter(dayjs(), 'day');
}, {
    message: "미래 날짜는 선택할 수 없습니다.",
    path: ["birthDate"],
});
