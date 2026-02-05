import { useEffect } from 'react';

/**
 * 페이지 새로고침 / 브라우저 닫기 방지 커스텀 훅
 * 
 * @param shouldPrevent - true일 때만 경고 표시
 * @param message - 경고 메시지
 * 
 * @example
 * // React Hook Form과 함께 사용
 * const { formState: { isDirty } } = useForm();
 * useConfirmPageLeave(isDirty);
 * 
 * @example
 * // Zustand와 함께 사용
 * const hasUnsavedChanges = useStore(state => state.hasUnsavedChanges);
 * useConfirmPageLeave(hasUnsavedChanges);
 */
export const useConfirmPageLeave = (
    shouldPrevent: boolean,
    message: string = '변경사항이 저장되지 않을 수 있습니다. 정말 페이지를 나가시겠습니까?'
) => {
    useEffect(() => {
        if (!shouldPrevent) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = message;
            return message;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [shouldPrevent, message]);
};
