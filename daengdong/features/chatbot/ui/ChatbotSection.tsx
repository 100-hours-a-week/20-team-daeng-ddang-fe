import { memo, useState } from "react";
import styled from "@emotion/styled";
import { colors, spacing } from "@/shared/styles/tokens";
import Image from "next/image";
import ChatbotImage from "@/shared/assets/images/chatbot.png";
import { useChatbot, Message } from "@/features/chatbot/model/useChatbot";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const ChatbotSection = () => {
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(true);
    const {
        isAvailable,
        conversationId,
        sessionError,
        messages,
        inputText,
        setInputText,
        selectedImage,
        isInputFocused,
        setIsInputFocused,
        isLoading,
        hasNewMessage,
        scrollRef,
        textareaRef,
        fileInputRef,
        scrollToBottom,
        handleScroll,
        handleSendMessage,
        handleFollowupClick,
        handleImageSelect,
        clearImage,
    } = useChatbot();

    return (
        <Container>
            <ReopenNoticeButton onClick={() => setIsPolicyModalOpen(true)} aria-label="중요 안내 다시보기">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 10v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="7" r="1.2" fill="currentColor" />
                </svg>
            </ReopenNoticeButton>
            {isPolicyModalOpen && (
                <PolicyOverlay>
                    <PolicyModal>
                        <PolicyTitle>챗봇 사용 안내</PolicyTitle>
                        <PolicyList>
                            <PolicyItem>
                                <PolicyIcon>🗑️</PolicyIcon>
                                <PolicyText>
                                    <PolicyLine>채팅 기록은 저장되지 않습니다.</PolicyLine>
                                    <PolicyLine>화면을 나가면 사라집니다.</PolicyLine>
                                </PolicyText>
                            </PolicyItem>
                            <PolicyItem>
                                <PolicyIcon>🏥</PolicyIcon>
                                <PolicyText>
                                    <PolicyLine>의료 정보는 참고용이며 정확하지 않을 수 있습니다.</PolicyLine>
                                    <PolicyLine>증상이 있거나 걱정되면 병원 진료를 받아주세요.</PolicyLine>
                                </PolicyText>
                            </PolicyItem>
                        </PolicyList>
                        <PolicyConfirmButton onClick={() => setIsPolicyModalOpen(false)}>
                            확인
                        </PolicyConfirmButton>
                    </PolicyModal>
                </PolicyOverlay>
            )}
            <ChatList ref={scrollRef} onScroll={handleScroll}>
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} onFollowupClick={handleFollowupClick} />
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

            {/* 위로 스크롤 중일 때 새 메시지 도착 알림 버튼 */}
            {hasNewMessage && (
                <NewMessageButton onClick={scrollToBottom}>
                    새 메시지 ↓
                </NewMessageButton>
            )}

            <InputArea>
                {selectedImage && (
                    <ThumbnailPreview>
                        <Image src={selectedImage} alt="preview" width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} />
                        <RemoveImageButton onClick={clearImage}>✕</RemoveImageButton>
                    </ThumbnailPreview>
                )}

                <InputWrapper isFocused={isInputFocused || inputText.length > 0}>
                    {/* 1단계 배포 버전에선 이미지 업로드 기능 비활성화 */}
                    {false && (
                        <>
                            <AddImageButton onClick={() => fileInputRef.current?.click()}>+</AddImageButton>
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageSelect} />
                        </>
                    )}

                    <StyledTextarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => { if (e.target.value.length <= 200) setInputText(e.target.value); }}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder={!isAvailable ? "오후 1시부터 9시까지 이용 가능합니다." : sessionError ? "세션 오류로 사용 불가" : conversationId ? "메시지를 입력하세요" : "세션 연결 중..."}
                        rows={1}
                        disabled={!isAvailable || !conversationId || sessionError}
                    />

                    <SendButton
                        disabled={(!inputText.trim() && !selectedImage) || isLoading || !isAvailable || !conversationId || sessionError}
                        isActive={!!(inputText.trim() || selectedImage) && isAvailable && !!conversationId && !sessionError}
                        onClick={handleSendMessage}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
                        </svg>
                    </SendButton>
                </InputWrapper>
                <CharacterCount>{inputText.length} / 200</CharacterCount>
            </InputArea>
        </Container>
    );
};

