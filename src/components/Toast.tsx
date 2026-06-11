import { useEffect } from 'react';

interface Props {
  message: string;
  visible: boolean;
  onDone: () => void;
}

const Toast: React.FC<Props> = ({ message, visible, onDone }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDone, 1800);
      return () => clearTimeout(timer);
    }
  }, [visible, onDone]);

  if (!visible) return null;

  return (
    <div
      className="toast"
      style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--copied-bg)',
        color: '#fff',
        padding: '10px 24px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        zIndex: 9999,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        pointerEvents: 'none',
        animation: 'toastAnim 1.8s ease-out forwards',
      }}
    >
      ✓ {message}
      <style>{`
        @keyframes toastAnim {
          0% { opacity: 0; transform: translateX(-50%) translateY(12px); }
          15% { opacity: 1; transform: translateX(-50%) translateY(0); }
          70% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default Toast;
