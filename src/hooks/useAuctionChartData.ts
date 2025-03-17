
import { useState, useEffect } from "react";

interface ChartDataPoint {
  time: string;
  price?: number;
  tokens?: number;
}

interface UseAuctionChartDataProps {
  startPrice: number;
  endPrice: number;
  duration: number;
  initialTokenSupply: number;
}

export const useAuctionChartData = ({
  startPrice,
  endPrice,
  duration,
  initialTokenSupply
}: UseAuctionChartDataProps) => {
  const [priceChartData, setPriceChartData] = useState<Array<ChartDataPoint>>([]);
  const [tokenChartData, setTokenChartData] = useState<Array<ChartDataPoint>>([]);

  // Generate initial chart data
  useEffect(() => {
    const generateChartData = () => {
      const priceData: ChartDataPoint[] = [];
      const tokenData: ChartDataPoint[] = [];
      
      // Generate data points for the entire auction duration
      for (let hour = 0; hour <= duration; hour++) {
        const elapsedRatio = hour / duration;
        const price = startPrice - (startPrice - endPrice) * elapsedRatio;
        const time = `${hour}h`;
        
        priceData.push({ time, price: Math.max(endPrice, price) });
        
        // For token chart, we'll just use a linear decrease for now as a placeholder
        // In a real application, this would be based on actual token sales
        tokenData.push({ 
          time, 
          tokens: initialTokenSupply - (initialTokenSupply * 0.1 * elapsedRatio) 
        });
      }
      
      setPriceChartData(priceData);
      setTokenChartData(tokenData);
    };
    
    generateChartData();
  }, [startPrice, endPrice, duration, initialTokenSupply]);

  return {
    priceChartData,
    tokenChartData,
    setPriceChartData,
    setTokenChartData
  };
};
