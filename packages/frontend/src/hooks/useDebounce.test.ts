import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('delays function execution by specified delay', () => {
        const mockFn = vi.fn()
        const { result } = renderHook(() => useDebounce(mockFn, 1000))

        act(() => {
            result.current('test')
        })

        // Function should not be called immediately
        expect(mockFn).not.toHaveBeenCalled()

        // Fast-forward time by 500ms - still shouldn't be called
        act(() => {
            vi.advanceTimersByTime(500)
        })
        expect(mockFn).not.toHaveBeenCalled()

        // Fast-forward by another 500ms (total 1000ms) - now it should be called
        act(() => {
            vi.advanceTimersByTime(500)
        })
        expect(mockFn).toHaveBeenCalledWith('test')
        expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('cancels previous timeout when called multiple times', () => {
        const mockFn = vi.fn()
        const { result } = renderHook(() => useDebounce(mockFn, 1000))

        // Call the debounced function multiple times
        act(() => {
            result.current('first')
        })

        act(() => {
            vi.advanceTimersByTime(500)
        })

        act(() => {
            result.current('second')
        })

        act(() => {
            vi.advanceTimersByTime(500)
        })

        act(() => {
            result.current('third')
        })

        // Only the last call should be executed after the full delay
        act(() => {
            vi.advanceTimersByTime(1000)
        })

        expect(mockFn).toHaveBeenCalledWith('third')
        expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('handles multiple arguments correctly', () => {
        const mockFn = vi.fn()
        const { result } = renderHook(() => useDebounce(mockFn, 1000))

        act(() => {
            result.current('arg1', 'arg2', 123)
        })

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123)
    })

    it('respects different delay values', () => {
        const mockFn = vi.fn()
        const { result } = renderHook(() => useDebounce(mockFn, 2000))

        act(() => {
            result.current('test')
        })

        // After 1000ms, function shouldn't be called yet (delay is 2000ms)
        act(() => {
            vi.advanceTimersByTime(1000)
        })
        expect(mockFn).not.toHaveBeenCalled()

        // After 2000ms total, function should be called
        act(() => {
            vi.advanceTimersByTime(1000)
        })
        expect(mockFn).toHaveBeenCalledWith('test')
    })
})
