import { create } from 'zustand';
import { HealthcareStep } from './types';
import { HealthcareAnalysisResponse } from '@/shared/api/healthcare';

interface HealthcareState {
    step: HealthcareStep;
    analysisId: string | null;
    result: HealthcareAnalysisResponse | null;

    setStep: (step: HealthcareStep) => void;
    setAnalysisId: (id: string) => void;
    setResult: (result: HealthcareAnalysisResponse) => void;
    reset: () => void;
}

export const useHealthcareStore = create<HealthcareState>((set) => ({
    step: 'intro',
    analysisId: null,
    result: null,

    setStep: (step) => set({ step }),
    setAnalysisId: (id) => set({ analysisId: id }),
    setResult: (result) => set({ result }),
    reset: () => set({ step: 'intro', analysisId: null, result: null }),
}));
