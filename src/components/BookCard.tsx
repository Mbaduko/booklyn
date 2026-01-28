import { Book } from '@/types/library';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface BookCardProps {
  book: Book;
  onBorrow?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
  isLibrarian?: boolean;
}

export function BookCard({ book, onBorrow, onEdit, showActions = true, isLibrarian = false }: BookCardProps) {
  const isAvailable = book.availableCopies > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="interactive" className="h-full overflow-hidden group">
        <div className="relative h-48 bg-muted flex items-center justify-center">
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt={book.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default icon if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <BookOpen className={`h-16 w-16 text-primary/30 group-hover:scale-110 transition-transform duration-300 ${book.coverImage ? 'hidden' : ''}`} />
          <div className="absolute top-3 right-3">
            <Badge variant={isAvailable ? "available" : "unavailable"}>
              {isAvailable ? `${book.availableCopies} available` : 'Unavailable'}
            </Badge>
          </div>
        </div>
        <CardContent className="p-5 space-y-3">
          <div>
            <h3 className="font-display font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {book.title}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <User className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{book.author}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {book.category}
            </Badge>
            {book.publishedYear && (
              <Badge variant="secondary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {book.publishedYear}
              </Badge>
            )}
          </div>

          {book.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {book.description}
            </p>
          )}

          {showActions && (
            <div className="flex gap-2 pt-2">
              {!isLibrarian && isAvailable && (
                <Button 
                  variant="emerald" 
                  size="sm" 
                  className="flex-1"
                  onClick={onBorrow}
                >
                  Borrow
                </Button>
              )}
              {isLibrarian && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={onEdit}
                >
                  Edit
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
