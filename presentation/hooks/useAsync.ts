import { useState, useCallback } from 'react';

export type Status = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

export interface AsyncState<T> {
    status: Status;
    data: T | null;
    error: Error | null;
}

export const useAsync = <T,>() => {
    const [state, setState] = useState<AsyncState<T>>({
        status: 'IDLE',
        data: null,
        error: null,
    });

    const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
        setState({ status: 'LOADING', data: null, error: null });
        try {
            const data = await asyncFunction();
            setState({ status: 'SUCCESS', data, error: null });
            return data;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
            setState({ status: 'ERROR', data: null, error: err });
            throw err;
        }
    }, []);

    const reset = useCallback(() => {
        setState({ status: 'IDLE', data: null, error: null });
    }, []);

    return { ...state, execute, reset };
};
