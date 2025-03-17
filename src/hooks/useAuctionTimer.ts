
import { useState, useEffect } from "react";

interface UseAuctionTimerProps {
  isAuctionActive: boolean;
  initialDuration: number;
  startPrice: number;
  endPrice: number;
}

interface UseAuctionTimerReturn {
  timeRemaining: number;
  currentPrice: number;
  formatTimeRemaining: (seconds: number) => string;
}

export const useAuctionTimer = ({
  isAuctionActive,
  initialDuration,
  startPrice,
  endPrice
}: UseAuctionTimerProps): UseAuctionTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState<number>(initialDuration * 60 * 60);
  const [currentPrice, setCurrentPrice] = useState<number>(startPrice);

  // Format time remaining in HH:MM:SS
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update timer and price
  useEffect(() => {
    if (!isAuctionActive) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });

      // Calculate current price based on time elapsed
      const totalDuration = initialDuration * 60 * 60;
      const elapsedRatio = 1 - (timeRemaining / totalDuration);
      const newPrice = startPrice - (startPrice - endPrice) * elapsedRatio;
      setCurrentPrice(Math.max(endPrice, newPrice));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, startPrice, endPrice, initialDuration, isAuctionActive]);

  return {
    timeRemaining,
    currentPrice,
    formatTimeRemaining
  };
};
