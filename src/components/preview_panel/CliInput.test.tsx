import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'jotai';
import { selectedAppIdAtom } from '@/atoms/appAtoms';
import { CliInput } from './CliInput';
import { IpcClient } from '@/ipc/ipc_client';

// Mock IpcClient
jest.mock('@/ipc/ipc_client', () => ({
  IpcClient: {
    getInstance: jest.fn(() => ({
      respondToAppInput: jest.fn(),
    })),
  },
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('CliInput Component', () => {
  const renderCliInput = (appId: number | null = 1) => {
    return render(
      <Provider initialValues={[[selectedAppIdAtom, appId]]}>
        <CliInput />
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders CLI input with placeholder', () => {
    renderCliInput();
    
    const input = screen.getByPlaceholderText(/Enter command or app input.../);
    expect(input).toBeInTheDocument();
  });

  it('shows different placeholder when no app is running', () => {
    renderCliInput(null);
    
    const input = screen.getByPlaceholderText(/No app running/);
    expect(input).toBeInTheDocument();
    expect(input).toBeDisabled();
  });

  it('shows help dialog when help button is clicked', () => {
    renderCliInput();
    
    const helpButton = screen.getByTitle(/Show help/);
    fireEvent.click(helpButton);
    
    expect(screen.getByText(/CLI Commands Help/)).toBeInTheDocument();
    expect(screen.getByText(/Built-in Commands:/)).toBeInTheDocument();
  });

  it('executes help command and shows help', async () => {
    renderCliInput();
    
    const input = screen.getByPlaceholderText(/Enter command or app input.../);
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(screen.getByText(/CLI Commands Help/)).toBeInTheDocument();
  });

  it('navigates command history with arrow keys', () => {
    renderCliInput();
    
    const input = screen.getByPlaceholderText(/Enter command or app input.../) as HTMLInputElement;
    
    // Add a command to history by typing and pressing Enter
    fireEvent.change(input, { target: { value: 'test command' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Clear the input
    expect(input.value).toBe('');
    
    // Press ArrowUp to navigate history
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    
    // Input should now contain the previous command
    expect(input.value).toBe('test command');
  });

  it('clears input on Escape key', () => {
    renderCliInput();
    
    const input = screen.getByPlaceholderText(/Enter command or app input.../) as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'some text' } });
    expect(input.value).toBe('some text');
    
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input.value).toBe('');
  });

  it('calls respondToAppInput when submitting command', async () => {
    const mockRespondToAppInput = jest.fn().mockResolvedValue(undefined);
    (IpcClient.getInstance as jest.Mock).mockReturnValue({
      respondToAppInput: mockRespondToAppInput,
    });

    renderCliInput(42);
    
    const input = screen.getByPlaceholderText(/Enter command or app input.../);
    fireEvent.change(input, { target: { value: 'ls -la' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Wait for async operation
    await screen.findByPlaceholderText(/Enter command or app input.../);
    
    expect(mockRespondToAppInput).toHaveBeenCalledWith({
      appId: 42,
      response: 'ls -la',
    });
  });

  it('shows history button when commands are in history', () => {
    renderCliInput();
    
    const input = screen.getByPlaceholderText(/Enter command or app input.../);
    
    // Initially no history button
    expect(screen.queryByTitle(/Command history/)).not.toBeInTheDocument();
    
    // Add a command
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // History button should appear
    expect(screen.getByTitle(/Command history/)).toBeInTheDocument();
  });

  it('disables submit when input is empty', () => {
    renderCliInput();
    
    const submitButton = screen.getByTitle(/Execute command/);
    expect(submitButton).toBeDisabled();
  });

  it('enables submit when input has text', () => {
    renderCliInput();
    
    const input = screen.getByPlaceholderText(/Enter command or app input.../);
    fireEvent.change(input, { target: { value: 'test' } });
    
    const submitButton = screen.getByTitle(/Execute command/);
    expect(submitButton).not.toBeDisabled();
  });

  it('handles clear command callback', () => {
    const onCommandExecute = jest.fn();
    
    render(
      <Provider initialValues={[[selectedAppIdAtom, 1]]}>
        <CliInput onCommandExecute={onCommandExecute} />
      </Provider>
    );
    
    const input = screen.getByPlaceholderText(/Enter command or app input.../);
    fireEvent.change(input, { target: { value: 'clear' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onCommandExecute).toHaveBeenCalledWith('clear');
  });

  it('maintains command history limit', () => {
    renderCliInput();
    
    const input = screen.getByPlaceholderText(/Enter command or app input.../);
    
    // Add more than 50 commands
    for (let i = 0; i < 55; i++) {
      fireEvent.change(input, { target: { value: `command${i}` } });
      fireEvent.keyDown(input, { key: 'Enter' });
    }
    
    // Navigate to the oldest command
    for (let i = 0; i < 51; i++) {
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    }
    
    // Should have max 50 commands
    const historyButton = screen.getByTitle(/Command history/);
    expect(historyButton.title).toContain('50 commands');
  });

  it('handles IPC errors gracefully and resets executing state', async () => {
    const mockRespondToAppInput = jest.fn().mockRejectedValue(new Error('IPC failed'));
    (IpcClient.getInstance as jest.Mock).mockReturnValue({
      respondToAppInput: mockRespondToAppInput,
    });

    const { toast } = require('sonner');
    
    renderCliInput(42);
    
    const input = screen.getByPlaceholderText(/Enter command or app input.../);
    const submitButton = screen.getByTitle(/Execute command/);
    
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Wait for async operation to complete
    await screen.findByPlaceholderText(/Enter command or app input.../);
    
    // Toast error should be called
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Failed to execute command'));
    
    // Submit button should be enabled again (not stuck in executing state)
    fireEvent.change(input, { target: { value: 'another test' } });
    expect(submitButton).not.toBeDisabled();
  });
});
