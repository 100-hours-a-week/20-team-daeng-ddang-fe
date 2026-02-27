"use client";

import styled from '@emotion/styled';

interface UploadProgressIndicatorProps {
    progress: number; // 0-100
}

export const UploadProgressIndicator = ({ progress }: UploadProgressIndicatorProps) => {
    return (
        <Container>
            <ProgressBar>
                <ProgressFill progress={progress} />
            </ProgressBar>
            <ProgressText>{Math.round(progress)}%</ProgressText>
        </Container>
    );
};

const Container = styled.div`
  width: 100%;
  max-width: 400px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  text-align: center;
  font-size: 14px;
  color: #666;
  font-weight: 600;
`;
