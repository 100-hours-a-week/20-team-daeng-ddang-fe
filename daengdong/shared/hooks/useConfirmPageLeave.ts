import { useEffect } from 'react';

/**
 * 페이지 새로고침 / 브라우저 닫기 방지 커스텀 훅
 * 
 * @param shouldPrevent - true일 때만 경고 표시
 * @param message - 경고 메시지 (브라우저에 따라 무시될 수 있음)
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
            // 표준에 따라 preventDefault 호출
            e.preventDefault();

            // Chrome에서는 returnValue 설정 필요
            e.returnValue = message;

            // 일부 브라우저에서는 메시지 반환
            return message;
        };

        // 이벤트 리스너 등록
        window.addEventListener('beforeunload', handleBeforeUnload);

        // 클린업: 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [shouldPrevent, message]);
};
