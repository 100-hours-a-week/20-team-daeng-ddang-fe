import styled from '@emotion/styled';
import { colors, radius, spacing } from '@/shared/styles/tokens';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useWriteWalkDiary } from '@/features/walk/model/useWalkMutations';

export const WalkLogForm = () => {
  const [log, setLog] = useState('');
  const MAX_LENGTH = 500;
  const router = useRouter();
  const { walkId } = useParams();
  const { showToast } = useToastStore();
  const { mutate: writeDiary } = useWriteWalkDiary();

  const handleSubmit = () => {
    if (!walkId) return;

    writeDiary(
      { walkId: Number(walkId), memo: log },
      {
        onSuccess: () => {
          showToast({
            message: '산책일지가 작성되었습니다.',
            type: 'success',
            duration: 2000,
          });
          router.push('/walk');
        },
      }
    );
  };

  return (
    <Container>
      <Label>산책 후기</Label>
      <TextAreaWrapper>
        <TextArea
          placeholder="오늘의 산책은 어떠셨나요? 즐거웠던 순간을 기록해주세요!"
          value={log}
          onChange={(e) => {
            if (e.target.value.length <= MAX_LENGTH) {
              setLog(e.target.value);
            }
          }}
          maxLength={MAX_LENGTH}
        />
        <CharCounter isLimit={log.length >= MAX_LENGTH}>
          {log.length}/{MAX_LENGTH}
        </CharCounter>
      </TextAreaWrapper>
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

const TextAreaWrapper = styled.div`
  position: relative;
  width: 100%;
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

const CharCounter = styled.div<{ isLimit: boolean }>`
  position: absolute;
  bottom: ${spacing[2]}px;
  right: ${spacing[3]}px;
  font-size: 12px;
  color: ${props => props.isLimit ? colors.semantic.error : colors.gray[500]};
  pointer-events: none;
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
