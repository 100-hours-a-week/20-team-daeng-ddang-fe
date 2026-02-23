import { useState, useRef, useEffect, useCallback } from "react";
import chatbotApi, { ChatMessageResponse } from "@/entities/chatbot/api/chatbot";
import fileApi from "@/shared/api/file";
import { useToastStore } from "@/shared/stores/useToastStore";

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    imageUrl?: string;
    timestamp: Date;
    followups?: string[];
    disclaimer?: string;
}

const generateId = () => crypto.randomUUID();

const WELCOME_MESSAGE: Message = {
    id: 'welcome',
    text: '안녕하세요! 반려견 건강에 대해 궁금한 점이 있으신가요? 무엇이든 물어보세요! 🐾',
    sender: 'bot',
    timestamp: new Date(),
};

export const useChatbot = () => {
    const { showToast } = useToastStore();

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessionError, setSessionError] = useState(false);
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [inputText, setInputText] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const prevMessagesLengthRef = useRef(1);

    const [hasNewMessage, setHasNewMessage] = useState(false);

    // 채팅 세션 생성
    useEffect(() => {
        chatbotApi.createChatSession()
            .then(session => setSessionId(session.sessionId))
            .catch(() => {
                setSessionError(true);
                setMessages(prev => [...prev, {
                    id: 'session-error',
                    text: '채팅 세션을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.',
                    sender: 'bot',
                    timestamp: new Date(),
                }]);
            });
    }, []);

    // 메시지/로딩 변화 시 스크롤 처리
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;

        const hasNew = messages.length > prevMessagesLengthRef.current;
        prevMessagesLengthRef.current = messages.length;

        if (isNearBottom) {
            el.scrollTop = el.scrollHeight;
            setHasNewMessage(false);
        } else if (hasNew) {
            setHasNewMessage(true);
        }
    }, [messages, isLoading]);

    // textarea 높이 자동 조절
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
        }
    }, [inputText]);

    /*
    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            const presignedData = await fileApi.getPresignedUrl("IMAGE", file.type, "CHATBOT");
            await fileApi.uploadFile(presignedData.presignedUrl, file, file.type);
            return presignedData.presignedUrl.split("?")[0];
        } catch {
            return null;
        }
    };
    */

    const handleSendMessage = async () => {
        if ((!inputText.trim() && !selectedImage) || isLoading || !sessionId) return;

        setIsLoading(true);

        const textToSend = inputText;
        // const fileToUpload = selectedFile;
        // const previewImage = selectedImage;
        setInputText("");
        setSelectedImage(null);
        setSelectedFile(null);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            let uploadedImageUrl: string | undefined;

            // 1단계: 챗봇 이미지 업로드 기능 비활성화
            /*
            if (fileToUpload) {
                const url = await uploadImage(fileToUpload);
                if (!url) {
                    showToast({ message: "이미지 업로드에 실패했습니다.", type: "error" });
                    setInputText(textToSend);
                    setSelectedImage(previewImage);
                    setSelectedFile(fileToUpload);
                    return;
                }
                uploadedImageUrl = url;
            }
            */

            const userMessage: Message = {
                id: generateId(),
                text: textToSend,
                sender: 'user',
                timestamp: new Date(),
                imageUrl: uploadedImageUrl,
            };

            setMessages(prev => [...prev, userMessage]);

            const response: ChatMessageResponse = await chatbotApi.sendChatMessage({
                sessionId,
                message: userMessage.text,
                imageUrl: uploadedImageUrl,
            });

            setMessages(prev => {
                const next = [...prev, {
                    id: generateId(),
                    text: response.answer,
                    sender: 'bot' as const,
                    timestamp: new Date(),
                    followups: response.followups,
                    disclaimer: response.disclaimer,
                }];
                return next.length > 200 ? next.slice(-200) : next;
            });
        } catch (e: unknown) {
            const err = e as { response?: { data?: { errorCode?: string } } };
            const errorCode = err?.response?.data?.errorCode;
            const errorText = errorCode === 'SESSION_EXPIRED'
                ? '상담 세션이 만료되었습니다. 페이지를 새로고침해주세요.'
                : errorCode === 'AI_SERVER_CONNECTION_FAILED'
                    ? 'AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
                    : '답변을 받지 못했습니다. 다시 시도해주세요.';

            setMessages(prev => [...prev, {
                id: generateId(),
                text: errorText,
                sender: 'bot',
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        setHasNewMessage(false);
    }, []);

    const handleFollowupClick = useCallback((question: string) => {
        setInputText(question);
        textareaRef.current?.focus();
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setSelectedFile(null);
    };

    return {
        sessionId,
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
        handleSendMessage,
        handleFollowupClick,
        handleImageSelect,
        clearImage,
    };
};
