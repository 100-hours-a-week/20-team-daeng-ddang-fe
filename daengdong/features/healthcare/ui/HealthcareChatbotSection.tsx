import { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { colors, spacing } from "@/shared/styles/tokens";
import Image from "next/image";
import ChatbotImage from "@/shared/assets/images/chatbot.png";
// import fileApi from "@/shared/api/file"; 

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    imageUrl?: string;
    timestamp: Date;
}

const generateId = () => Date.now().toString();

export const HealthcareChatbotSection = () => {
    const [messages, setMessages] = useState<Message[]>(() => [
        {
            id: 'welcome',
            text: '안녕하세요! 반려견 건강에 대해 궁금한 점이 있으신가요? 무엇이든 물어보세요! 🐾',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    // const [selectedFile, setSelectedFile] = useState<File | null>(null); 
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, selectedImage]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
        }
    }, [inputText]);

    // TODO: S3 업로드 API 연동
    /*
    const uploadImage = async (file: File) => {
        try {
            const { presignedUrl, objectKey } = await fileApi.getPresignedUrl("IMAGE", file.type, "CHATBOT");
            await fileApi.uploadFile(presignedUrl, file, file.type);
            return objectKey;
        } catch (error) {
            console.error("Failed to upload image:", error);
            return null;
        }
    };
    */

    const handleSendMessage = async () => {
        if ((!inputText.trim() && !selectedImage) || isLoading) return;

        // NOTE: API 연동 시 사용할 로직
        /*
        let uploadedImageKey = null;
        if (selectedFile) {
            uploadedImageKey = await uploadImage(selectedFile);
            if (!uploadedImageKey) {
                // 업로드 실패 시 토스트 표시 
                return;
            }
        }
        
        // TODO: inputText와 uploadedImageKey로 실제 챗봇 API 호출
        // const response = await chatbotApi.sendMessage({ text: inputText, imageKey: uploadedImageKey });
        */

        const newUserMessage: Message = {
            id: generateId(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
            imageUrl: selectedImage || undefined
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputText("");
        setSelectedImage(null);
        // setSelectedFile(null); 
        setIsLoading(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        // TODO: API 연동 시 제거
        setTimeout(() => {
            const botResponse: Message = {
                id: generateId(),
                text: getMockResponse(newUserMessage.text),
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);
            setIsLoading(false);
        }, 1500);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // setSelectedFile(file); 
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const getMockResponse = (query: string) => {
        if (query.length > 50) {
            return "질문해주신 내용에 대해 자세히 답변해드릴게요. 반려견의 건강은 매우 중요합니다. \n\n" +
                "1. 식습관: 규칙적인 식사가 중요해요.\n" +
                "2. 운동: 매일 산책을 시켜주세요.\n" +
                "3. 정기 검진: 1년에 한 번은 꼭 병원에 가세요.\n\n" +
                "이 외에도 평소 행동을 잘 관찰하는 것이 중요합니다. 혹시 더 궁금한 점이 있으신가요? " +
                "추가적인 질문이 있다면 언제든지 말씀해주세요. 최대한 상세하게 답변해 드리겠습니다. " +
                "반려견과 함께하는 행복한 시간을 위해 제가 도울 수 있는 부분은 최선을 다해 돕겠습니다. " +
                "건강한 반려견 생활을 응원합니다!";
        }
        return "네, 알겠습니다. 해당 증상은 병원 방문을 권장드립니다.";
    };

    return (
        <Container>
            <NoticeBar>
                ⚠️ 채팅 기록은 저장되지 않으며, 화면을 나가면 사라집니다.
            </NoticeBar>
            <ChatList ref={scrollRef}>
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && (
                    <BotMessageWrapper>
                        <Avatar>
                            <Image src={ChatbotImage} alt="bot" width={48} height={48} style={{ objectFit: 'contain' }} />
                        </Avatar>
                        <LoadingBubble>
                            <Dot />
                            <Dot />
                            <Dot />
                        </LoadingBubble>
                    </BotMessageWrapper>
                )}
            </ChatList>

            <InputArea>
                {selectedImage && (
                    <ThumbnailPreview>
                        <Image src={selectedImage} alt="preview" width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} />
                        <RemoveImageButton onClick={() => {
                            setSelectedImage(null);
                            // setSelectedFile(null); 
                        }}>✕</RemoveImageButton>
                    </ThumbnailPreview>
                )}

                <InputWrapper isFocused={isInputFocused || inputText.length > 0}>
                    <AddImageButton onClick={() => fileInputRef.current?.click()}>
                        +
                    </AddImageButton>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleImageSelect}
                    />

                    <StyledTextarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => {
                            if (e.target.value.length <= 200) {
                                setInputText(e.target.value);
                            }
                        }}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder="메시지를 입력하세요"
                        rows={1}
                    />

                    <SendButton
                        disabled={(!inputText.trim() && !selectedImage) || isLoading}
                        isActive={!!inputText.trim() || !!selectedImage}
                        onClick={handleSendMessage}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
                        </svg>
                    </SendButton>
                </InputWrapper>
                <CharacterCount>
                    {inputText.length} / 200
                </CharacterCount>
            </InputArea>
        </Container>
    );
};

