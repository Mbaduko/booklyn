import { BorrowRecord, Book, BorrowStatus } from '@/types/library';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Clock, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';

interface BorrowCardProps {
  record: BorrowRecord;
  book: Book;
  status: BorrowStatus;
  onConfirmPickup?: () => void;
  onConfirmReturn?: () => void;
  isLibrarian?: boolean;
  isLoading?: boolean;
}

export function BorrowCard({ 
  record, 
  book, 
  status, 
  onConfirmPickup, 
  onConfirmReturn,
  isLibrarian = false,
  isLoading = false
}: BorrowCardProps) {
  const getStatusConfig = (status: BorrowStatus) => {
    switch (status) {
      case 'reserved':
        return { 
          label: 'Awaiting Pickup', 
          icon: Clock, 
          variant: 'reserved' as const,
          color: 'text-warning'
        };
      case 'borrowed':
        return { 
          label: 'Borrowed', 
          icon: BookOpen, 
          variant: 'borrowed' as const,
          color: 'text-primary'
        };
      case 'due_soon':
        return { 
          label: 'Due Soon', 
          icon: AlertTriangle, 
          variant: 'due_soon' as const,
          color: 'text-warning'
        };
      case 'overdue':
        return { 
          label: 'Overdue', 
          icon: AlertTriangle, 
          variant: 'overdue' as const,
          color: 'text-destructive'
        };
      case 'returned':
        return { 
          label: 'Returned', 
          icon: CheckCircle2, 
          variant: 'returned' as const,
          color: 'text-muted-foreground'
        };
      default:
        return { 
          label: 'Unknown', 
          icon: BookOpen, 
          variant: 'outline' as const,
          color: 'text-muted-foreground'
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const overdueDays = record.dueDate && status === 'overdue' 
    ? differenceInDays(new Date(), record.dueDate) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="default" className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="h-16 w-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-6 w-6 text-primary/50" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-display font-semibold line-clamp-1">
                    {book.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {book.author}
                  </p>
                </div>
                <Badge variant={statusConfig.variant} className="flex items-center gap-1 flex-shrink-0">
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Reserved: {format(record.reservedAt, 'MMM d, yyyy')}</span>
                </div>
                
                {record.pickupDate && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Picked up: {format(record.pickupDate, 'MMM d, yyyy')}</span>
                  </div>
                )}
                
                {record.dueDate && (
                  <div className={`flex items-center gap-1.5 ${status === 'overdue' ? 'text-destructive' : status === 'due_soon' ? 'text-warning' : 'text-muted-foreground'}`}>
                    <Clock className="h-4 w-4" />
                    <span>Due: {format(record.dueDate, 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              {status === 'overdue' && (
                <p className="text-sm text-destructive mt-2 font-medium">
                  {overdueDays} day{overdueDays !== 1 ? 's' : ''} overdue
                </p>
              )}

              {(isLibrarian || status === 'reserved') && (
                <div className="flex gap-2 mt-4">
                  {status === 'reserved' && isLibrarian && (
                    <Button size="sm" variant="emerald" onClick={onConfirmPickup} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        'Confirm Pickup'
                      )}
                    </Button>
                  )}
                  {(status === 'borrowed' || status === 'due_soon' || status === 'overdue') && isLibrarian && (
                    <Button size="sm" variant="success" onClick={onConfirmReturn}>
                      Confirm Return
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
