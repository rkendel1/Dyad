import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLoadAppFile } from '../useLoadAppFile';
import { IpcClient } from '@/ipc/ipc_client';

// Mock IpcClient
vi.mock('@/ipc/ipc_client', () => ({
  IpcClient: {
    getInstance: vi.fn(),
  },
}));

describe('useLoadAppFile', () => {
  let mockReadAppFile: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Set up mock implementation
    mockReadAppFile = vi.fn();
    (IpcClient.getInstance as ReturnType<typeof vi.fn>).mockReturnValue({
      readAppFile: mockReadAppFile,
    });
  });

  it('should not load file when appId is null', () => {
    const { result } = renderHook(() => useLoadAppFile(null, 'src/App.tsx'));
    
    expect(result.current.content).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockReadAppFile).not.toHaveBeenCalled();
  });

  it('should not load file when filePath is null', () => {
    const { result } = renderHook(() => useLoadAppFile(1, null));
    
    expect(result.current.content).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockReadAppFile).not.toHaveBeenCalled();
  });

  it('should load file successfully', async () => {
    const mockContent = 'export default function App() { return <div>Hello</div>; }';
    mockReadAppFile.mockResolvedValue(mockContent);

    const { result } = renderHook(() => useLoadAppFile(1, 'src/App.tsx'));

    // Initially loading should be true
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    // Wait for content to be loaded
    await waitFor(() => {
      expect(result.current.content).toBe(mockContent);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(mockReadAppFile).toHaveBeenCalledWith(1, 'src/App.tsx');
  });

  it('should handle error when loading file fails', async () => {
    const mockError = new Error('File not found');
    mockReadAppFile.mockRejectedValue(mockError);

    const { result } = renderHook(() => useLoadAppFile(1, 'src/NonExistent.tsx'));

    // Wait for error to be set
    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('File not found');
      expect(result.current.content).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(mockReadAppFile).toHaveBeenCalledWith(1, 'src/NonExistent.tsx');
  });

  it('should prevent memory leak by not updating state after unmount', async () => {
    const mockContent = 'content';
    let resolvePromise: (value: string) => void;
    const delayedPromise = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });
    mockReadAppFile.mockReturnValue(delayedPromise);

    const { result, unmount } = renderHook(() => useLoadAppFile(1, 'src/App.tsx'));

    // Unmount before the promise resolves
    unmount();

    // Resolve the promise after unmount
    resolvePromise!(mockContent);

    // Wait a bit to ensure no state updates happen
    await new Promise(resolve => setTimeout(resolve, 100));

    // The result should still show initial values since component unmounted
    expect(result.current.content).toBeNull();
  });

  it('should handle rapid parameter changes without race conditions', async () => {
    mockReadAppFile
      .mockResolvedValueOnce('content 1')
      .mockResolvedValueOnce('content 2');

    const { result, rerender } = renderHook(
      ({ appId, filePath }) => useLoadAppFile(appId, filePath),
      { initialProps: { appId: 1, filePath: 'file1.txt' } }
    );

    // Change parameters before first load completes
    rerender({ appId: 1, filePath: 'file2.txt' });

    // Wait for the second load to complete
    await waitFor(() => {
      expect(result.current.content).toBe('content 2');
      expect(result.current.loading).toBe(false);
    });

    expect(mockReadAppFile).toHaveBeenCalledTimes(2);
  });

  it('should refresh file when refreshFile is called', async () => {
    const initialContent = 'initial content';
    const refreshedContent = 'refreshed content';
    
    mockReadAppFile
      .mockResolvedValueOnce(initialContent)
      .mockResolvedValueOnce(refreshedContent);

    const { result } = renderHook(() => useLoadAppFile(1, 'src/App.tsx'));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.content).toBe(initialContent);
    });

    // Call refreshFile
    result.current.refreshFile();

    // Wait for refresh to complete
    await waitFor(() => {
      expect(result.current.content).toBe(refreshedContent);
    });

    expect(mockReadAppFile).toHaveBeenCalledTimes(2);
  });

  it('should not refresh if parameters become null', async () => {
    const mockContent = 'content';
    mockReadAppFile.mockResolvedValue(mockContent);

    const { result, rerender } = renderHook(
      ({ appId, filePath }) => useLoadAppFile(appId, filePath),
      { initialProps: { appId: 1, filePath: 'src/App.tsx' } }
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.content).toBe(mockContent);
    });

    // Change to null parameters
    rerender({ appId: null, filePath: null });

    // Wait for state to update
    await waitFor(() => {
      expect(result.current.content).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    // Try to refresh with null parameters
    result.current.refreshFile();

    // Should not call the API again
    expect(mockReadAppFile).toHaveBeenCalledTimes(1);
  });
});
