import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import styled from '@emotion/styled';
import { spacing, colors } from '@/shared/styles/tokens';
import { Button } from '@/shared/components/Button/Button';
import { SelectDropdown } from '@/shared/components/SelectDropdown';
import { useState } from 'react';
import { useRegionsQuery } from '@/features/user/api/useRegionsQuery';

import { UserFormValues } from '@/entities/user/model/types';
import { FormWrapper, FieldGroup, Label, ErrorText } from '@/shared/styles/FormStyles';

const UserSchema = z.object({
    province: z.string().min(1, '지역을 선택하세요.'),
    city: z.string().min(1, '시/군/구를 선택하세요.'),
    regionId: z.number().min(1, '유효한 지역을 선택하세요.'),
});

interface UserFormProps {
    initialData: UserFormValues;
    onSubmit: (data: UserFormValues & { regionId: number, province: string, city: string }) => void;
    onWithdraw: () => void;
    isSubmitting: boolean;
    isNewUser: boolean;
    initialParentRegionId?: number;
    initialRegionId?: number;
    kakaoEmail?: string;
}

export function UserForm({ initialData, onSubmit, onWithdraw, isSubmitting, isNewUser, initialParentRegionId, initialRegionId, kakaoEmail }: UserFormProps) {
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, isValid, isDirty },
    } = useForm<UserFormValues & { regionId: number }>({
        resolver: zodResolver(UserSchema),
        defaultValues: { ...initialData, regionId: initialRegionId || 0 },
        mode: 'onChange',
    });

    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(initialParentRegionId || null);

    const { data: provinces } = useRegionsQuery();
    const { data: districts } = useRegionsQuery(selectedProvinceId ?? undefined);

    const provinceOptions = provinces?.map(p => p.name) || [];
    const districtOptions = districts?.map(d => d.name) || [];

    const handleProvinceChange = (provinceName: string, onChange: (val: string) => void) => {
        onChange(provinceName);
        setValue('city', '', { shouldValidate: true });
        setValue('regionId', 0, { shouldValidate: true });

        const province = provinces?.find(p => p.name === provinceName);
        setSelectedProvinceId(province ? province.regionId : null);
    };

    const handleCityChange = (cityName: string, onChange: (val: string) => void) => {
        onChange(cityName);

        const district = districts?.find(d => d.name === cityName);
        if (district) {
            setValue('regionId', district.regionId, { shouldValidate: true });
        }
    };

    return (
        <FormWrapper onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
                <Label>이메일</Label>
                <ReadOnlyInput value={kakaoEmail || ''} disabled />
            </FieldGroup>

            <FieldGroup>
                <Label>사는 곳</Label>

                <DropdownRow>
                    <DropdownContainer>
                        <Controller
                            name="province"
                            control={control}
                            render={({ field }) => (
                                <SelectDropdown
                                    options={provinceOptions}
                                    value={field.value}
                                    onChange={(val) => handleProvinceChange(val, field.onChange)}
                                    placeholder={isNewUser ? "시/도 선택" : "시/도"}
                                    disabled={isSubmitting || !provinces}
                                />
                            )}
                        />
                        {errors.province && <ErrorText>{errors.province.message}</ErrorText>}
                    </DropdownContainer>

                    <DropdownContainer>
                        <Controller
                            name="city"
                            control={control}
                            render={({ field }) => (
                                <SelectDropdown
                                    options={districtOptions}
                                    value={field.value}
                                    onChange={(val) => handleCityChange(val, field.onChange)}
                                    placeholder={isNewUser ? "시/군/구 선택" : "시/군/구"}
                                    disabled={!selectedProvinceId || isSubmitting}
                                />
                            )}
                        />
                        {errors.city && <ErrorText>{errors.city.message}</ErrorText>}
                    </DropdownContainer>
                </DropdownRow>
            </FieldGroup>

            <ButtonGroup>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={!isValid || isSubmitting || !isDirty}
                    fullWidth
                >
                    {isSubmitting ? '저장 중...' : '저장하기'}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    onClick={onWithdraw}
                    disabled={isSubmitting}
                    style={{ color: colors.gray[500], fontSize: '14px' }}
                >
                    회원 탈퇴하기
                </Button>
            </ButtonGroup>
        </FormWrapper>
    );
}



const DropdownRow = styled.div`
  display: flex;
  gap: ${spacing[3]}px;
  width: 100%;
`;

const DropdownContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; 
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[4]}px;
  margin-top: ${spacing[8]}px;
`;

const ReadOnlyInput = styled.input`
  width: 100%;
  padding: ${spacing[3]}px;
  background-color: ${colors.gray[200]};
  border: 1px solid ${colors.gray[200]};
  border-radius: 8px;
  color: ${colors.gray[900]};
  font-size: 14px;
  outline: none;
`;
