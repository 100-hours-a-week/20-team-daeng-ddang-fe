import styled from '@emotion/styled';
import { colors, radius, spacing } from '@/shared/styles/tokens';
import { useState } from 'react';

export const WalkLogForm = () => {
    const [log, setLog] = useState('');

    const handleSubmit = () => {
        console.log('산책 후기 제출:', log);
    };

    return (
        <Container>
            <Label>산책 후기</Label>
            <TextArea
                placeholder="오늘의 산책은 어떠셨나요? 즐거웠던 순간을 기록해주세요!"
                value={log}
                onChange={(e) => setLog(e.target.value)}
            />
            <SubmitButton onClick={handleSubmit}>
                기록 완료
            </SubmitButton>
        </Container>
    );
};

const Container = styled.section`
  margin-top: ${spacing[6]}px;
  display: flex;
  flex-direction: column;
  gap: ${spacing[3]}px;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.gray[900]};
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: ${spacing[4]}px;
  border-radius: ${radius.md};
  border: 1px solid ${colors.gray[200]};
  background-color: ${colors.gray[50]};
  font-size: 14px;
  color: ${colors.gray[900]};
  resize: none;
  outline: none;

  &::placeholder {
    color: ${colors.gray[500]};
  }

  &:focus {
    border-color: ${colors.primary[500]};
    background-color: white;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${spacing[4]}px;
  background-color: ${colors.primary[600]};
  color: white;
  border: none;
  border-radius: ${radius.md};
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${colors.primary[500]};
  }

  &:active {
    background-color: ${colors.primary[700]};
  }
`;
