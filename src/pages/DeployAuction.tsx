import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, usePublicClient } from "wagmi";
import { parseUnits } from "ethers";
import { toast } from "sonner";
import { Contract } from "ethers";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useSigner } from "@/hooks/useSigner";
import { factoryAuctionAbi } from "@/utils/factoryAuctionAbi";
import {
  VITE_AUCTION_FACTORY_CONTRACT_ADDRESS,
  VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS,
  VITE_AUCTION_TOKEN_CONTRACT_ADDRESS,
} from "@/config/env";
import { useTokens } from "@/hooks/token/useTokens";
import { ArrowLeft } from "lucide-react";
import { formatTime } from "@/lib/helper";
import { useWallet } from "@/hooks/useWallet";

const formSchema = z.object({
  startingPrice: z.string().min(1, { message: "Starting price is required" }),
  discountRate: z.string().min(1, { message: "Discount rate is required" }),
  token: z.string().min(1, { message: "Token is required" }),
  paymentToken: z.string().min(1, { message: "Payment token is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  reservePrice: z.string().min(1, { message: "Reserve price is required" }),
  biddingTime: z.string().min(1, { message: "Bidding time is required" }),
  isStoppable: z.boolean().default(true),
});

export default function DeployAuction() {
  const { isConnected } = useWallet();
  const { signer } = useSigner();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tokens } = useTokens();

  const confidentialTokens = tokens.filter((token) => token.isConfidential);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startingPrice: "10",
      discountRate: "1",
      token: VITE_AUCTION_TOKEN_CONTRACT_ADDRESS,
      paymentToken: VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS,
      amount: "1000",
      reservePrice: "1",
      biddingTime: "604800", // 1 hour in seconds
      isStoppable: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!signer) {
      toast.error("Wallet not connected");
      return;
    }

    // if (!ensureSepolia()) {
    //   return;
    // }

    try {
      setIsSubmitting(true);

      // Connect to the factory contract
      const factoryContract = new Contract(
        VITE_AUCTION_FACTORY_CONTRACT_ADDRESS,
        factoryAuctionAbi,
        signer
      );

      // Prepare the parameters for the createAuction function
      // const startingPrice = parseUnits(values.startingPrice, 6);
      // const discountRate = parseUnits(values.discountRate, 6);
      // const amount = parseUnits(values.amount, 6);
      // const reservePrice = parseUnits(values.reservePrice, 6);
      // const biddingTime = Number(values.biddingTime);

      // Create the auction
      const tx = await factoryContract.createAuction(
        values.startingPrice,
        values.discountRate,
        values.token,
        values.paymentToken,
        values.amount,
        values.reservePrice,
        values.biddingTime,
        values.isStoppable
      );

      toast.loading("Creating auction...");

      // Wait for the transaction to be mined
      const receipt = await tx.wait();

      // Get the auction address from the event
      const auctionCreatedEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === "AuctionCreated"
      );

      let auctionAddress;
      if (auctionCreatedEvent) {
        auctionAddress = auctionCreatedEvent.args[0];
      }

      toast.dismiss();
      toast.success("Auction created successfully!");

      navigate("/auction");
    } catch (error) {
      console.error("Error creating auction:", error);
      toast.error("Failed to create auction. See console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto py-8 mt-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Deploy New Auction</CardTitle>
            <CardDescription>
              Please connect your wallet to deploy a new auction
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 mt-10">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate("/auction")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Auctions
      </Button>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Deploy New Auction</CardTitle>
          <CardDescription>
            Configure parameters for a new Dutch auction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Price</FormLabel>
                      <FormControl>
                        <Input placeholder="10" {...field} />
                      </FormControl>
                      <FormDescription>
                        Initial token price at auction start
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Rate</FormLabel>
                      <FormControl>
                        <Input placeholder="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Rate at which price decreases per second
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auction Token</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select token to auction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {confidentialTokens
                            .filter((token) => token.isAuctionToken)
                            .map((token) => (
                              <SelectItem
                                key={token.address}
                                value={token.address || ""}
                              >
                                {token.name} ({token.symbol})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The token that will be auctioned
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Token</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment token" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {confidentialTokens
                            .filter((token) => token.isAuctionPaymentToken)
                            .map((token) => (
                              <SelectItem
                                key={token.address}
                                value={token.address || ""}
                              >
                                {token.name} ({token.symbol})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The token that will be used for payments
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="1000" {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of tokens available for auction
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reservePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reserve Price</FormLabel>
                      <FormControl>
                        <Input placeholder="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Minimum price for the tokens
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="biddingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auction Duration (seconds)</FormLabel>
                      <div className="space-y-2">
                        <FormControl>
                          <Input placeholder="604800" {...field} />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          {formatTime(Number(field.value))}
                        </div>
                      </div>
                      <FormDescription>
                        How long the auction will run (in seconds)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isStoppable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Stoppable Auction
                      </FormLabel>
                      <FormDescription>
                        Allow the auction to be stopped manually
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <CardFooter className="px-0 pb-0">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Auction..." : "Deploy Auction"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
