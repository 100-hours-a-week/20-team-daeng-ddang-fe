import React from 'react';
import { ButtonProps } from './types';
import { StyledButton, IconContainer } from './styles';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            fullWidth = false,
            leftIcon,
            rightIcon,
            disabled,
            type = 'button',
            ...props
        },
        ref
    ) => {
        return (
            <StyledButton
                ref={ref}
                variant={variant}
                size={size}
                fullWidth={fullWidth}
                disabled={disabled}
                type={type}
                {...props}
            >
                {leftIcon && <IconContainer position="left">{leftIcon}</IconContainer>}
                {children}
                {rightIcon && <IconContainer position="right">{rightIcon}</IconContainer>}
            </StyledButton>
        );
    }
);

Button.displayName = 'Button';
