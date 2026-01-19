import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import styled from '@emotion/styled';
import { spacing, colors } from '@/shared/styles/tokens';
import { Button } from '@/shared/components/Button/Button';
import { SelectDropdown } from '@/shared/components/SelectDropdown/SelectDropdown';
import { Input } from '@/shared/components/Input/Input';
import { REGIONS } from '@/shared/data/regions';
import { useEffect, useState } from 'react';

import { UserFormValues } from '@/entities/user/model/types';

// Zod Schema
const UserSchema = z.object({
    email: z.string(),
    province: z.string().min(1, '지역을 선택하세요.'),
    city: z.string().min(1, '시/군/구를 선택하세요.'),
});

interface UserFormProps {
    initialData: UserFormValues;
    onSubmit: (data: UserFormValues) => void;
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
    } = useForm<UserFormValues>({
        resolver: zodResolver(UserSchema),
        defaultValues: initialData,
        mode: 'onChange',
    });

    const selectedProvince = watch('province');
    const [cityOptions, setCityOptions] = useState<string[]>([]);

    // Update city options when province changes
    useEffect(() => {
        if (selectedProvince && REGIONS[selectedProvince]) {
            setCityOptions(REGIONS[selectedProvince]);
        } else {
            setCityOptions([]);
        }
    }, [selectedProvince]);

    // Handle province change: reset city if needed
    const handleProvinceChange = (newProvince: string, onChange: (val: string) => void) => {
        onChange(newProvince);
        setValue('city', ''); // Reset city on province change
    };

    const provinceOptions = Object.keys(REGIONS);

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
                                    disabled={isSubmitting}
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
                                    options={cityOptions}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={isNewUser ? "시/군/구 선택" : "시/군/구"}
                                    disabled={!selectedProvince || isSubmitting}
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
