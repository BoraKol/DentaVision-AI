import { useAsync } from './useAsync';
import { AnalyzePatientRiskUseCase } from '../../core/application/use-cases/AnalyzePatientRiskUseCase';
import { Patient } from '../../core/domain/entities/Patient';
import { AnalysisResult } from '../../core/domain/entities/AnalysisResult';

export const usePatientAnalysis = () => {
    const { execute, reset, ...state } = useAsync<AnalysisResult>();
    const useCase = new AnalyzePatientRiskUseCase();

    const analyzePatient = async (patient: Patient, language?: string) => {
        return execute(() => useCase.execute(patient, language));
    };

    return { ...state, analyzePatient, reset };
};
