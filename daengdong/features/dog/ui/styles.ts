import styled from '@emotion/styled';
import { spacing, colors, radius } from '@/shared/styles/tokens';

export const Section = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${spacing[2]}px;
`;

export const AgeText = styled.span`
  font-size: 13px;
  color: ${colors.gray[500]};
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

export const CheckboxLabel = styled.label`
  font-size: 14px;
  color: ${colors.gray[700]};
  cursor: pointer;
`;

export const StyledDateInput = styled.input<{ isPlaceholder?: boolean }>`
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

export const WeightWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const UnitSuffix = styled.span`
  position: absolute;
  right: 16px;
  color: ${colors.gray[500]};
  font-size: 14px;
`;

export const SaveButtonWrapper = styled.div`
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


