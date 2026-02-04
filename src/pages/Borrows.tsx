import { useAuth } from '@/contexts/AuthContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Layout } from '@/components/Layout';
import { BorrowCard } from '@/components/BorrowCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookOpen, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function Borrows() {
  const { user } = useAuth();
  const { borrowRecords, getBookById, getUserById, getBorrowStatus, confirmPickup, confirmReturn, isLoadingBorrowRecords, refetchBorrowRecords } = useLibrary();

  const isLibrarian = user?.role === 'librarian';
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const activeRecords = borrowRecords.filter(r => r.status !== 'returned' && r.status !== 'expired');
  const reservedRecords = activeRecords.filter(r => r.status === 'reserved');
  const borrowedRecords = activeRecords.filter(r => r.status === 'borrowed' || getBorrowStatus(r) === 'due_soon');
  const overdueRecords = activeRecords.filter(r => getBorrowStatus(r) === 'overdue');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchBorrowRecords();
      toast({
        title: 'Data Refreshed',
        description: 'Borrow records have been updated successfully.',
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to update borrow records. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show loading animation while data is being fetched
  if (isLoadingBorrowRecords) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="h-12 w-12 animate-spin text-[#22705e]" />
            <p className="text-lg font-medium text-gray-600">Loading borrow records...</p>
            <p className="text-sm text-gray-500">Please wait while we fetch the latest data</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const handleConfirmPickup = async (recordId: string) => {
    setLoadingId(recordId);
    try {
      await confirmPickup(recordId);
      toast({
        title: 'Pickup Confirmed',
        description: 'Book pickup has been confirmed successfully.',
      });
    } catch (error) {
      console.error('Failed to confirm pickup:', error);
      toast({
        title: 'Pickup Failed',
        description: error instanceof Error ? error.message : 'Failed to confirm book pickup',
        variant: 'destructive',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirmReturn = async (recordId: string) => {
    setLoadingId(recordId);
    try {
      await confirmReturn(recordId);
      toast({
        title: 'Return Confirmed',
        description: 'Book return has been confirmed successfully.',
      });
    } catch (error) {
      console.error('Failed to confirm return:', error);
      toast({
        title: 'Return Failed',
        description: error instanceof Error ? error.message : 'Failed to confirm book return',
        variant: 'destructive',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const renderRecords = (records: typeof borrowRecords) => {
    if (records.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No records found</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {records.map(record => {
          const book = getBookById(record.bookId);
          if (!book) return null;
          return (
            <BorrowCard
              key={record.id}
              record={record}
              book={book}
              status={getBorrowStatus(record)}
              isLibrarian={isLibrarian}
              isLoading={loadingId === record.id}
              onConfirmPickup={() => handleConfirmPickup(record.id)}
              onConfirmReturn={() => handleConfirmReturn(record.id)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Borrowing Management</h1>
            <p className="text-muted-foreground mt-1">Track and manage all book borrowings</p>
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

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({reservedRecords.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({borrowedRecords.length})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({overdueRecords.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-6">{renderRecords(reservedRecords)}</TabsContent>
          <TabsContent value="active" className="mt-6">{renderRecords(borrowedRecords)}</TabsContent>
          <TabsContent value="overdue" className="mt-6">{renderRecords(overdueRecords)}</TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
}
