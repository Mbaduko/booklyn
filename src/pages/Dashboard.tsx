import { useAuth } from '@/contexts/AuthContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Layout } from '@/components/Layout';
import { StatsCard } from '@/components/StatsCard';
import { BorrowCard } from '@/components/BorrowCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  CalendarClock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  const { 
    books, 
    users, 
    borrowRecords, 
    getBookById, 
    getUserById,
    getBorrowStatus,
    confirmPickup,
    confirmReturn
  } = useLibrary();

  const isLibrarian = user?.role === 'librarian';

  // Stats calculations
  const totalBooks = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const availableBooks = books.reduce((sum, b) => sum + b.availableCopies, 0);
  const activeRecords = borrowRecords.filter(r => r.status !== 'returned');
  const overdueRecords = activeRecords.filter(r => getBorrowStatus(r) === 'overdue');
  const reservedRecords = activeRecords.filter(r => r.status === 'reserved');
  const borrowedRecords = activeRecords.filter(r => r.status === 'borrowed' || getBorrowStatus(r) === 'due_soon');

  // User-specific records
  const userRecords = borrowRecords.filter(r => r.userId === user?.id && r.status !== 'returned');
  const userOverdue = userRecords.filter(r => getBorrowStatus(r) === 'overdue');
  const userDueSoon = userRecords.filter(r => getBorrowStatus(r) === 'due_soon');
  const userReserved = userRecords.filter(r => r.status === 'reserved');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLibrarian) {
    return (
      <Layout>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-display font-bold">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's an overview of your library
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Books"
              value={totalBooks}
              subtitle={`${availableBooks} available`}
              icon={BookOpen}
              variant="primary"
            />
            <StatsCard
              title="Active Users"
              value={users.filter(u => u.isActive).length}
              subtitle={`${users.length} total registered`}
              icon={Users}
              variant="default"
            />
            <StatsCard
              title="Pending Pickups"
              value={reservedRecords.length}
              subtitle="Awaiting confirmation"
              icon={Clock}
              variant="warning"
            />
            <StatsCard
              title="Overdue Books"
              value={overdueRecords.length}
              subtitle="Requires attention"
              icon={AlertTriangle}
              variant="destructive"
            />
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Pickups */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-warning" />
                    Pending Pickups
                  </CardTitle>
                  <Badge variant="warning">{reservedRecords.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reservedRecords.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No pending pickups
                    </p>
                  ) : (
                    reservedRecords.slice(0, 3).map(record => {
                      const book = getBookById(record.bookId);
                      const borrower = getUserById(record.userId);
                      if (!book) return null;
                      return (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{book.title}</p>
                            <p className="text-xs text-muted-foreground">{borrower?.name}</p>
                          </div>
                          <Button size="sm" variant="emerald" onClick={() => confirmPickup(record.id)}>
                            Confirm
                          </Button>
                        </div>
                      );
                    })
                  )}
                  {reservedRecords.length > 3 && (
                    <Link to="/borrows">
                      <Button variant="ghost" size="sm" className="w-full">
                        View all <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Overdue Books */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Overdue Books
                  </CardTitle>
                  <Badge variant="error">{overdueRecords.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {overdueRecords.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No overdue books
                    </p>
                  ) : (
                    overdueRecords.slice(0, 3).map(record => {
                      const book = getBookById(record.bookId);
                      const borrower = getUserById(record.userId);
                      if (!book) return null;
                      return (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                          <div>
                            <p className="font-medium text-sm">{book.title}</p>
                            <p className="text-xs text-muted-foreground">{borrower?.name}</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => confirmReturn(record.id)}>
                            Return
                          </Button>
                        </div>
                      );
                    })
                  )}
                  {overdueRecords.length > 3 && (
                    <Link to="/borrows">
                      <Button variant="ghost" size="sm" className="w-full">
                        View all <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to="/books">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Manage Books</span>
                    </Button>
                  </Link>
                  <Link to="/users">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                      <Users className="h-5 w-5" />
                      <span>Manage Users</span>
                    </Button>
                  </Link>
                  <Link to="/borrows">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Borrowing</span>
                    </Button>
                  </Link>
                  <Link to="/reports">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>View Reports</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </Layout>
    );
  }

  // Client Dashboard
  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-display font-bold">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your borrowed books and explore our catalog
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Currently Borrowed"
            value={userRecords.filter(r => r.status === 'borrowed').length}
            icon={BookOpen}
            variant="primary"
          />
          <StatsCard
            title="Awaiting Pickup"
            value={userReserved.length}
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Due Soon"
            value={userDueSoon.length}
            icon={CalendarClock}
            variant="warning"
          />
          <StatsCard
            title="Overdue"
            value={userOverdue.length}
            icon={AlertTriangle}
            variant="destructive"
          />
        </motion.div>

        {/* My Active Books */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Active Books</CardTitle>
              <Link to="/my-books">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {userRecords.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">You don't have any active books</p>
                  <Link to="/catalog">
                    <Button variant="emerald" className="mt-4">
                      Browse Catalog
                    </Button>
                  </Link>
                </div>
              ) : (
                userRecords.slice(0, 3).map(record => {
                  const book = getBookById(record.bookId);
                  if (!book) return null;
                  return (
                    <BorrowCard
                      key={record.id}
                      record={record}
                      book={book}
                      status={getBorrowStatus(record)}
                    />
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/catalog">
              <Card variant="interactive" className="p-6 flex items-center gap-4 h-full">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">Browse Catalog</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore {books.length} books in our collection
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto text-muted-foreground" />
              </Card>
            </Link>
            <Link to="/history">
              <Card variant="interactive" className="p-6 flex items-center gap-4 h-full">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">Borrowing History</h3>
                  <p className="text-sm text-muted-foreground">
                    View your past borrowed books
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto text-muted-foreground" />
              </Card>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}
