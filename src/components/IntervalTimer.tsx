import { useEffect, useRef } from 'react';

type Callback = () => void;

function IntervalTimer(callback: Callback, delay: number): void {
  const setCallback = useRef<Callback>();

  useEffect(() => {
    setCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      if (setCallback.current) {
        setCallback.current();
      }
    };

    const id: ReturnType<typeof setInterval> = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export default IntervalTimer;
