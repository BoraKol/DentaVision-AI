import { useAsync } from './useAsync';
import { SuggestPrescriptionUseCase } from '../../core/application/use-cases/SuggestPrescriptionUseCase';

export const usePrescriptionAI = () => {
    const { execute, ...state } = useAsync<any>();
    const useCase = new SuggestPrescriptionUseCase();

    const suggestPrescription = async (symptoms: string, procedure?: string) => {
        return execute(() => useCase.execute(symptoms, procedure));
    }

    return { ...state, suggestPrescription };
};
