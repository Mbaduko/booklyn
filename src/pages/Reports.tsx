import { useAuth } from '@/contexts/AuthContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/StatsCard';
import { BookOpen, Users, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Reports() {
  const { books, users, borrowRecords } = useLibrary();

  const categoryData = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  const COLORS = ['hsl(158,61%,31%)', 'hsl(158,50%,45%)', 'hsl(220,9%,46%)', 'hsl(0,100%,71%)', 'hsl(38,92%,50%)'];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold">Reports & Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard title="Total Books" value={books.reduce((s, b) => s + b.totalCopies, 0)} icon={BookOpen} variant="primary" />
          <StatsCard title="Active Users" value={users.filter(u => u.isActive).length} icon={Users} />
          <StatsCard title="Total Borrows" value={borrowRecords.length} icon={TrendingUp} variant="success" />
          <StatsCard title="Active Borrows" value={borrowRecords.filter(r => r.status !== 'returned' && r.status !== 'expired').length} icon={Clock} variant="warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Books by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(158,61%,31%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Category Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {chartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
