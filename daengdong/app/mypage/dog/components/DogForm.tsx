import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import styled from '@emotion/styled';
import { spacing, colors, radius } from '@/shared/styles/tokens';
import { Button } from '@/shared/components/Button/Button';
import { SelectDropdown } from '@/shared/components/SelectDropdown/SelectDropdown';
import { Input } from '@/shared/components/Input/Input';
import { DogFormValues } from '@/entities/dog/model/types';
import { ProfileImageUploader } from './ProfileImageUploader';
import { useState } from 'react';
import dayjs from 'dayjs';
import { ScrollDatePicker } from '@/widgets/ScrollDatePicker/ScrollDatePicker';

import { useBreedsQuery } from '@/features/dog/api/useBreedsQuery';
import { useEffect, useRef } from 'react';

// --- Zod Schema ---
const DogSchema = z.object({
    name: z
        .string()
        .min(2, '이름은 최소 2자 이상이어야 합니다.')
        .max(15, '이름은 최대 15자까지 가능합니다.')
        .regex(/^[가-힣a-zA-Z]+$/, '올바르지 않은 이름형식입니다.'),
    breedId: z.number().min(1, '견종을 선택해주세요.'),
    breedName: z.string().min(1, '견종을 선택해주세요.'),
    birthDate: z.string(),
    isBirthDateUnknown: z.boolean(),
    weight: z
        .string()
        .min(1, '몸무게를 입력해주세요.')
        .regex(/^\d+(\.\d)?$/, '소수점 첫째 자리까지만 입력 가능합니다.'),
    gender: z.enum(['MALE', 'FEMALE'], { message: '성별을 선택해주세요.' }),
    isNeutered: z.boolean({ message: '중성화 여부를 선택해주세요.' }),
    imageFile: z.any().optional(),
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


// --- Props ---
interface DogFormProps {
    initialData?: Partial<DogFormValues>;
    onSubmit: (data: DogFormValues) => void;
    isSubmitting: boolean;
}

// --- Component ---
export function DogForm({ initialData, onSubmit, isSubmitting }: DogFormProps) {
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors, isValid },
    } = useForm<DogFormValues>({
        resolver: zodResolver(DogSchema),
        defaultValues: {
            name: '',
            breedId: 0,
            breedName: '',
            birthDate: '',
            isBirthDateUnknown: false,
            weight: '',
            gender: undefined,
            isNeutered: undefined,
            imageFile: null,
            ...initialData,
        },
        mode: 'onChange',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const birthDate = watch('birthDate');
    const isBirthDateUnknown = watch('isBirthDateUnknown');
    const breedName = watch('breedName');

    // Breed Search State
    const [breedSearchKeyword, setBreedSearchKeyword] = useState('');
    const [isBreedListOpen, setIsBreedListOpen] = useState(false);
    const { data: breedList } = useBreedsQuery(breedSearchKeyword);
    const breedInputRef = useRef<HTMLInputElement>(null);

    // Initial Image Preview
    useEffect(() => {
        // If there's a profileImage url in initialData (which we don't handle in types yet but logic assumes it might exist externally or processed)
        // For now, handling basic file preview logic
    }, []);


    // Handle Image Change
    const handleImageChange = (file: File | null) => {
        setValue('imageFile', file, { shouldDirty: true });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    // Calculate Age
    const getAgeString = () => {
        if (isBirthDateUnknown || !birthDate) return '모름';
        const birth = dayjs(birthDate);
        const now = dayjs();
        if (birth.isAfter(now)) return '-';

        const years = now.diff(birth, 'year');
        const months = now.diff(birth, 'month') % 12;

        if (years === 0 && months === 0) return '0개월';
        if (years === 0) return `${months}개월`;
        return `${years}년 ${months}개월`;
    };

    const [isDateOpen, setIsDateOpen] = useState(false);

    // Handle Breed Selection
    const handleBreedSelect = (id: number, name: string) => {
        setValue('breedId', id);
        setValue('breedName', name);
        setBreedSearchKeyword(name); // Set input to selected name
        setIsBreedListOpen(false);
        trigger('breedName');
    };

    // Close breed list when clicking outside (simplification: relying on onBlur delay or similar usually, keeping simple here)

    return (
        <FormWrapper onSubmit={handleSubmit(onSubmit)}>
            {/* 1. Profile Image */}
            <Section>
                <ProfileImageUploader
                    imagePreview={imagePreview}
                    onImageChange={handleImageChange}
                    onImageRemove={() => handleImageChange(null)}
                />
            </Section>

            {/* 2. Name */}
            <FieldGroup>
                <Label>이름 <Required>*</Required></Label>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <Input {...field} placeholder="ex) 댕동이" disabled={isSubmitting} />
                    )}
                />
                {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
            </FieldGroup>

            {/* 3. Breed */}
            <FieldGroup>
                <Label>견종 <Required>*</Required></Label>
                <div style={{ position: 'relative' }}>
                    <Input
                        value={breedSearchKeyword || breedName}
                        onChange={(e) => {
                            setBreedSearchKeyword(e.target.value);
                            setValue('breedName', e.target.value); // Sync for validation?
                            // If typing, reset ID until selected?
                            // setValue('breedId', 0); // Optional: keep old ID or reset
                            setIsBreedListOpen(true);
                        }}
                        onFocus={() => setIsBreedListOpen(true)}
                        placeholder="견종 검색"
                        disabled={isSubmitting}
                        ref={breedInputRef}
                    />
                    {isBreedListOpen && breedList && breedList.length > 0 && (
                        <BreedList>
                            {breedList.map((breed) => (
                                <BreedItem
                                    key={breed.id}
                                    onClick={() => handleBreedSelect(breed.id, breed.name)}
                                >
                                    {breed.name}
                                </BreedItem>
                            ))}
                        </BreedList>
                    )}
                </div>
                {errors.breedName && <ErrorText>{errors.breedName.message}</ErrorText>}
            </FieldGroup>

            {/* 4. BirthDate */}
            <FieldGroup>
                <LabelRow>
                    <Label>생년월일 <Required>*</Required></Label>
                    <AgeText>{getAgeString()}</AgeText>
                </LabelRow>

                <CheckboxWrapper>
                    <input
                        type="checkbox"
                        id="unknown-birth"
                        checked={isBirthDateUnknown}
                        onChange={(e) => {
                            setValue('isBirthDateUnknown', e.target.checked);
                            if (e.target.checked) {
                                setValue('birthDate', '');
                            } else {
                                setValue('birthDate', dayjs().format('YYYY-MM-DD'));
                            }
                            trigger('birthDate');
                        }}
                    />
                    <CheckboxLabel htmlFor="unknown-birth">생년월일 모름</CheckboxLabel>
                </CheckboxWrapper>

                <Controller
                    name="birthDate"
                    control={control}
                    render={({ field }) => (
                        <div onClick={() => !isBirthDateUnknown && !isSubmitting && setIsDateOpen(true)}>
                            <StyledDateInput
                                type="text"
                                value={field.value || ''}
                                readOnly
                                placeholder="YYYY-MM-DD"
                                disabled={isBirthDateUnknown || isSubmitting}
                                isPlaceholder={!field.value}
                                style={{ pointerEvents: 'none' }} // Let div handle click
                            />
                        </div>
                    )}
                />
                {errors.birthDate && <ErrorText>{errors.birthDate.message}</ErrorText>}
            </FieldGroup>

            <ScrollDatePicker
                isOpen={isDateOpen}
                onClose={() => setIsDateOpen(false)}
                onConfirm={(date) => {
                    setValue('birthDate', date);
                    trigger('birthDate');
                }}
                initialDate={birthDate}
            />

            {/* 5. Weight */}
            <FieldGroup>
                <Label>몸무게 <Required>*</Required></Label>
                <WeightWrapper>
                    <Controller
                        name="weight"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                type="number"
                                step="0.1"
                                placeholder="ex) 3.6"
                                inputMode="decimal"
                                disabled={isSubmitting}
                            />
                        )}
                    />
                    <UnitSuffix>kg</UnitSuffix>
                </WeightWrapper>
                {errors.weight && <ErrorText>{errors.weight.message}</ErrorText>}
            </FieldGroup>

            {/* 6. Gender */}
            <FieldGroup>
                <Label>성별 <Required>*</Required></Label>
                <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                        <SelectDropdown
                            options={['수컷', '암컷']}
                            value={field.value === 'MALE' ? '수컷' : field.value === 'FEMALE' ? '암컷' : ''}
                            onChange={(val) => field.onChange(val === '수컷' ? 'MALE' : 'FEMALE')}
                            placeholder="성별 선택"
                            disabled={isSubmitting}
                        />
                    )}
                />
                {errors.gender && <ErrorText>{errors.gender.message}</ErrorText>}
            </FieldGroup>

            {/* 7. Neutered */}
            <FieldGroup>
                <Label>중성화 <Required>*</Required></Label>
                <Controller
                    name="isNeutered"
                    control={control}
                    render={({ field }) => (
                        <SelectDropdown
                            options={['O', 'X']}
                            value={field.value === true ? 'O' : field.value === false ? 'X' : ''}
                            onChange={(val) => field.onChange(val === 'O')}
                            placeholder="중성화 여부 선택"
                            disabled={isSubmitting}
                        />
                    )}
                />
                {errors.isNeutered && <ErrorText>{errors.isNeutered.message}</ErrorText>}
            </FieldGroup>

            {/* Spacer for bottom button */}
            <div style={{ height: '80px' }} />

            <SaveButtonWrapper>
                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={!isValid || isSubmitting}
                >
                    저장
                </Button>
            </SaveButtonWrapper>
        </FormWrapper>
    );
}

