import { useState, useEffect } from 'react';

export function useClosingModal(isOpen: boolean, duration: number = 300) {
  const [shouldRender, setRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  if (isOpen && !shouldRender) {
    setRender(true);
    setIsClosing(false);
  }

  useEffect(() => {
    if (!isOpen && shouldRender) {
      const timer = window.setTimeout(() => {
        setIsClosing(true);
      }, 0);
      const closeTimer = window.setTimeout(() => {
        setRender(false);
        setIsClosing(false);
      }, duration);
      return () => {
        window.clearTimeout(timer);
        window.clearTimeout(closeTimer);
      };
    }
  }, [isOpen, shouldRender, duration]);

  return { shouldRender, isClosing };
}
