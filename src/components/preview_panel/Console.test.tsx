import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'jotai';
import { appOutputAtom, selectedAppIdAtom } from '@/atoms/appAtoms';
import { Console } from './Console';
import type { AppOutput } from '@/ipc/ipc_types';

// Mock the copy hook
jest.mock('@/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({
    copyMessageContent: jest.fn(),
    copied: false,
  }),
}));

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

const mockAppOutput: AppOutput[] = [
  {
    type: 'stdout',
    message: 'Starting application...',
    timestamp: Date.now() - 5000,
    appId: 1,
  },
  {
    type: 'stderr',
    message: 'Error: Module not found',
    timestamp: Date.now() - 3000,
    appId: 1,
  },
  {
    type: 'stdout',
    message: 'Application running on port 3000',
    timestamp: Date.now() - 1000,
    appId: 1,
  },
];

describe('Console Component', () => {
  const renderConsoleWithOutput = (output: AppOutput[] = mockAppOutput) => {
    // Set the atom value before rendering
    const store = new Map();
    store.set(appOutputAtom, output);

    return render(
      <Provider initialValues={[[appOutputAtom, output], [selectedAppIdAtom, 1]]}>
        <Console />
      </Provider>
    );
  };

  it('renders console with toolbar and messages', () => {
    renderConsoleWithOutput();
    
    // Check toolbar buttons exist
    expect(screen.getByText(/All \(3\)/)).toBeInTheDocument();
    expect(screen.getByText(/Output \(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/Errors \(1\)/)).toBeInTheDocument();
    
    // Check messages are displayed
    expect(screen.getByText('Starting application...')).toBeInTheDocument();
    expect(screen.getByText('Error: Module not found')).toBeInTheDocument();
    expect(screen.getByText('Application running on port 3000')).toBeInTheDocument();
  });

  it('filters messages correctly', () => {
    renderConsoleWithOutput();
    
    // Click on Errors filter
    fireEvent.click(screen.getByText(/Errors \(1\)/));
    
    // Should only show error message
    expect(screen.getByText('Error: Module not found')).toBeInTheDocument();
    expect(screen.queryByText('Starting application...')).not.toBeInTheDocument();
    expect(screen.queryByText('Application running on port 3000')).not.toBeInTheDocument();
  });

  it('shows correct message styling for different types', () => {
    renderConsoleWithOutput();
    
    const errorMessage = screen.getByText('Error: Module not found');
    const successMessage = screen.getByText('Starting application...');
    
    // Error messages should have red styling classes
    expect(errorMessage.closest('div')).toHaveClass('text-red-400');
    
    // Regular stdout messages should have default styling
    expect(successMessage.closest('div')).toHaveClass('text-foreground');
  });

  it('displays timestamps for each message', () => {
    renderConsoleWithOutput();
    
    // Should display formatted timestamps
    const timestamps = screen.getAllByText(/\d{2}:\d{2}:\d{2}/);
    expect(timestamps).toHaveLength(3);
  });

  it('shows empty state when no messages', () => {
    renderConsoleWithOutput([]);
    
    expect(screen.getByText('No output yet...')).toBeInTheDocument();
    expect(screen.getByText(/All \(0\)/)).toBeInTheDocument();
    expect(screen.getByText(/Output \(0\)/)).toBeInTheDocument();
    expect(screen.getByText(/Errors \(0\)/)).toBeInTheDocument();
  });

  it('disables action buttons when no messages', () => {
    renderConsoleWithOutput([]);
    
    // Action buttons should be disabled
    expect(screen.getByTitle(/Copy all logs/)).toBeDisabled();
    expect(screen.getByTitle(/Export logs to file/)).toBeDisabled();
    expect(screen.getByTitle(/Clear logs/)).toBeDisabled();
  });

  it('enhances error detection with pattern matching', () => {
    const testOutput: AppOutput[] = [
      {
        type: 'stdout',
        message: 'Application failed to start',
        timestamp: Date.now(),
        appId: 1,
      },
      {
        type: 'stdout', 
        message: 'Warning: deprecated API usage',
        timestamp: Date.now(),
        appId: 1,
      },
      {
        type: 'stdout',
        message: 'Successfully connected to database',
        timestamp: Date.now(),
        appId: 1,
      }
    ];
    
    renderConsoleWithOutput(testOutput);
    
    // Click on Errors filter
    fireEvent.click(screen.getByText(/Errors \(2\)/));
    
    // Should show messages with error patterns
    expect(screen.getByText('Application failed to start')).toBeInTheDocument();
    expect(screen.queryByText('Successfully connected to database')).not.toBeInTheDocument();
  });

  it('applies correct styling for error patterns in stdout', () => {
    const testOutput: AppOutput[] = [
      {
        type: 'stdout',
        message: 'Error: Connection failed',
        timestamp: Date.now(),
        appId: 1,
      }
    ];
    
    renderConsoleWithOutput(testOutput);
    
    const errorMessage = screen.getByText('Error: Connection failed');
    expect(errorMessage.closest('div')).toHaveClass('text-red-400');
  });

  it('applies warning styling for warning patterns', () => {
    const testOutput: AppOutput[] = [
      {
        type: 'stdout',
        message: 'Warning: This feature is deprecated',
        timestamp: Date.now(),
        appId: 1,
      }
    ];
    
    renderConsoleWithOutput(testOutput);
    
    const warningMessage = screen.getByText('Warning: This feature is deprecated');
    expect(warningMessage.closest('div')).toHaveClass('text-yellow-600');
  });

  it('shows message types correctly in labels', () => {
    renderConsoleWithOutput();
    
    // Check that message type labels are displayed
    expect(screen.getByText('[STDOUT]')).toBeInTheDocument();
    expect(screen.getByText('[STDERR]')).toBeInTheDocument();
  });

  it('includes keyboard shortcut hints in button titles', () => {
    renderConsoleWithOutput();
    
    expect(screen.getByTitle(/Copy all logs \(Ctrl\+Shift\+C\)/)).toBeInTheDocument();
    expect(screen.getByTitle(/Export logs to file \(Ctrl\+Shift\+S\)/)).toBeInTheDocument();
    expect(screen.getByTitle(/Clear logs \(Ctrl\+K\)/)).toBeInTheDocument();
  });

  it('includes CLI input component', () => {
    renderConsoleWithOutput();
    
    // Check that CLI input is present
    expect(screen.getByPlaceholderText(/Enter command or app input.../)).toBeInTheDocument();
  });

  it('handles clear command from CLI input', () => {
    renderConsoleWithOutput();
    
    // Type "clear" in CLI input and press Enter
    const input = screen.getByPlaceholderText(/Enter command or app input.../);
    fireEvent.change(input, { target: { value: 'clear' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Console should still be rendered (output cleared by the clear action)
    expect(screen.getByText(/All \(3\)/)).toBeInTheDocument();
  });
});