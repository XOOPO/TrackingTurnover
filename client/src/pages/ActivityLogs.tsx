import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";

export default function ActivityLogs() {
  const logsQuery = trpc.turnover.getActivityLogs.useQuery();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Success
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Activity Logs</h1>
          <p className="text-muted-foreground mt-2">
            View your search history and activity on the dashboard
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your last 50 turnover searches</CardDescription>
          </CardHeader>
          <CardContent>
            {logsQuery.isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {logsQuery.isError && (
              <div className="flex items-center gap-3 text-destructive py-8">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Error loading activity logs</p>
                  <p className="text-sm text-muted-foreground">
                    {logsQuery.error instanceof Error
                      ? logsQuery.error.message
                      : "An unknown error occurred"}
                  </p>
                </div>
              </div>
            )}

            {logsQuery.data && logsQuery.data.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No activity logs found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start searching for player turnover to see your activity here
                </p>
              </div>
            )}

            {logsQuery.data && logsQuery.data.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Player ID</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Error Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsQuery.data.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm:ss")}
                        </TableCell>
                        <TableCell>{log.playerId}</TableCell>
                        <TableCell>{log.provider}</TableCell>
                        <TableCell>{log.brand}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            {getStatusBadge(log.status)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                          {log.errorMessage || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
