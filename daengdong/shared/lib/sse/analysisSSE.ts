const shouldLogOnLocalhost = (): boolean =>
    typeof window !== 'undefined' && window.location.hostname === 'localhost';

const USE_BFF_SSE = process.env.NEXT_PUBLIC_USE_BFF_SSE === 'true';
const ANALYSIS_POLLING_INTERVAL_MS = 2000;
const ANALYSIS_POLLING_TIMEOUT_MS = 3 * 60 * 1000;

const debugLog = (...args: unknown[]) => {
    if (shouldLogOnLocalhost()) {
        console.debug(...args);
    }
};

export interface AnalysisSSEData {
    status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAIL';
    resultId?: string | null;
    errorMessage?: string | null;
}

type AnalysisStatusFetcher = () => Promise<AnalysisSSEData>;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const isAnalysisSuccess = (status: AnalysisSSEData['status']) => status === 'SUCCESS';
const isAnalysisFailure = (status: AnalysisSSEData['status']) => status === 'FAIL';

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
    const url = `/bff/sse/walks/${walkId}/tasks/${taskId}`;
    let settled = false;

    const es = new EventSource(url, {
        withCredentials: true,
    });

    es.addEventListener('connected', (event) => {
        debugLog('[SSE Walk] connected:', (event as MessageEvent).data);
    });

    es.addEventListener('heartbeat', () => {
        debugLog('[SSE Walk] heartbeat');
    });

    es.addEventListener('status', (event) => {
        if (settled) return;
        try {
            const data: AnalysisSSEData = JSON.parse((event as MessageEvent).data);
            debugLog('[SSE Walk] status 수신:', data);

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
    const url = `/bff/sse/healthcares/tasks/${taskId}`;
    let settled = false;

    const es = new EventSource(url, {
        withCredentials: true,
    });

    es.addEventListener('connected', (event) => {
        debugLog('[SSE Healthcare] connected:', (event as MessageEvent).data);
    });

    es.addEventListener('heartbeat', () => {
        debugLog('[SSE Healthcare] heartbeat');
    });

    es.addEventListener('status', (event) => {
        if (settled) return;
        try {
            const data: AnalysisSSEData = JSON.parse((event as MessageEvent).data);
            debugLog('[SSE Healthcare] status 수신:', data);

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

const waitForAnalysisByPolling = async (
    fetchStatus: AnalysisStatusFetcher,
    timeoutMs = ANALYSIS_POLLING_TIMEOUT_MS
): Promise<AnalysisSSEData> => {
    const startedAt = Date.now();

    while (Date.now() - startedAt <= timeoutMs) {
        const data = await fetchStatus();

        if (isAnalysisSuccess(data.status)) {
            return data;
        }

        if (isAnalysisFailure(data.status)) {
            throw new Error(data.errorMessage ?? '분석에 실패했습니다.');
        }

        await delay(ANALYSIS_POLLING_INTERVAL_MS);
    }

    throw new Error('분석 결과 대기 시간이 초과되었습니다.');
};

const waitForAnalysisViaSSE = (
    connectSSE: (onDone: (data: AnalysisSSEData) => void, onError: (err: Error) => void) => () => void
): Promise<AnalysisSSEData> =>
    new Promise<AnalysisSSEData>((resolve, reject) => {
        let unsubscribe: (() => void) | null = null;

        unsubscribe = connectSSE(
            (data) => {
                unsubscribe?.();
                resolve(data);
            },
            (err) => {
                unsubscribe?.();
                reject(err);
            }
        );
    });

export const waitWalkAnalysisCompletion = async (
    walkId: number,
    taskId: string,
    fetchStatus: AnalysisStatusFetcher
): Promise<AnalysisSSEData> => {
    if (!USE_BFF_SSE) {
        return waitForAnalysisByPolling(fetchStatus);
    }

    try {
        return await waitForAnalysisViaSSE((onDone, onError) =>
            connectWalkAnalysisSSE(walkId, taskId, onDone, onError)
        );
    } catch (error) {
        console.warn('[SSE Walk] SSE 실패, polling으로 폴백합니다.', error);
        return waitForAnalysisByPolling(fetchStatus);
    }
};

export const waitHealthcareAnalysisCompletion = async (
    taskId: string,
    fetchStatus: AnalysisStatusFetcher
): Promise<AnalysisSSEData> => {
    if (!USE_BFF_SSE) {
        return waitForAnalysisByPolling(fetchStatus);
    }

    try {
        return await waitForAnalysisViaSSE((onDone, onError) =>
            connectHealthcareSSE(taskId, onDone, onError)
        );
    } catch (error) {
        console.warn('[SSE Healthcare] SSE 실패, polling으로 폴백합니다.', error);
        return waitForAnalysisByPolling(fetchStatus);
    }
};
