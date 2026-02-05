import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import styled from '@emotion/styled';
import { spacing, colors, radius } from '@/shared/styles/tokens';
import { Button } from '@/shared/components/Button/Button';
import { SelectDropdown } from '@/shared/components/SelectDropdown/SelectDropdown';
import { Input } from '@/shared/components/Input/Input';
import { DogFormValues } from '@/entities/dog/model/types';
import { ProfileImageUploader } from './ProfileImageUploader';
import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { ScrollDatePicker } from '@/widgets/ScrollDatePicker/ScrollDatePicker';
import { useBreedsQuery } from '@/features/dog/api/useBreedsQuery';
import { FormWrapper, FieldGroup, Label, Required, ErrorText, LabelRow } from '@/shared/styles/FormStyles';

const DogSchema = z.object({
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

interface DogFormProps {
    initialData?: Partial<DogFormValues>;
    initialImageUrl?: string | null;
    onSubmit: (data: DogFormValues) => void;
    isSubmitting: boolean;
}

export function DogForm({ initialData, initialImageUrl, onSubmit, isSubmitting }: DogFormProps) {
    const {
        control,
        handleSubmit,
        setValue,
        trigger,
        reset,
        formState: { errors, isValid, isDirty },
    } = useForm<DogFormValues>({
        resolver: zodResolver(DogSchema),
        defaultValues: {
            name: '',
            breedId: 0,
            breedName: '',
            birthDate: null,
            isBirthDateUnknown: false,
            weight: '',
            gender: undefined,
            neutered: undefined,
            imageFile: null,
            isImageDeleted: false,
            ...initialData,
        },
        mode: 'onChange',
    });

    // 견종 검색 State
    const [breedSearchKeyword, setBreedSearchKeyword] = useState(initialData?.breedName || '');
    const [isBreedListOpen, setIsBreedListOpen] = useState(false);
    const { data: breedList } = useBreedsQuery(breedSearchKeyword);
    const breedInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // initialData 변경 시 폼 업데이트 
    useEffect(() => {
        if (initialData) {
            reset({
                name: '',
                breedId: 0,
                breedName: '',
                birthDate: null,
                isBirthDateUnknown: false,
                weight: '',
                gender: undefined,
                neutered: undefined,
                imageFile: null,
                isImageDeleted: false,
                ...initialData,
            });

            if (initialData.breedName) {
                // eslint-disable-next-line
                setBreedSearchKeyword(initialData.breedName);
            }
            // 데이터 로드 후 유효성 검사 실행 (저장 버튼 활성화 위해)
            trigger();
        }
    }, [initialData, reset, trigger]);

    useEffect(() => {
        if (initialImageUrl) {
            // eslint-disable-next-line
            setImagePreview(initialImageUrl);
        }
    }, [initialImageUrl]);

    const birthDate = useWatch({ control, name: 'birthDate' });
    const isBirthDateUnknown = useWatch({ control, name: 'isBirthDateUnknown' });
    const breedIdValue = useWatch({ control, name: 'breedId' });
    const breedNameValue = useWatch({ control, name: 'breedName' });

    const searchContainerRef = useRef<HTMLDivElement>(null);

    // 기존 데이터에서 breedId가 없을 때, breedName으로 매칭해서 자동 설정
    useEffect(() => {
        if (!breedList || !breedNameValue) return;
        if (breedIdValue && breedIdValue !== 0) return;

        const matched = breedList.find((breed) => breed.name === breedNameValue);
        if (matched) {
            setValue('breedId', matched.breedId, { shouldValidate: true });
        }
    }, [breedList, breedNameValue, breedIdValue, setValue]);

    // 견종 검색 영역 외 클릭 시 초기화
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsBreedListOpen(false);
                if (breedNameValue) {
                    setBreedSearchKeyword(breedNameValue);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [breedNameValue]);

    // 이미지 변경
    const handleImageChange = (file: File | null) => {
        setValue('imageFile', file, { shouldDirty: true });
        if (file) {
            setValue('isImageDeleted', false, { shouldDirty: true }); // 새 파일이 있으면 삭제 아님
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setValue('isImageDeleted', true, { shouldDirty: true }); // 파일이 없으면(삭제) 삭제됨 표시
            setImagePreview(null);
        }
    };

    // 나이 계산
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

    const handleBreedSelect = (id: number, name: string) => {
        setValue('breedId', Number(id), { shouldValidate: true, shouldDirty: true });
        setValue('breedName', name, { shouldValidate: true, shouldDirty: true });
        setBreedSearchKeyword(name);
        setIsBreedListOpen(false);
    };

    const genderMap: { [key: string]: 'MALE' | 'FEMALE' } = {
        '수컷': 'MALE',
        '암컷': 'FEMALE'
    };

    const genderReverseMap: { [key: string]: string } = {
        'MALE': '수컷',
        'FEMALE': '암컷'
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    return (
        <FormWrapper onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
            <Section>
                <ProfileImageUploader
                    imagePreview={imagePreview}
                    onImageChange={handleImageChange}
                    onImageRemove={() => handleImageChange(null)}
                />
            </Section>

            <FieldGroup>
                <Label>이름 <Required>*</Required></Label>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <Input {...field} placeholder="ex) 댕동이" maxLength={15} disabled={isSubmitting} />
                    )}
                />
                {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
            </FieldGroup>

            <FieldGroup>
                <Label>견종 <Required>*</Required></Label>
                <div style={{ position: 'relative' }} ref={searchContainerRef}>
                    <Input
                        value={breedSearchKeyword}
                        onChange={(e) => {
                            const value = e.target.value;

                            setBreedSearchKeyword(value);
                            setIsBreedListOpen(true);
                        }}
                        onFocus={() => {
                            setBreedSearchKeyword('');
                            setIsBreedListOpen(true);
                        }}
                        placeholder="견종 검색 (목록에서 선택해주세요)"
                        disabled={isSubmitting}
                        ref={breedInputRef}
                    />
                    {isBreedListOpen && breedList && breedList.length > 0 && (
                        <BreedList>
                            {breedList.map((breed) => (
                                <BreedItem
                                    key={breed.breedId}
                                    onClick={() => handleBreedSelect(breed.breedId, breed.name)}
                                >
                                    {breed.name}
                                </BreedItem>
                            ))}
                        </BreedList>
                    )}
                </div>
                {errors.breedName && <ErrorText>{errors.breedName.message}</ErrorText>}
                {errors.breedId && <ErrorText>{errors.breedId.message}</ErrorText>}
            </FieldGroup>

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
                            setValue('isBirthDateUnknown', e.target.checked, { shouldDirty: true });
                            if (e.target.checked) {
                                // 모름 체크 시 null로 설정
                                setValue('birthDate', null, { shouldValidate: true, shouldDirty: true });
                            } else {
                                setValue('birthDate', dayjs().format('YYYY-MM-DD'), { shouldValidate: true, shouldDirty: true });
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
                                style={{ pointerEvents: 'none' }}
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
                    setValue('birthDate', date, { shouldDirty: true });
                    trigger('birthDate');
                }}
                initialDate={birthDate || undefined}
            />

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
                                style={{ paddingRight: '40px' }} // kg 텍스트 공간 확보
                            />
                        )}
                    />
                    <UnitSuffix>kg</UnitSuffix>
                </WeightWrapper>
                {errors.weight && <ErrorText>{errors.weight.message}</ErrorText>}
            </FieldGroup>

            <FieldGroup>
                <Label>성별 <Required>*</Required></Label>
                <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                        <SelectDropdown
                            options={['수컷', '암컷']}
                            value={field.value ? genderReverseMap[field.value] : ''}
                            onChange={(val) => {
                                const mappedValue = genderMap[val];
                                if (mappedValue) {
                                    field.onChange(mappedValue);
                                }
                            }}
                            placeholder="성별 선택"
                            disabled={isSubmitting}
                        />
                    )}
                />
                {errors.gender && <ErrorText>{errors.gender.message}</ErrorText>}
            </FieldGroup>

            <FieldGroup>
                <Label>중성화 <Required>*</Required></Label>
                <Controller
                    name="neutered"
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
                {errors.neutered && <ErrorText>{errors.neutered.message}</ErrorText>}
            </FieldGroup>

            <div style={{ height: '80px' }} />

            <SaveButtonWrapper>
                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={!isValid || isSubmitting || !isDirty}
                >
                    저장
                </Button>
            </SaveButtonWrapper>
        </FormWrapper>
    );
}

const Section = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${spacing[2]}px;
`;

const AgeText = styled.span`
  font-size: 13px;
  color: ${colors.gray[500]};
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
  max-width: 400px;
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
