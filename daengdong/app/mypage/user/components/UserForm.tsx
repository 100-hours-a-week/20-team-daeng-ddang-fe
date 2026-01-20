import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import styled from '@emotion/styled';
import { spacing, colors } from '@/shared/styles/tokens';
import { Button } from '@/shared/components/Button/Button';
import { SelectDropdown } from '@/shared/components/SelectDropdown/SelectDropdown';
import { Input } from '@/shared/components/Input/Input';
import { useEffect, useState } from 'react';
import { useRegionsQuery } from '@/features/user/api/useRegionsQuery';

import { UserFormValues } from '@/entities/user/model/types';

// Zod Schema
const UserSchema = z.object({
    email: z.string(),
    province: z.string().min(1, '지역을 선택하세요.'), // Stores name for display/validation
    city: z.string().min(1, '시/군/구를 선택하세요.'),   // Stores name for display/validation
    regionId: z.number().min(1, '유효한 지역을 선택하세요.'), // Stores actual ID
});

interface UserFormProps {
    initialData: UserFormValues;
    onSubmit: (data: UserFormValues & { regionId: number, province: string, city: string }) => void;
    onWithdraw: () => void;
    isSubmitting: boolean;
    isNewUser: boolean;
}

export function UserForm({ initialData, onSubmit, onWithdraw, isSubmitting, isNewUser }: UserFormProps) {
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid },
    } = useForm<UserFormValues & { regionId: number }>({
        resolver: zodResolver(UserSchema),
        defaultValues: { ...initialData, regionId: 0 },
        mode: 'onChange',
    });

    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);

    // Regions Query
    const { data: provinces } = useRegionsQuery(); // Top level (City/Do)
    const { data: districts } = useRegionsQuery(selectedProvinceId ?? undefined); // Sub level (Gu/Gun)

    // Maps for Dropdowns
    // SelectDropdown expects options as strings currently. 
    // We need to map back and forth between Name and ID since Dropdown is simple.
    // Ideally SelectDropdown should accept objects, but adapting to current simple UI.

    // Convert Regions to String Options
    const provinceOptions = provinces?.map(p => p.name) || [];
    const districtOptions = districts?.map(d => d.name) || [];

    const handleProvinceChange = (provinceName: string, onChange: (val: string) => void) => {
        onChange(provinceName);
        setValue('city', '');
        setValue('regionId', 0); // Reset final ID

        // Find ID
        const province = provinces?.find(p => p.name === provinceName);
        setSelectedProvinceId(province ? province.regionId : null);
    };

    const handleCityChange = (cityName: string, onChange: (val: string) => void) => {
        onChange(cityName);

        // Find ID and set regionId
        const district = districts?.find(d => d.name === cityName);
        if (district) {
            setValue('regionId', district.regionId);
        }
    };

    return (
        <FormWrapper onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
                <Label>이메일</Label>
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <Input {...field} disabled={true} /> // Email is readonly
                    )}
                />
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
                    disabled={!isValid || isSubmitting}
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

const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing[6]}px;
  width: 100%;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[3]}px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.gray[900]};
`;

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

const ErrorText = styled.span`
  color: ${colors.semantic.error};
  font-size: 12px;
  margin-top: ${spacing[1]}px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[4]}px;
  margin-top: ${spacing[8]}px;
`;
