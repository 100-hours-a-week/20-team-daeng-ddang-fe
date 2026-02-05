import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Button } from '@/shared/components/Button/Button';
import { SelectDropdown } from '@/shared/components/SelectDropdown';
import { Input } from '@/shared/components/Input/Input';
import { DogFormValues } from '@/entities/dog/model/types';
import { ProfileImageUploader } from './ProfileImageUploader';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { ScrollDatePicker } from '@/widgets/ScrollDatePicker';
import { FormWrapper, FieldGroup, Label, Required, ErrorText, LabelRow } from '@/shared/styles/FormStyles';
import { DogSchema } from '@/entities/dog/model/schema';
import { getAgeString } from '@/entities/dog/lib/dogUtils';
import { BreedSelector } from './BreedSelector';
import * as S from './styles';

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
            // 데이터 로드 후 유효성 검사 실행 
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
    const breedNameValue = useWatch({ control, name: 'breedName' });
    const breedIdValue = useWatch({ control, name: 'breedId' });

    // 이미지 변경
    const handleImageChange = (file: File | null) => {
        setValue('imageFile', file, { shouldDirty: true });
        if (file) {
            setValue('isImageDeleted', false, { shouldDirty: true });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setValue('isImageDeleted', true, { shouldDirty: true });
            setImagePreview(null);
        }
    };

    const [isDateOpen, setIsDateOpen] = useState(false);

    const handleBreedSelect = (id: number, name: string) => {
        setValue('breedId', Number(id), { shouldValidate: true, shouldDirty: true });
        setValue('breedName', name, { shouldValidate: true, shouldDirty: true });
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
            <S.Section>
                <ProfileImageUploader
                    imagePreview={imagePreview}
                    onImageChange={handleImageChange}
                    onImageRemove={() => handleImageChange(null)}
                />
            </S.Section>

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
                <BreedSelector
                    initialBreedName={breedNameValue}
                    currentBreedId={breedIdValue}
                    onSelect={handleBreedSelect}
                    disabled={isSubmitting}
                />
                {errors.breedName && <ErrorText>{errors.breedName.message}</ErrorText>}
                {errors.breedId && <ErrorText>{errors.breedId.message}</ErrorText>}
            </FieldGroup>

            <FieldGroup>
                <LabelRow>
                    <Label>생년월일 <Required>*</Required></Label>
                    <S.AgeText>{getAgeString(birthDate, isBirthDateUnknown)}</S.AgeText>
                </LabelRow>

                <S.CheckboxWrapper>
                    <input
                        type="checkbox"
                        id="unknown-birth"
                        checked={isBirthDateUnknown}
                        onChange={(e) => {
                            setValue('isBirthDateUnknown', e.target.checked, { shouldDirty: true });
                            if (e.target.checked) {
                                setValue('birthDate', null, { shouldValidate: true, shouldDirty: true });
                            } else {
                                setValue('birthDate', dayjs().format('YYYY-MM-DD'), { shouldValidate: true, shouldDirty: true });
                            }
                            trigger('birthDate');
                        }}
                    />
                    <S.CheckboxLabel htmlFor="unknown-birth">생년월일 모름</S.CheckboxLabel>
                </S.CheckboxWrapper>

                <Controller
                    name="birthDate"
                    control={control}
                    render={({ field }) => (
                        <div onClick={() => !isBirthDateUnknown && !isSubmitting && setIsDateOpen(true)}>
                            <S.StyledDateInput
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
                <S.WeightWrapper>
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
                    <S.UnitSuffix>kg</S.UnitSuffix>
                </S.WeightWrapper>
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

            <S.SaveButtonWrapper>
                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={!isValid || isSubmitting || !isDirty}
                >
                    저장
                </Button>
            </S.SaveButtonWrapper>
        </FormWrapper>
    );
}
