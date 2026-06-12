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
    <div className="toast">
      ✓ {message}
    </div>
  );
};

export default Toast;
