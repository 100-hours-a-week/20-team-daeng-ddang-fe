import styled from '@emotion/styled';
import { colors } from '@/shared/styles/tokens';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px;
    background-color: #f9fafb;
`;

export const Title = styled.h1`
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 32px;
`;

export const AgreementSection = styled.div`
    width: 100%;
    max-width: 430px;
    background-color: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
`;

export const AgreementItem = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    &:last-child {
        margin-bottom: 0;
    }
`;

export const Checkbox = styled.input`
    width: 20px;
    height: 20px;
    margin-right: 12px;
    cursor: pointer;
    accent-color: ${colors.primary[500]};
`;

export const Label = styled.label`
    font-size: 16px;
    color: #374151;
    cursor: pointer;
    user-select: none;
`;

export const TermsLink = styled.span`
    color: ${colors.primary[600]};
    text-decoration: underline;
    cursor: pointer;
    font-weight: 500;

    &:hover {
        color: ${colors.primary[700]};
    }
`;

export const Required = styled.span`
    color: #ef4444;
    font-weight: 600;
    margin-right: 4px;
`;

export const Optional = styled.span`
    color: #6b7280;
    font-weight: 500;
    margin-right: 4px;
`;

export const SubmitButton = styled.button<{ disabled: boolean }>`
    width: 100%;
    max-width: 430px;
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    color: white;
    background-color: ${props => props.disabled ? '#d1d5db' : colors.primary[500]};
    border: none;
    border-radius: 12px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: background-color 0.2s;

    &:hover {
        background-color: ${props => props.disabled ? '#d1d5db' : colors.primary[600]};
    }

    &:active {
        background-color: ${props => props.disabled ? '#d1d5db' : colors.primary[700]};
    }
`;