const MessageBubble = memo(function MessageBubble({
    message,
    onFollowupClick
}: {
    message: Message;
    onFollowupClick: (q: string) => void;
}) {
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
                    <MarkdownContainer>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {displayText}
                        </ReactMarkdown>
                    </MarkdownContainer>
                    {shouldTruncate && (
                        <ExpandButton onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? (
                                <>접기 <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></>
                            ) : (
                                <>답변 전체보기 <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></>
                            )}
                        </ExpandButton>
                    )}
                    {message.disclaimer && <Disclaimer>{message.disclaimer}</Disclaimer>}
                    {message.followups && message.followups.length > 0 && (
                        <FollowupList>
                            {message.followups.map((q, i) => (
                                <FollowupChip key={i} onClick={() => onFollowupClick(q)}>{q}</FollowupChip>
                            ))}
                        </FollowupList>
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
});

const NewMessageButton = styled.button`
    position: absolute;
    bottom: 72px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${colors.primary[500]};
    color: white;
    border: none;
    border-radius: 99px;
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    z-index: 20;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    white-space: nowrap;
    animation: slideUp 0.2s ease-out;

    @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(8px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    &:hover {
        background-color: ${colors.primary[600]};
    }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background-color: ${colors.gray[50]};
    position: relative;
`;

const ReopenNoticeButton = styled.button`
    position: absolute;
    top: 10px;
    right: 12px;
    z-index: 20;
    border: 1px solid ${colors.primary[200]};
    background-color: white;
    color: ${colors.primary[700]};
    border-radius: 999px;
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    &:hover {
        background-color: ${colors.primary[50]};
    }
`;

const PolicyOverlay = styled.div`
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30;
    padding: 20px;
`;

const PolicyModal = styled.div`
    width: 100%;
    max-width: 352px;
    background-color: white;
    border-radius: 16px;
    padding: 22px 16px 16px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
`;

const PolicyTitle = styled.h3`
    margin: 0 0 12px 0;
    font-size: 17px;
    font-weight: 700;
    color: ${colors.gray[900]};
    text-align: center;
`;

const PolicyList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const PolicyItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 8px;
`;

const PolicyIcon = styled.span`
    font-size: 14px;
    line-height: 1.5;
    margin-top: 1px;
`;

const PolicyText = styled.p`
    margin: 0;
    font-size: 13px;
    color: ${colors.gray[700]};
    line-height: 1.55;
    word-break: keep-all;
`;

const PolicyLine = styled.span`
    display: block;
`;

const PolicyConfirmButton = styled.button`
    width: 100%;
    margin-top: 14px;
    border: none;
    border-radius: 10px;
    background-color: ${colors.primary[500]};
    color: white;
    font-size: 14px;
    font-weight: 600;
    padding: 10px 0;
    cursor: pointer;
`;

const ChatList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: ${spacing[4]}px;
    padding-top: calc(${spacing[4]}px + 36px);
    display: flex;
    flex-direction: column;
    gap: ${spacing[4]}px;
    padding-bottom: 20px;

    &::-webkit-scrollbar { display: none; }
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
    img { width: 100%; height: 100%; object-fit: contain; }
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

const ImageMessage = styled.div`margin-bottom: 4px;`;

const Text = styled.p<{ isUser?: boolean }>`
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    color: ${({ isUser }) => isUser ? 'white' : colors.gray[800]};
`;

const MarkdownContainer = styled.div`
    color: ${colors.gray[800]};
    font-size: 13px;
    line-height: 1.6;
    word-break: keep-all;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    
    p {
        margin: 0 0 8px 0;
        &:last-child {
            margin-bottom: 0;
        }
    }
    
    strong {
        font-weight: 700;
        color: ${colors.gray[900]};
    }
    
    ul, ol {
        margin: 8px 0;
        padding-left: 20px;
    }
    
    li {
        margin-bottom: 4px;
    }
`;

const Disclaimer = styled.p`
    margin: ${spacing[2]}px 0 0;
    font-size: 11px;
    color: ${colors.gray[400]};
    font-style: italic;
`;

const FollowupList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: ${spacing[2]}px;
`;

const FollowupChip = styled.button`
    background: ${colors.primary[50]};
    border: 1px solid ${colors.primary[200]};
    color: ${colors.primary[700]};
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 99px;
    cursor: pointer;
    transition: background 0.15s;
    text-align: left;

    &:hover { background: ${colors.primary[100]}; }
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
    &:hover { background-color: ${colors.gray[200]}; }
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
    color: ${colors.gray[900]};
    border: none;
    outline: none;
    font-size: 13px;
    padding: 4px 0;
    background: transparent;
    resize: none;
    max-height: 100px;
    line-height: 1.5;
    font-family: inherit;
    &::placeholder { color: ${colors.gray[400]}; }
    &:disabled { color: ${colors.gray[400]}; }
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
    &:hover { background: ${colors.gray[200]}; }
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
