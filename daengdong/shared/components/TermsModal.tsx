"use client";

import styled from '@emotion/styled';
import ReactMarkdown from 'react-markdown';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

export const TermsModal = ({ isOpen, onClose, title, content }: TermsModalProps) => {
    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <Header>
                    <Title>{title}</Title>
                    <CloseButton onClick={onClose}>✕</CloseButton>
                </Header>
                <Content>
                    <ReactMarkdown>{content}</ReactMarkdown>
                </Content>
            </ModalContainer>
        </Overlay>
    );
};

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContainer = styled.div`
    background-color: white;
    border-radius: 16px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h2`
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 0;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 24px;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f3f4f6;
    }
`;

const Content = styled.div`
    padding: 24px;
    overflow-y: auto;
    flex: 1;

    h1 {
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 16px 0;
        color: #111827;
    }

    h2 {
        font-size: 16px;
        font-weight: 600;
        margin: 24px 0 12px 0;
        color: #374151;
    }

    h3 {
        font-size: 14px;
        font-weight: 600;
        margin: 16px 0 8px 0;
        color: #4b5563;
    }

    p {
        font-size: 14px;
        line-height: 1.6;
        color: #6b7280;
        margin: 8px 0;
    }

    ul, ol {
        font-size: 14px;
        line-height: 1.6;
        color: #6b7280;
        margin: 8px 0;
        padding-left: 24px;
    }

    li {
        margin: 4px 0;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
        font-size: 14px;
    }

    th, td {
        border: 1px solid #e5e7eb;
        padding: 8px 12px;
        text-align: left;
    }

    th {
        background-color: #f9fafb;
        font-weight: 600;
        color: #374151;
    }

    td {
        color: #6b7280;
    }

    strong {
        font-weight: 600;
        color: #374151;
    }
`;
