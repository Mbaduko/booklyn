import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, CheckCircle2, BookOpen, Search, Filter, RefreshCw } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useLibrary } from '@/contexts/LibraryContext';
import { BorrowRecord } from '@/types/library';

export default function History() {
  const { getBookById, getBorrowHistory } = useLibrary();
  const [history, setHistory] = useState<BorrowRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<BorrowRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'7days' | '30days' | '90days' | 'custom'>('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      let fromDate: Date | undefined;
      let toDate: Date | undefined;

      switch (dateFilter) {
        case '7days':
          fromDate = subDays(new Date(), 7);
          break;
        case '30days':
          fromDate = subDays(new Date(), 30);
          break;
        case '90days':
          fromDate = subDays(new Date(), 90);
          break;
        case 'custom':
          if (customStartDate) {
            fromDate = new Date(customStartDate);
          }
          if (customEndDate) {
            toDate = new Date(customEndDate);
          }
          break;
      }

      const historyData = await getBorrowHistory(fromDate, toDate);
      setHistory(historyData);
      setFilteredHistory(historyData);
      toast({
        title: 'Data Refreshed',
        description: 'Your borrowing history has been updated successfully.',
      });
    } catch (error) {
      console.error('Failed to refresh history:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to update borrowing history. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch history data
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        let fromDate: Date | undefined;
        let toDate: Date | undefined;

        switch (dateFilter) {
          case '7days':
            fromDate = subDays(new Date(), 7);
            break;
          case '30days':
            fromDate = subDays(new Date(), 30);
            break;
          case '90days':
            fromDate = subDays(new Date(), 90);
            break;
          case 'custom':
            if (customStartDate) {
              fromDate = new Date(customStartDate);
            }
            if (customEndDate) {
              toDate = new Date(customEndDate);
            }
            break;
        }

        const historyData = await getBorrowHistory(fromDate, toDate);
        setHistory(historyData);
        setFilteredHistory(historyData);
      } catch (error) {
        console.error('Failed to fetch history:', error);
        toast({
          title: 'Error',
          description: 'Failed to load borrowing history',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [dateFilter, customStartDate, customEndDate, getBorrowHistory]);

  // Filter history based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredHistory(history);
    } else {
      const filtered = history.filter(record => {
        const book = getBookById(record.bookId);
        return (
          book?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book?.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.status.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredHistory(filtered);
    }
  }, [searchQuery, history, getBookById]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'reserved':
        return { label: 'Reserved', variant: 'warning' as const, icon: Clock };
      case 'borrowed':
        return { label: 'Borrowed', variant: 'default' as const, icon: BookOpen };
      case 'due_soon':
        return { label: 'Due Soon', variant: 'warning' as const, icon: Clock };
      case 'overdue':
        return { label: 'Overdue', variant: 'destructive' as const, icon: Clock };
      case 'expired':
        return { label: 'Expired', variant: 'secondary' as const, icon: Clock };
      case 'returned':
        return { label: 'Returned', variant: 'secondary' as const, icon: CheckCircle2 };
      default:
        return { label: status, variant: 'outline' as const, icon: BookOpen };
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Borrowing History</h1>
            <p className="text-muted-foreground">View your complete borrowing history</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by book title, author, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={dateFilter === '7days' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('7days')}
              >
                Last 7 days
              </Button>
              <Button
                variant={dateFilter === '30days' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('30days')}
              >
                Last 30 days
              </Button>
              <Button
                variant={dateFilter === '90days' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('90days')}
              >
                Last 90 days
              </Button>
              <Button
                variant={dateFilter === 'custom' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('custom')}
              >
                Custom Range
              </Button>
            </div>

            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
              <div className="flex gap-2 items-center">
                <Input
                  type="date"
                  placeholder="Start date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
                <span>to</span>
                <Input
                  type="date"
                  placeholder="End date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* History List */}
        <Card>
          <CardHeader>
            <CardTitle>History ({filteredHistory.length} records)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading history...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <h3 className="font-display font-semibold text-lg mb-1">No history found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((record) => {
                  const book = getBookById(record.bookId);
                  if (!book) return null;

                  const statusConfig = getStatusConfig(record.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                        </div>
                        <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Reserved: {format(record.reservedAt, 'yyyy/MM/dd HH:mm')}</span>
                        </div>
                        
                        {record.reservationExpiresAt && (
                          <div className="flex items-center gap-1 text-warning">
                            <Clock className="h-3 w-3" />
                            <span>Expires: {format(record.reservationExpiresAt, 'yyyy/MM/dd HH:mm')}</span>
                          </div>
                        )}
                        
                        {record.pickupDate && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Picked up: {format(record.pickupDate, 'yyyy/MM/dd HH:mm')}</span>
                          </div>
                        )}
                        
                        {record.dueDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Due: {format(record.dueDate, 'yyyy/MM/dd HH:mm')}</span>
                          </div>
                        )}
                        
                        {record.returnDate && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Returned: {format(record.returnDate, 'yyyy/MM/dd HH:mm')}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
