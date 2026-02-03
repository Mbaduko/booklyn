import { useAuth } from '@/contexts/AuthContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/StatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, TrendingUp, Clock, BarChart3, Book } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export default function Reports() {
  const { books, users, borrowRecords, getBookById, getBorrowHistory } = useLibrary();
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Dashboard colors
  const COLORS = ['#22705e', '#fa7575', '#fbbf24', '#60a5fa', '#a78bfa', '#f472b6'];

  // Fetch history data for borrow stats
  useEffect(() => {
    const fetchHistoryData = async () => {
      setIsLoadingHistory(true);
      try {
        const endDate = new Date();
        const startDate = subDays(endDate, 30); // Get last 30 days of data
        const history = await getBorrowHistory(startDate, endDate);
        setHistoryData(history);
      } catch (error) {
        console.error('Failed to fetch history data:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistoryData();
  }, [getBorrowHistory]);

  // Books Stats Data
  const categoryData = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const booksChartData = Object.entries(categoryData).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length]
  }));

  // Borrows Stats Data
  const generateWeeklyActivity = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map(day => {
      const dayStr = format(day, 'EEE');
      const dayHistory = historyData.filter(record => {
        const recordDate = new Date(record.reservedAt);
        return format(recordDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      const loans = dayHistory.filter(r => r.status === 'borrowed' || r.status === 'returned').length;
      const returns = dayHistory.filter(r => r.status === 'returned').length;

      return { day: dayStr, Loans: loans, Returns: returns };
    });
  };

  const generateBorrowCategoryData = () => {
    const categoryCount: { [key: string]: number } = {};
    
    historyData.forEach(record => {
      const book = getBookById(record.bookId);
      if (book) {
        categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
      }
    });
    
    return Object.entries(categoryCount).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }));
  };

  const weeklyActivity = generateWeeklyActivity();
  const borrowCategoryData = generateBorrowCategoryData();

  const totalBooks = books.reduce((s, b) => s + b.totalCopies, 0);
  const availableBooks = books.reduce((s, b) => s + b.availableCopies, 0);
  const borrowedBooks = totalBooks - availableBooks;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold">Reports & Analytics</h1>
        
        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="books" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Books Stats
            </TabsTrigger>
            <TabsTrigger value="borrows" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Borrows Stats
            </TabsTrigger>
          </TabsList>

          {/* Books Stats Tab */}
          <TabsContent value="books" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard title="Total Books" value={totalBooks} icon={BookOpen} variant="primary" />
              <StatsCard title="Available Books" value={availableBooks} icon={BookOpen} variant="success" />
              <StatsCard title="Borrowed Books" value={borrowedBooks} icon={BookOpen} variant="warning" />
              <StatsCard title="Categories" value={Object.keys(categoryData).length} icon={BookOpen} variant="default" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Books by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={booksChartData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#22705e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={booksChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {booksChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Borrows Stats Tab */}
          <TabsContent value="borrows" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard title="Total Borrows" value={borrowRecords.length} icon={TrendingUp} variant="success" />
              <StatsCard title="Active Borrows" value={borrowRecords.filter(r => r.status !== 'returned' && r.status !== 'expired').length} icon={Clock} variant="warning" />
              <StatsCard title="Overdue Books" value={borrowRecords.filter(r => r.status === 'overdue').length} icon={Clock} variant="destructive" />
              <StatsCard title="Active Users" value={users.filter(u => u.isActive).length} icon={Users} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyActivity}>
                      <XAxis dataKey="day" tick={{ fill: '#64748b' }} />
                      <YAxis tick={{ fill: '#64748b' }} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Bar dataKey="Loans" fill="#22705e" radius={[4, 4, 0, 0]} barSize={32} />
                      <Bar dataKey="Returns" fill="#fa7575" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Borrows by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={borrowCategoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        fill="#22705e"
                        label={false}
                      >
                        {borrowCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
