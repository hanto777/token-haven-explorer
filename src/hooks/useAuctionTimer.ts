
import { useState, useEffect } from "react";

export function useAuctionTimer(endTime: number, isActive: boolean) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Format time remaining in HH:MM:SS
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate and update time remaining
  useEffect(() => {
    if (!isActive) {
      setTimeRemaining(0);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeRemaining(remaining);
    };

    // Initial calculation
    calculateTimeRemaining();

    // Set up interval to update the timer
    const interval = setInterval(calculateTimeRemaining, 1000);

    // Clean up interval
    return () => clearInterval(interval);
  }, [endTime, isActive]);

  const formattedTimeRemaining = formatTimeRemaining(timeRemaining);

  return {
    timeRemaining,
    formattedTimeRemaining
  };
}
