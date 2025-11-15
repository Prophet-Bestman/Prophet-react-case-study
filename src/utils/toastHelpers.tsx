import { toast } from 'react-toastify';

export const showUndoToast = (onUndo: () => void) => {
  toast.info(
    ({ closeToast }) => (
      <div>
        <p style={{ margin: '0 0 8px 0' }}>Issue updated</p>
        <button
          onClick={() => {
            onUndo();
            closeToast();
          }}
          style={{
            padding: '4px 12px',
            background: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Undo
        </button>
      </div>
    ),
    {
      autoClose: 5000,
      closeButton: true,
    }
  );
};
