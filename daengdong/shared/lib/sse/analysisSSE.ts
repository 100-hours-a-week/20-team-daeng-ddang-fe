import { EventSourcePolyfill, MessageEvent } from 'event-source-polyfill';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface AnalysisSSEData {
    status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAIL';
    resultId?: string | null;
    errorMessage?: string | null;
    [key: string]: unknown;
}

/**
 * 표정분석 / 돌발미션 SSE 연결
 *   event: connected  → 연결 확인
 *   event: heartbeat  → 연결 유지
 *   event: status     → 분석 결과 (SUCCESS / FAIL)
 */
export const connectWalkAnalysisSSE = (
    walkId: number,
    taskId: string,
    onDone: (data: AnalysisSSEData) => void,
    onError: (err: Error) => void
): (() => void) => {
    const url = `${API_BASE_URL}/walks/${walkId}/analysis/tasks/${taskId}/events`;
    let settled = false;

    const es = new EventSourcePolyfill(url, {
        headers: getAuthHeaders(),
        withCredentials: true,
    });

    es.addEventListener('connected', (event) => {
        console.debug('[SSE Walk] connected:', (event as MessageEvent).data);
    });

    es.addEventListener('heartbeat', () => {
        console.debug('[SSE Walk] heartbeat');
    });

    es.addEventListener('status', (event) => {
        if (settled) return;
        try {
            const data: AnalysisSSEData = JSON.parse((event as MessageEvent).data);
            console.debug('[SSE Walk] status 수신:', data);

            if (data.status === 'SUCCESS') {
                settled = true;
                es.close();
                onDone(data);
            } else if (data.status === 'FAIL') {
                settled = true;
                es.close();
                onError(new Error(data.errorMessage ?? '분석에 실패했습니다.'));
            }
        } catch {
            settled = true;
            es.close();
            onError(new Error('SSE 메시지 파싱 실패'));
        }
    });

    es.onerror = (err) => {
        console.error('[SSE Walk] onerror settled:', settled, err);
        if (settled) return;
        settled = true;
        es.close();
        onError(new Error('SSE 연결 오류가 발생했습니다.'));
    };

    return () => {
        settled = true;
        es.close();
    };
};

//헬스케어 SSE 연결
export const connectHealthcareSSE = (
    taskId: string,
    onDone: (data: AnalysisSSEData) => void,
    onError: (err: Error) => void
): (() => void) => {
    const url = `${API_BASE_URL}/healthcares/analysis/tasks/${taskId}/events`;
    let settled = false;

    const es = new EventSourcePolyfill(url, {
        headers: getAuthHeaders(),
        withCredentials: true,
    });

    es.addEventListener('connected', (event) => {
        console.debug('[SSE Healthcare] connected:', (event as MessageEvent).data);
    });

    es.addEventListener('heartbeat', () => {
        console.debug('[SSE Healthcare] heartbeat');
    });

    es.addEventListener('status', (event) => {
        if (settled) return;
        try {
            const data: AnalysisSSEData = JSON.parse((event as MessageEvent).data);
            console.debug('[SSE Healthcare] status 수신:', data);

            if (data.status === 'SUCCESS') {
                settled = true;
                es.close();
                onDone(data);
            } else if (data.status === 'FAIL') {
                settled = true;
                es.close();
                onError(new Error(data.errorMessage ?? '헬스케어 분석에 실패했습니다.'));
            }
        } catch {
            settled = true;
            es.close();
            onError(new Error('SSE 메시지 파싱 실패'));
        }
    });

    es.onerror = (err) => {
        console.error('[SSE Healthcare] onerror settled:', settled, err);
        if (settled) return;
        settled = true;
        es.close();
        onError(new Error('SSE 연결 오류가 발생했습니다.'));
    };

    return () => {
        settled = true;
        es.close();
    };
};
