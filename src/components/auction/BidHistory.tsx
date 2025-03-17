
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Bid {
  address: string;
  amount: string;
  timestamp: Date;
  tokens: number;
}

interface BidHistoryProps {
  bids: Bid[];
  tokenName: string;
}

const BidHistory = ({ bids, tokenName }: BidHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Bids</CardTitle>
      </CardHeader>
      <CardContent>
        {bids.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bidder</TableHead>
                <TableHead>Amount (ETH)</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid, index) => (
                <TableRow key={index}>
                  <TableCell>{bid.address}</TableCell>
                  <TableCell>{bid.amount}</TableCell>
                  <TableCell>{bid.tokens} {tokenName}</TableCell>
                  <TableCell>{bid.timestamp.toLocaleTimeString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No bids yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BidHistory;
