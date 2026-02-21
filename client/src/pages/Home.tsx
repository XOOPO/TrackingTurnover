import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimePickerSeparate } from "@/components/TimePickerSeparate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface GameTurnover {
  gameName: string;
  lines?: string;
  betting?: number;
  spin?: number;
  totalBetting: number;
  betCount?: number;
}

interface TurnoverResult {
  playerId: string;
  provider: string;
  brand: string;
  games: GameTurnover[];
  totalTurnover: number;
  hasNineLines?: boolean;
  scrapedAt: Date;
}

export default function Home() {
  const [playerId, setPlayerId] = useState("");
  const [provider, setProvider] = useState("");
  const [brand, setBrand] = useState("");
  const [selectDate, setSelectDate] = useState("");
  const [fromTime, setFromTime] = useState("00:00:00");
  const [toTime, setToTime] = useState("23:59:59");
  const [searchResult, setSearchResult] = useState<TurnoverResult | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const providersQuery = trpc.turnover.getProviders.useQuery();
  const brandsQuery = trpc.turnover.getBrands.useQuery();
  const startSearchMutation = trpc.turnover.startSearch.useMutation();
  const getJobQuery = trpc.turnover.getJob.useQuery(
    { jobId: jobId || "" },
    { enabled: !!jobId && isPolling, refetchInterval: 1000 }
  );

  // Handle job completion
  useEffect(() => {
    if (!getJobQuery.data) return;

    const job = getJobQuery.data;
    if (job.status === "completed") {
      setSearchResult(job.result);
      // Stop polling FIRST before clearing jobId
      setIsPolling(false);
      // Dismiss loading toast
      toast.dismiss();
      // Use setTimeout to ensure state updates before clearing jobId
      setTimeout(() => {
        setJobId(null);
      }, 100);
      toast.success("Turnover data retrieved successfully");
    } else if (job.status === "failed") {
      // Dismiss loading toast
      toast.dismiss();
      toast.error(`Search failed: ${job.error}`);
      // Stop polling FIRST before clearing jobId
      setIsPolling(false);
      setTimeout(() => {
        setJobId(null);
      }, 100);
    }
  }, [getJobQuery.data]);

  const handleSearch = async () => {
    if (!playerId || !provider || !brand) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      // Clear previous search state before starting new search
      // Dismiss any existing toasts
      toast.dismiss();
      setSearchResult(null);
      setJobId(null);
      // Small delay to ensure state clears
      await new Promise(resolve => setTimeout(resolve, 50));
      setIsPolling(true);
      
      // HTML input type="date" already provides value in yyyy-mm-dd format
      const formattedDate = selectDate || undefined;
      
      const response = await startSearchMutation.mutateAsync({
        playerId,
        provider,
        brand,
        fromDate: formattedDate || undefined,
        fromTime: fromTime || undefined,
        toTime: toTime || undefined,
      });
      setJobId(response.jobId);
      toast.loading("Searching for turnover data...");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start search");
      setIsPolling(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const progress = getJobQuery.data?.progress || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Search Player Turnover</h1>
          <p className="text-muted-foreground mt-2">
            Enter player ID, select provider and brand to retrieve turnover data
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Parameters</CardTitle>
            <CardDescription>Fill in the details to search for player turnover data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="playerId">Player ID</Label>
                <Input
                  id="playerId"
                  placeholder="Enter player ID"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  disabled={isPolling}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={provider} onValueChange={setProvider} disabled={isPolling}>
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providersQuery.data?.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="brand">Brand</Label>
                <Select value={brand} onValueChange={setBrand} disabled={isPolling}>
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brandsQuery.data?.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="selectDate">Select Date (Optional)</Label>
                <Input
                  id="selectDate"
                  type="date"
                  value={selectDate}
                  onChange={(e) => setSelectDate(e.target.value)}
                  disabled={isPolling}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>From Time</Label>
                  <TimePickerSeparate
                    id="fromTime"
                    value={fromTime}
                    onChange={setFromTime}
                    disabled={isPolling}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>To Time</Label>
                  <TimePickerSeparate
                    id="toTime"
                    value={toTime}
                    onChange={setToTime}
                    disabled={isPolling}
                  />
                </div>
              </div>

              {isPolling && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Searching for turnover data...</p>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-blue-700 mt-1">{progress}% complete</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSearch}
                disabled={isPolling || startSearchMutation.isPending}
                className="w-full"
              >
                <Search className="mr-2 h-4 w-4" />
                {isPolling ? "Searching..." : "Search Turnover"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {searchResult && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                {searchResult.playerId} • {searchResult.provider} • {searchResult.brand}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Turnover</p>
                    <p className="text-2xl font-bold">{formatCurrency(searchResult.totalTurnover)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Games Played</p>
                    <p className="text-2xl font-bold">{searchResult.games.length}</p>
                  </div>
                </div>
              </div>

              {searchResult.games.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Game Name</TableHead>
                        <TableHead>Lines</TableHead>
                        <TableHead>Bet</TableHead>
                        <TableHead>Spins</TableHead>
                        <TableHead className="text-right">Total Betting</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResult.games.map((game, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{game.gameName}</TableCell>
                          <TableCell>{game.lines || "-"}</TableCell>
                          <TableCell>${game.betting?.toFixed(2) || "-"}</TableCell>
                          <TableCell>{game.spin || "-"}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(game.totalBetting)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground py-8">
                  <AlertCircle className="h-5 w-5" />
                  <span>No games found for this search</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
