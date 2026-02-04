import { useAuth } from '@/contexts/AuthContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Layout } from '@/components/Layout';
import { BorrowCard } from '@/components/BorrowCard';
import { BookOpen, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function MyBooks() {
  const { user } = useAuth();
  const { borrowRecords, getBookById, getBorrowStatus, refetchBorrowRecords } = useLibrary();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userRecords = borrowRecords.filter(r => r.userId === user?.id && r.status !== 'returned' && r.status !== 'expired');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchBorrowRecords();
      toast({
        title: 'Data Refreshed',
        description: 'Your books have been updated successfully.',
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to update your books. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold">My Books</h1>
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
        {userRecords.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display font-semibold text-lg">No active books</h3>
            <p className="text-muted-foreground mb-4">Browse our catalog to find your next read</p>
            <Link to="/catalog"><Button variant="emerald">Browse Catalog</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userRecords.map(record => {
              const book = getBookById(record.bookId);
              if (!book) return null;
              return <BorrowCard key={record.id} record={record} book={book} status={getBorrowStatus(record)} />;
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
