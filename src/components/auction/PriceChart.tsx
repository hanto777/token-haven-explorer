
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface PriceChartProps {
  data: Array<{ time: string; price: number }>;
}

const PriceChart = ({ data }: PriceChartProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Price Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer 
            config={{
              price: { color: "#9333ea" }
            }}
          >
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis 
                domain={[0, 'dataMax + 10']}
                tickFormatter={(value) => `${value} ETH`}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow-md">
                        <p className="text-sm">{`Time: ${payload[0].payload.time}`}</p>
                        <p className="text-sm font-semibold">{`Price: ${payload[0].value} ETH`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#9333ea" 
                strokeWidth={2} 
                name="Price (ETH)" 
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
