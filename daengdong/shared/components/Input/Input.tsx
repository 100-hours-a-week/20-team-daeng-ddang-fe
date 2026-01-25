import styled from '@emotion/styled';
import { colors, radius, spacing } from '@/shared/styles/tokens';
import { InputHTMLAttributes, forwardRef } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ disabled, ...props }, ref) => {
    return (
      <InputBase
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

const InputBase = styled.input`
  width: 100%;
  background-color: ${colors.gray[50]};
  border: 1px solid ${colors.gray[200]};
  border-radius: ${radius.md};
  padding: ${spacing[3]}px;
  font-size: 16px;
  color: ${colors.gray[900]};
  outline: none;

  &:focus {
    border-color: ${colors.primary[500]};
  }

  &:disabled {
    background-color: ${colors.gray[200]};
    color: ${colors.gray[500]};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${colors.gray[500]};
  }
`;
