import { useCallback, useRef } from 'react'

/**
 * Creates a debounced version of a function that delays execution until after
 * the specified delay has elapsed since the last time it was invoked.
 *
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the callback
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number): T {
    const timeoutRef = useRef<NodeJS.Timeout>(null)

    return useCallback(
        ((...args: Parameters<T>) => {
            // Clear the previous timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            // Set a new timeout
            timeoutRef.current = setTimeout(() => {
                callback(...args)
            }, delay)
        }) as T,
        [callback, delay]
    )
}
