import { useEffect, useState } from "react";

export function useResetState<T>(initialState: T, deps: unknown[] = []){
    const [state, setState] = useState(initialState);
    // biome-ignore lint/correctness/useExhaustiveDependencies: うるせー
    useEffect(() => {
        setState(initialState);
    }, deps);
    return [state, setState] as const;
}