const MessageBubble = ({ message }: { message: Message }) => {
    const isBot = message.sender === 'bot';
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = isBot && message.text?.length > 200;

    const displayText = shouldTruncate && !isExpanded
        ? message.text.slice(0, 200) + "... "
        : message.text;

    if (isBot) {
        return (
            <BotMessageWrapper>
                <Avatar>
                    <Image src={ChatbotImage} alt="bot" width={48} height={48} style={{ objectFit: 'contain' }} />
                </Avatar>
                <BubbleContent>
                    <Text>{displayText}</Text>
                    {shouldTruncate && (
                        <ExpandButton onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? (
                                <>접기 <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></>
                            ) : (
                                <>답변 전체보기 <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></>
                            )}
                        </ExpandButton>
                    )}
                </BubbleContent>
            </BotMessageWrapper>
        );
    }

    return (
        <UserMessageWrapper>
            <UserBubble>
                {message.imageUrl && (
                    <ImageMessage>
                        <Image src={message.imageUrl} alt="user upload" width={150} height={150} style={{ objectFit: 'cover', borderRadius: 8 }} />
                    </ImageMessage>
                )}
                {message.text && <Text isUser>{message.text}</Text>}
            </UserBubble>
        </UserMessageWrapper>
    );
};

// Styles
const Container = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0; /* Important for nested flex scrolling */
    overflow: hidden;
    background-color: ${colors.gray[50]};
    position: relative;
`;

const NoticeBar = styled.div`
    background-color: ${colors.primary[50]};
    color: ${colors.primary[600]};
    font-size: 12px;
    padding: 8px 16px;
    text-align: center;
    border-bottom: 1px solid ${colors.primary[100]};
`;

const ChatList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: ${spacing[4]}px;
    display: flex;
    flex-direction: column;
    gap: ${spacing[4]}px;
    padding-bottom: 20px; 

    /* Hide scrollbar */
    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
`;

const BotMessageWrapper = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${spacing[3]}px;
    max-width: 85%;
`;

const UserMessageWrapper = styled.div`
    display: flex;
    justify-content: flex-end;
    align-self: flex-end;
    max-width: 85%;
`;

const Avatar = styled.div`
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    object-fit: contain;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
`;

const BubbleContent = styled.div`
    background-color: white;
    padding: ${spacing[3]}px ${spacing[4]}px;
    border-radius: 4px 20px 20px 20px;
    font-size: 13px;
    line-height: 1.6;
    color: ${colors.gray[800]};
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

const UserBubble = styled.div`
    background-color: ${colors.primary[500]};
    padding: ${spacing[3]}px ${spacing[4]}px;
    border-radius: 20px 20px 4px 20px;
    color: white;
    font-size: 13px;
    line-height: 1.6;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const ImageMessage = styled.div`
    margin-bottom: 4px;
`;

const Text = styled.p<{ isUser?: boolean }>`
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    color: ${({ isUser }) => isUser ? 'white' : colors.gray[800]};
`;

const ExpandButton = styled.button`
    background-color: ${colors.gray[100]};
    border: 1px solid ${colors.gray[300]};
    color: ${colors.gray[700]};
    font-size: 12px;
    font-weight: 500;
    padding: 6px 12px;
    margin-top: ${spacing[3]}px;
    cursor: pointer;
    border-radius: 16px;
    align-self: center;
    width: 100%;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    &:hover {
        background-color: ${colors.gray[200]};
    }
`;

const LoadingBubble = styled.div`
    background-color: white;
    padding: ${spacing[3]}px;
    border-radius: 4px 20px 20px 20px;
    display: flex;
    gap: 4px;
    align-items: center;
    height: 48px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

const Dot = styled.div`
    width: 6px;
    height: 6px;
    background-color: ${colors.gray[400]};
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-of-type(1) { animation-delay: -0.32s; }
    &:nth-of-type(2) { animation-delay: -0.16s; }
    
    @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }
`;

const InputArea = styled.div`
    background-color: white;
    padding: ${spacing[3]}px;
    padding-bottom: calc(${spacing[3]}px + env(safe-area-inset-bottom));
    border-top: 1px solid ${colors.gray[100]};
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 10;
`;

const InputWrapper = styled.div<{ isFocused: boolean }>`
    display: flex;
    align-items: flex-end;
    border: 1px solid ${({ isFocused }) => isFocused ? colors.primary[500] : colors.gray[300]};
    border-radius: 24px;
    padding: 8px 12px;
    background-color: white;
    gap: 8px;
    transition: all 0.2s;
`;

const StyledTextarea = styled.textarea`
    flex: 1;
    border: none;
    outline: none;
    font-size: 13px;
    padding: 4px 0;
    background: transparent;
    resize: none;
    max-height: 100px;
    line-height: 1.5;
    font-family: inherit;

    &::placeholder {
        color: ${colors.gray[400]};
    }
`;

const AddImageButton = styled.button`
    background: ${colors.gray[100]};
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${colors.gray[600]};
    font-size: 20px;
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 0.2s;
    
    &:hover {
        background: ${colors.gray[200]};
    }
`;

const SendButton = styled.button<{ isActive: boolean }>`
    background-color: ${({ isActive }) => isActive ? colors.primary[500] : colors.gray[200]};
    color: ${({ isActive }) => isActive ? 'white' : colors.gray[500]};
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: ${({ isActive }) => isActive ? 'pointer' : 'default'};
    transition: all 0.2s;
    flex-shrink: 0;
    padding: 6px;
`;

const ThumbnailPreview = styled.div`
    position: relative;
    width: fit-content;
    margin-left: 12px;
    margin-bottom: 4px;
`;

const RemoveImageButton = styled.button`
    position: absolute;
    top: -6px;
    right: -6px;
    background: ${colors.gray[800]};
    color: white;
    border: none;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const CharacterCount = styled.div`
    font-size: 11px;
    color: ${colors.gray[400]};
    text-align: right;
    padding-right: 12px;
`;