const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing[6]}px;
  width: 100%;
`;

const Section = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${spacing[2]}px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[2]}px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.gray[900]};
`;

const Required = styled.span`
  color: ${colors.semantic.error};
  margin-left: 2px;
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AgeText = styled.span`
  font-size: 13px;
  color: ${colors.gray[500]};
`;

const ErrorText = styled.span`
  color: ${colors.semantic.error};
  font-size: 12px;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: ${colors.gray[700]};
  cursor: pointer;
`;

const StyledDateInput = styled.input<{ isPlaceholder?: boolean }>`
  width: 100%;
  padding: 14px;
  border-radius: ${radius.md};
  border: 1px solid ${colors.gray[200]};
  font-size: 16px;
  background-color: white;
  outline: none;
  color: ${({ isPlaceholder }) => (isPlaceholder ? colors.gray[500] : colors.gray[900])};
  
  &:disabled {
      background-color: ${colors.gray[50]};
      color: ${colors.gray[500]};
  }

  &:focus {
      border-color: ${colors.primary[500]};
  }
`;

const WeightWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const UnitSuffix = styled.span`
  position: absolute;
  right: 16px;
  color: ${colors.gray[500]};
  font-size: 14px;
`;

const SaveButtonWrapper = styled.div`
  position: fixed;
  bottom: 60px; /* Specific height of BottomNav */
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: white;
  border-top: 1px solid ${colors.gray[200]};
  z-index: 50;
  max-width: 600px;
  margin: 0 auto;
`;

const BreedList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${colors.gray[200]};
  border-radius: ${radius.md};
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0;
`;

const BreedItem = styled.li`
  padding: 12px 16px;
  font-size: 14px;
  color: ${colors.gray[900]};
  cursor: pointer;
  border-bottom: 1px solid ${colors.gray[200]};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${colors.gray[50]};
  }
`;
