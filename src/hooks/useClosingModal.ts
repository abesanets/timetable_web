import { useState, useEffect } from 'react';

export function useClosingModal(isOpen: boolean, duration: number = 300) {
  const [shouldRender, setRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    if (isOpen) {
      setRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      timeoutId = window.setTimeout(() => {
        setRender(false);
        setIsClosing(false);
      }, duration);
    }
    return () => window.clearTimeout(timeoutId);
  }, [isOpen, shouldRender, duration]);

  return { shouldRender, isClosing };
}
