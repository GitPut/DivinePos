import React from "react";

// Defines the type for the callback function
type Callback = () => void;

function useInterval(
  callback: Callback,
  delay: number | null
): React.MutableRefObject<number | null> {
  const intervalRef = React.useRef<number | null>(null);
  const savedCallback = React.useRef<Callback>(callback);

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    if (typeof delay === "number") {
      intervalRef.current = window.setInterval(tick, delay);
      return () => {
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
        }
      };
    }

    // Optional: Clear the interval if the component unmounts or delay changes to null.
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [delay]);

  return intervalRef;
}

export default useInterval;
