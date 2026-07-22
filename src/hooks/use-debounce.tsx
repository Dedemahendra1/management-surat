import { useRef } from "react";


export default function useDebounce() {
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);


    const debounce = (callback: () => void, delay: number) => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            callback();
        }, delay);
    };

    return debounce;
}