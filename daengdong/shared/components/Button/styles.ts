import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { colors, radius, spacing } from '@/shared/styles/tokens';
import { ButtonVariant, ButtonSize } from './types';

// Helper to get spacing value directly if needed, relying on tokens export
const getSpacing = (index: number) => `${spacing[index]}px`;

const variantStyles = (variant: ButtonVariant = 'primary') => {
    switch (variant) {
        case 'primary':
            return css`
        background-color: ${colors.primary[500]};
        color: #fff;
        border: 1px solid transparent;
        &:hover:not(:disabled) {
          background-color: ${colors.primary[600]};
        }
        &:active:not(:disabled) {
          background-color: ${colors.primary[700]};
        }
      `;
        case 'secondary':
            return css`
        background-color: ${colors.gray[50]}; // Light gray bg
        color: ${colors.primary[500]};
        border: 1px solid ${colors.primary[500]};
        &:hover:not(:disabled) {
          background-color: ${colors.gray[200]};
        }
        &:active:not(:disabled) {
          background-color: ${colors.gray[200]}; // Or a darker shade
          opacity: 0.8;
        }
      `;
        case 'ghost':
            return css`
        background-color: transparent;
        color: ${colors.primary[500]};
        border: 1px solid transparent;
        &:hover:not(:disabled) {
          background-color: ${colors.gray[50]};
        }
        &:active:not(:disabled) {
          background-color: ${colors.gray[200]};
        }
      `;
        case 'danger':
            return css`
        background-color: ${colors.semantic.error};
        color: #fff;
        border: 1px solid transparent;
        &:hover:not(:disabled) {
          opacity: 0.9;
        }
        &:active:not(:disabled) {
          opacity: 0.8;
        }
      `;
        case 'success':
            return css`
        background-color: ${colors.semantic.success};
        color: #fff;
        border: 1px solid transparent;
        &:hover:not(:disabled) {
          opacity: 0.9;
        }
        &:active:not(:disabled) {
          opacity: 0.8;
        }
      `;
        default:
            return css``;
    }
};

const sizeStyles = (size: ButtonSize = 'md') => {
    switch (size) {
        case 'sm':
            return css`
        height: 36px;
        padding: 0 ${getSpacing(3)}; // spacing[3] = 12px
        font-size: 13px;
      `;
        case 'md':
            return css`
        height: 44px;
        padding: 0 ${getSpacing(4)}; // spacing[4] = 16px
        font-size: 15px;
      `;
        case 'lg':
            return css`
        height: 52px;
        padding: 0 ${getSpacing(5)}; // spacing[5] = 20px
        font-size: 16px;
      `;
        default:
            return css``;
    }
};

export const StyledButton = styled.button<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${radius.md}; // Default radius from tokens (8px/12px) - Request said tokens.radius.md
  cursor: pointer;
  font-weight: 600; // Usually buttons are bold/semibold
  transition: all 0.2s ease-in-out;
  outline: none;
  white-space: nowrap; // Prevent text wrapping

  // Apply variant styles
  ${({ variant }) => variantStyles(variant)}

  // Apply size styles
  ${({ size }) => sizeStyles(size)}

  // Full Width
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  // Disabled state
  &:disabled {
    opacity: 0.6;
    pointer-events: none;
    cursor: not-allowed;
  }
`;

export const IconContainer = styled.span<{ position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  ${({ position }) =>
        position === 'left'
            ? css`
          margin-right: ${getSpacing(2)}; // spacing[2] = 8px; Gap requirement
        `
            : css`
          margin-left: ${getSpacing(2)}; // spacing[2] = 8px; Gap requirement
        `}
`;
