import styled from '@emotion/styled';
import { spacing, colors } from '@/shared/styles/tokens';

export const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing[6]}px;
  width: 100%;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[2]}px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.gray[900]};
`;

export const Required = styled.span`
  color: ${colors.semantic.error};
  margin-left: 2px;
`;

export const ErrorText = styled.span`
  color: ${colors.semantic.error};
  font-size: 12px;
  margin-top: 4px;
`;

export const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
