import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Eye, EyeOff, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Credentials() {
  const { data: credentials, isLoading } = trpc.turnover.getCredentials.useQuery();
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const togglePasswordVisibility = (key: string) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success(`${field} copied to clipboard`);
    } catch (err) {
      toast.error('Failed to copy. Please try again');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Group credentials by provider
  const groupedCredentials = credentials?.reduce((acc, cred) => {
    if (!acc[cred.provider]) {
      acc[cred.provider] = [];
    }
    acc[cred.provider].push(cred);
    return acc;
  }, {} as Record<string, typeof credentials>);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Provider Credentials</h1>
        <p className="text-muted-foreground mt-2">
          View login credentials for all providers and brands
        </p>
      </div>

      <div className="space-y-6">
        {groupedCredentials && Object.entries(groupedCredentials).map(([provider, creds]) => (
          <Card key={provider}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {provider}
                <Badge variant="secondary">{creds.length} brands</Badge>
              </CardTitle>
              <CardDescription>
                Login credentials for {provider} across different brands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Login URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creds.map((cred) => {
                    const passwordKey = `${cred.provider}-${cred.brand}-password`;
                    const isPasswordVisible = visiblePasswords.has(passwordKey);
                    
                    return (
                      <TableRow key={`${cred.provider}-${cred.brand}`}>
                        <TableCell>
                          <Badge variant="outline">{cred.brand}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {cred.username}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(cred.username, 'Username')}
                            >
                              {copiedField === 'Username' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {isPasswordVisible ? cred.password : '••••••••'}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePasswordVisibility(passwordKey)}
                            >
                              {isPasswordVisible ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(cred.password, 'Password')}
                            >
                              {copiedField === 'Password' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={cred.loginUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <span className="text-sm truncate max-w-xs">
                              {cred.loginUrl}
                            </span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
