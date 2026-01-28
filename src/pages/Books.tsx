import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Layout } from '@/components/Layout';
import { BookCard } from '@/components/BookCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Filter, BookOpen, Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Book } from '@/types/library';
import { createBook, updateBook } from '@/api/books';

export default function Books() {
  const { user } = useAuth();
  const { books, refetchBooks, reserveBook } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isLibrarian = user?.role === 'librarian';

  const categories = [...new Set(books.map(b => b.category))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);
    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    totalCopies: 1,
    description: '',
    publishedYear: new Date().getFullYear(),
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');

  const handleAddBook = async () => {
    if (!isLibrarian) return;
    
    try {
      setIsLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('isbn', formData.isbn);
      formDataToSend.append('totalCopies', formData.totalCopies.toString());
      formDataToSend.append('publishedYear', formData.publishedYear.toString());
      formDataToSend.append('description', formData.description);
      
      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }

      await createBook(formDataToSend);
      
      await refetchBooks();
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: 'Book added',
        description: `${formData.title} has been added to the catalog.`,
      });
    } catch (error) {
      console.error('Failed to add book:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add book',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBook = async () => {
    if (!isLibrarian || !selectedBook) return;
    
    try {
      setIsLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('isbn', formData.isbn);
      formDataToSend.append('totalCopies', formData.totalCopies.toString());
      formDataToSend.append('publishedYear', formData.publishedYear.toString());
      formDataToSend.append('description', formData.description);
      
      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }

      await updateBook(selectedBook.id, formDataToSend);
      
      await refetchBooks();
      setIsEditDialogOpen(false);
      setSelectedBook(null);
      resetForm();
      toast({
        title: 'Book updated',
        description: `${formData.title} has been updated.`,
      });
    } catch (error) {
      console.error('Failed to update book:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update book',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      category: '',
      isbn: '',
      totalCopies: 1,
      description: '',
      publishedYear: new Date().getFullYear(),
    });
    setCoverImage(null);
    setCoverImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image size must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }

      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview('');
  };

  const openEditDialog = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      totalCopies: book.totalCopies,
      description: book.description || '',
      publishedYear: book.publishedYear || new Date().getFullYear(),
    });
    setCoverImagePreview(book.coverImage || '');
    setIsEditDialogOpen(true);
  };

  const handleBorrow = (book: Book) => {
    setSelectedBook(book);
    setIsBorrowDialogOpen(true);
  };

  const confirmBorrow = () => {
    if (selectedBook && user) {
      reserveBook(selectedBook.id, user.id);
      setIsBorrowDialogOpen(false);
      toast({
        title: 'Book reserved!',
        description: `${selectedBook.title} has been reserved. Please pick it up within 48 hours.`,
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">
              {isLibrarian ? 'Book Management' : 'Book Catalog'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLibrarian ? 'Manage your library catalog' : 'Browse and borrow books'}
            </p>
          </div>
          {isLibrarian && (
            <Button variant="emerald" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Book
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{filteredBooks.length} books</Badge>
          {searchQuery && (
            <span className="text-sm text-muted-foreground">
              matching "{searchQuery}"
            </span>
          )}
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display font-semibold text-lg">No books found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BookCard
                  book={book}
                  isLibrarian={isLibrarian}
                  onBorrow={() => handleBorrow(book)}
                  onEdit={() => openEditDialog(book)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Add Book Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
              <DialogDescription>
                Add a new book to your library catalog
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="copies">Total Copies</Label>
                  <Input
                    id="copies"
                    type="number"
                    min={1}
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Published Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.publishedYear}
                    onChange={(e) => setFormData({ ...formData, publishedYear: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  {coverImagePreview ? (
                    <div className="relative">
                      <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        className="h-20 w-16 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={removeCoverImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-20 w-16 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, WebP (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="emerald" onClick={handleAddBook} disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Book'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Book Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Book</DialogTitle>
              <DialogDescription>
                Update book information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-author">Author</Label>
                <Input
                  id="edit-author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-copies">Total Copies</Label>
                  <Input
                    id="edit-copies"
                    type="number"
                    min={1}
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-coverImage">Cover Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  {coverImagePreview ? (
                    <div className="relative">
                      <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        className="h-20 w-16 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={removeCoverImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-20 w-16 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="edit-coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, WebP (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="emerald" onClick={handleEditBook} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Borrow Confirmation Dialog */}
        <Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Reservation</DialogTitle>
              <DialogDescription>
                You are about to reserve "{selectedBook?.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                This book will be reserved for you for 48 hours. Please visit the library 
                to pick it up within this time, or the reservation will expire.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBorrowDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="emerald" onClick={confirmBorrow}>
                Confirm Reservation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
