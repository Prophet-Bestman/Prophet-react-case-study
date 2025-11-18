import { showUndoToast } from './toastHelpers';
import { toast } from 'react-toastify';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('showUndoToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call toast.info', () => {
    const onUndo = jest.fn();

    showUndoToast(onUndo);

    expect(toast.info).toHaveBeenCalled();
  });

  it('should pass correct options to toast', () => {
    const onUndo = jest.fn();

    showUndoToast(onUndo);

    expect(toast.info).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        autoClose: 5000,
        closeButton: true,
      })
    );
  });

  it('should provide an undo callback in the toast content', () => {
    const onUndo = jest.fn();

    showUndoToast(onUndo);

    // Get the render function that was passed to toast.info
    const renderFunction = (toast.info as jest.Mock).mock.calls[0][0];

    expect(typeof renderFunction).toBe('function');
  });

  it('should have 5 second auto-close', () => {
    const onUndo = jest.fn();

    showUndoToast(onUndo);

    const options = (toast.info as jest.Mock).mock.calls[0][1];

    expect(options.autoClose).toBe(5000);
  });

  it('should have close button enabled', () => {
    const onUndo = jest.fn();

    showUndoToast(onUndo);

    const options = (toast.info as jest.Mock).mock.calls[0][1];

    expect(options.closeButton).toBe(true);
  });
});
