import { useAsync } from './useAsync';
import { GenerateBriefingUseCase } from '../../core/application/use-cases/GenerateBriefingUseCase';

export const useDashboard = () => {
    const { execute, reset, ...state } = useAsync<any>();
    const useCase = new GenerateBriefingUseCase();

    const fetchBriefing = async (forceRefresh = false, appointments: any[] = []) => {
        const CACHE_KEY = 'dentavision_morning_briefing_v3';
        const CACHE_TIME_KEY = 'dentavision_briefing_timestamp_v3';

        if (!forceRefresh) {
            const cachedData = localStorage.getItem(CACHE_KEY);
            const cachedTimestamp = localStorage.getItem(CACHE_TIME_KEY);

            if (cachedData && cachedTimestamp) {
                const now = new Date();
                const cachedDate = new Date(parseInt(cachedTimestamp));

                // If same day, use cache
                if (now.toDateString() === cachedDate.toDateString()) {
                    // Update state manually or return cached data
                    // Since useAsync doesn't expose a setter for data, we can execute a resolver that returns cached data
                    return execute(async () => JSON.parse(cachedData));
                }
            }
        }

        return execute(async () => {
            const result = await useCase.execute(appointments);

            // Fix: Cache the result even if patients array is empty (e.g. no appointments today)
            // This prevents the app from spamming the Gemini API on every mount when there are 0 appointments
            if (result && result.summary) {
                localStorage.setItem(CACHE_KEY, JSON.stringify(result));
                localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
            }
            return result;
        });
    };

    return { ...state, fetchBriefing };
}
