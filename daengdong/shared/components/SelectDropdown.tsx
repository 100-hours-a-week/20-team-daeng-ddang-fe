import styled from '@emotion/styled';
import { colors, radius } from '@/shared/styles/tokens';
import { useState, useRef, useEffect } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: string) => {
    if (disabled) return;
    onChange(option);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <SelectWrapper ref={containerRef}>
      <SelectTrigger
        onClick={toggleDropdown}
        disabled={disabled}
        className={value ? '' : 'placeholder'}
        isOpen={isOpen}
      >
        <span className="text">{value || placeholder || '선택하세요'}</span>
        <ArrowIcon width="12" height="8" viewBox="0 0 12 8" fill="none" className={isOpen ? 'open' : ''}>
          <path d="M1 1.5L6 6.5L11 1.5" stroke={disabled ? colors.gray[200] : colors.gray[500]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </ArrowIcon>
      </SelectTrigger>

      {isOpen && !disabled && (
        <OptionsList>
          {options.map((option) => (
            <OptionItem
              key={option}
              onClick={() => handleSelect(option)}
              isSelected={option === value}
            >
              {option}
            </OptionItem>
          ))}
          {options.length === 0 && (
            <EmptyOption>목록이 없습니다.</EmptyOption>
          )}
        </OptionsList>
      )}
    </SelectWrapper>
  );
}

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SelectTrigger = styled.div<{ disabled?: boolean; isOpen?: boolean }>`
  width: 100%;
  background-color: #FFFFFF;
  border: 1px solid ${({ isOpen }) => (isOpen ? colors.primary[500] : colors.gray[200])};
  border-radius: ${radius.md};
  padding: 14px 16px;
  padding-right: 40px;
  font-size: 16px;
  line-height: 1.5;
  color: ${colors.gray[900]};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    border-color: ${({ disabled }) => (disabled ? colors.gray[200] : colors.primary[500])};
  }

  &.placeholder {
    color: ${colors.gray[500]};
  }

  ${({ disabled }) =>
    disabled &&
    `
    background-color: ${colors.gray[50]};
    color: ${colors.gray[500]};
  `}
`;

const ArrowIcon = styled.svg`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.2s ease;

  &.open {
    transform: translateY(-50%) rotate(180deg);
  }
`;

const OptionsList = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid ${colors.gray[200]};
  border-radius: ${radius.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 240px;
  overflow-y: auto;
  z-index: 100; /* High z-index to float above other elements */
  padding: 0;
  margin: 0;
  list-style: none;
`;

const OptionItem = styled.li<{ isSelected?: boolean }>`
  padding: 12px 16px;
  font-size: 15px;
  color: ${({ isSelected }) => (isSelected ? colors.primary[600] : colors.gray[900])};
  background-color: ${({ isSelected }) => (isSelected ? colors.gray[50] : 'transparent')};
  cursor: pointer;
  transition: background-color 0.1s;

  &:hover {
    background-color: ${colors.gray[50]};
  }

  &:first-of-type {
    border-top-left-radius: ${radius.md};
    border-top-right-radius: ${radius.md};
  }
  
  &:last-of-type {
    border-bottom-left-radius: ${radius.md};
    border-bottom-right-radius: ${radius.md};
  }
`;

const EmptyOption = styled.li`
  padding: 12px 16px;
  font-size: 14px;
  color: ${colors.gray[500]};
  text-align: center;
`;
