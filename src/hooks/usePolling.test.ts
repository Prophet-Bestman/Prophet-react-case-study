import { renderHook } from '@testing-library/react';
import { usePolling } from './usePolling';

describe('usePolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should call callback at specified interval', () => {
    const callback = jest.fn();
    const interval = 1000;

    renderHook(() => usePolling(callback, interval, true));

    expect(callback).not.toHaveBeenCalled();

    // Fast-forward 1 second
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    // Fast-forward another second
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should not call callback when enabled is false', () => {
    const callback = jest.fn();
    const interval = 1000;

    renderHook(() => usePolling(callback, interval, false));

    jest.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should clean up interval on unmount', () => {
    const callback = jest.fn();
    const interval = 1000;

    const { unmount } = renderHook(() => usePolling(callback, interval, true));

    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    unmount();

    // After unmount, callback should not be called
    jest.advanceTimersByTime(5000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should update interval when interval prop changes', () => {
    const callback = jest.fn();
    let interval = 1000;

    const { rerender } = renderHook(() => usePolling(callback, interval, true));

    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    // Change interval to 500ms
    interval = 500;
    rerender();

    callback.mockClear();

    // New interval should be 500ms
    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should use latest callback without recreating interval', () => {
    let callbackValue = 'first';
    const callback = jest.fn(() => callbackValue);
    const interval = 1000;

    const { rerender } = renderHook(() => usePolling(callback, interval, true));

    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    // Change callback function
    callbackValue = 'second';
    rerender();

    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveReturnedWith('second');
  });

  it('should stop polling when enabled changes to false', () => {
    const callback = jest.fn();
    const interval = 1000;
    let enabled = true;

    const { rerender } = renderHook(() => usePolling(callback, interval, enabled));

    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    // Disable polling
    enabled = false;
    rerender();

    callback.mockClear();

    jest.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should restart polling when enabled changes to true', () => {
    const callback = jest.fn();
    const interval = 1000;
    let enabled = false;

    const { rerender } = renderHook(() => usePolling(callback, interval, enabled));

    jest.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();

    // Enable polling
    enabled = true;
    rerender();

    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
