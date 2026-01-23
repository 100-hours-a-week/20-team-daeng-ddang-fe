'use client';

import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { WalkWebSocketClient } from '@/shared/lib/websocket/WalkWebSocketClient';
import { ServerMessage } from '@/shared/lib/websocket/types';
import { ENV } from '@/shared/config/env';

export function WebSocketTest() {
    const [client, setClient] = useState<WalkWebSocketClient | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<ServerMessage[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        try {
            setError(null);
            const baseUrl = ENV.API_BASE_URL || 'http://localhost:8080';

            const newClient = new WalkWebSocketClient(
                baseUrl,
                (message) => {
                    console.log('📨 메시지 수신:', message);
                    setMessages((prev) => [...prev, message]);
                },
                (err) => {
                    console.error('❌ 에러:', err);
                    setError(err.message);
                }
            );

            await newClient.connect(999); // 테스트용 walkId
            setClient(newClient);
            setIsConnected(true);
            console.log('✅ 연결 성공!');
        } catch (err: any) {
            setError(err.message);
            setIsConnected(false);
        }
    };

    const handleDisconnect = () => {
        if (client) {
            client.disconnect();
            setClient(null);
            setIsConnected(false);
            setMessages([]);
            console.log('🔌 연결 해제');
        }
    };

    const handleSubscribe = () => {
        if (client && isConnected) {
            // 테스트용 구독 (regionId: 1, cellId: "0_0")
            client.subscribeToRegionCell(1, '0_0', (message) => {
                console.log('📡 채널 메시지:', message);
            });
        }
    };

    const handleSendLocation = () => {
        if (client && isConnected) {
            // 테스트용 위치 전송
            client.sendLocation(37.39421, 127.11142);
            console.log('📤 위치 전송 완료');
        }
    };

    useEffect(() => {
        return () => {
            if (client) {
                client.disconnect();
            }
        };
    }, [client]);

    return (
        <Container>
            <Title>WebSocket 연결 테스트</Title>

            <StatusSection>
                <StatusLabel>연결 상태:</StatusLabel>
                <Status isConnected={isConnected}>
                    {isConnected ? '🟢 연결됨' : '🔴 연결 안됨'}
                </Status>
            </StatusSection>

            {error && (
                <ErrorBox>
                    ❌ 에러: {error}
                </ErrorBox>
            )}

            <ButtonGroup>
                <Button onClick={handleConnect} disabled={isConnected}>
                    연결하기
                </Button>
                <Button onClick={handleDisconnect} disabled={!isConnected}>
                    연결 해제
                </Button>
                <Button onClick={handleSubscribe} disabled={!isConnected}>
                    채널 구독
                </Button>
                <Button onClick={handleSendLocation} disabled={!isConnected}>
                    위치 전송
                </Button>
            </ButtonGroup>

            <MessagesSection>
                <MessagesTitle>수신 메시지 ({messages.length})</MessagesTitle>
                <MessagesList>
                    {messages.map((msg, index) => (
                        <MessageItem key={index}>
                            <MessageType>{msg.type}</MessageType>
                            <MessageData>{JSON.stringify(msg, null, 2)}</MessageData>
                        </MessageItem>
                    ))}
                </MessagesList>
            </MessagesSection>
        </Container>
    );
}

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const StatusLabel = styled.span`
  font-weight: 600;
`;

const Status = styled.span<{ isConnected: boolean }>`
  color: ${props => props.isConnected ? '#22c55e' : '#ef4444'};
  font-weight: 600;
`;

const ErrorBox = styled.div`
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const MessagesSection = styled.div`
  margin-top: 30px;
`;

const MessagesTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
`;

const MessageItem = styled.div`
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
`;

const MessageType = styled.div`
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 8px;
`;

const MessageData = styled.pre`
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
`;
