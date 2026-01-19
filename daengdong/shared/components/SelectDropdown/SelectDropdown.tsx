import styled from '@emotion/styled';
import { colors, radius, spacing } from '@/shared/styles/tokens';
import { ChangeEvent } from 'react';

interface SelectDropdownProps {
  options: string[];
  value: string;
  placeholder?: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
}

export function SelectDropdown({
  options,
  value,
  placeholder,
  onChange,
  disabled
}: SelectDropdownProps) {

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <SelectWrapper>
      <Select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={value === '' ? 'placeholder' : ''}
      >
        <option value="" disabled hidden>
          {placeholder || '선택하세요'}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <ArrowIcon width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1.5L6 6.5L11 1.5" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </ArrowIcon>
    </SelectWrapper>
  );
}

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Select = styled.select`
  width: 100%;
  appearance: none;
  background-color: #FFFFFF;
  border: 1px solid ${colors.gray[200]};
  border-radius: ${radius.md};
  padding: 14px 16px;
  padding-right: 40px;
  font-size: 16px;
  line-height: 1.5;
  color: ${colors.gray[900]};
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:focus {
    border-color: ${colors.primary[500]};
  }

  &:disabled {
    background-color: ${colors.gray[50]};
    color: ${colors.gray[500]};
    cursor: not-allowed;
  }

  &.placeholder {
    color: ${colors.gray[500]};
  }
`;

const ArrowIcon = styled.svg`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  
  path {
    transition: stroke 0.2s;
  }
`;
