import { useAuth } from '@/contexts/AuthContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/StatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BookOpen, Users, TrendingUp, Clock, BarChart3, Book, Download, Calendar, FileText, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function Reports() {
  const { books, users, borrowRecords, getBookById, getBorrowHistory } = useLibrary();
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Report generation state
  const [reportStartDate, setReportStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [reportEndDate, setReportEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reportFormat, setReportFormat] = useState<'excel' | 'pdf'>('excel');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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

  // Report generation function
  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const startDate = new Date(reportStartDate);
      const endDate = new Date(reportEndDate);
      
      // Fetch history data for the selected date range
      const reportData = await getBorrowHistory(startDate, endDate);
      
      if (reportData.length === 0) {
        toast({
          title: 'No Data',
          description: 'No borrow records found in the selected date range',
          variant: 'destructive',
        });
        return;
      }

      // Generate CSV for Excel format
      if (reportFormat === 'excel') {
        const excel = generateExcel(reportData, startDate, endDate);
        XLSX.writeFile(excel, `borrow-report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.xlsx`);
      } else {
        // Generate actual PDF
        const pdf = generatePDF(reportData, startDate, endDate);
        pdf.save(`borrow-report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.pdf`);
      }

      toast({
        title: 'Report Generated',
        description: `Successfully generated ${reportFormat.toUpperCase()} report with ${reportData.length} records`,
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateExcel = (data: any[], startDate: Date, endDate: Date) => {
    const wb = XLSX.utils.book_new();
    
    // Create title and summary worksheet
    const summaryData = [
      ['BORROWING HISTORY REPORT'],
      [''],
      ['Date Range:', `${format(startDate, 'yyyy/MM/dd')} - ${format(endDate, 'yyyy/MM/dd')}`],
      ['Total Records:', data.length],
      [''],
      ['SUMMARY'],
      ['Total Borrows:', data.length],
      ['Returned:', data.filter(r => r.status === 'returned').length],
      ['Active:', data.filter(r => r.status === 'borrowed' || r.status === 'due_soon' || r.status === 'overdue').length],
      ['Overdue:', data.filter(r => r.status === 'overdue').length],
      ['Expired:', data.filter(r => r.status === 'expired').length],
      [''],
      ['DETAILED RECORDS'],
      []
    ];
    
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Style the summary worksheet
    wsSummary['A1'].s = {
      font: { sz: 16, bold: true },
      alignment: { horizontal: 'center' }
    };
    
    // Style section titles (SUMMARY and DETAILED RECORDS)
    wsSummary['A6'].s = {
      font: { sz: 14, bold: true },
      fill: { fgColor: { rgb: 'FF22705E' } }
    };
    
    wsSummary['A13'].s = {
      font: { sz: 14, bold: true },
      fill: { fgColor: { rgb: 'FF22705E' } }
    };
    
    // Style summary labels
    wsSummary['A3'].s = { font: { bold: true } };
    wsSummary['A4'].s = { font: { bold: true } };
    wsSummary['A7'].s = { font: { bold: true } };
    wsSummary['A8'].s = { font: { bold: true } };
    wsSummary['A9'].s = { font: { bold: true } };
    wsSummary['A10'].s = { font: { bold: true } };
    wsSummary['A11'].s = { font: { bold: true } };
    
    // Merge title cell
    wsSummary['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }
    ];
    
    // Set column widths for summary
    wsSummary['!cols'] = [
      { wch: 25 }, // Column A
      { wch: 30 }  // Column B
    ];
    
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    
    // Create detailed records worksheet
    const headers = [
      'No.',
      'Book Title',
      'Book Author',
      'Book Category',
      'User Name',
      'User Email',
      'Status',
      'Reserved At',
      'Reservation Expires At',
      'Pickup Date',
      'Due Date',
      'Return Date'
    ];
    
    const rows = data.map((record, index) => {
      const book = getBookById(record.bookId);
      return [
        index + 1,
        book?.title || 'Unknown',
        book?.author || 'Unknown',
        book?.category || 'Unknown',
        record.user?.name || 'Unknown',
        record.user?.email || 'Unknown',
        record.status,
        format(record.reservedAt, 'yyyy/MM/dd HH:mm'),
        record.reservationExpiresAt ? format(record.reservationExpiresAt, 'yyyy/MM/dd HH:mm') : '',
        record.pickupDate ? format(record.pickupDate, 'yyyy/MM/dd HH:mm') : '',
        record.dueDate ? format(record.dueDate, 'yyyy/MM/dd HH:mm') : '',
        record.returnDate ? format(record.returnDate, 'yyyy/MM/dd HH:mm') : ''
      ];
    });
    
    const detailData = [headers, ...rows];
    const wsDetails = XLSX.utils.aoa_to_sheet(detailData);
    
    // Style the headers with enhanced formatting
    const headerRange = XLSX.utils.decode_range(wsDetails['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (wsDetails[cellAddress]) {
        wsDetails[cellAddress].s = {
          font: { 
            bold: true,
            sz: 12
          },
          fill: { 
            fgColor: { rgb: 'FF22705E' } 
          },
          alignment: { 
            horizontal: 'center',
            vertical: 'center'
          },
          border: {
            top: { style: 'thin', color: { auto: 1 } },
            bottom: { style: 'thin', color: { auto: 1 } },
            left: { style: 'thin', color: { auto: 1 } },
            right: { style: 'thin', color: { auto: 1 } }
          }
        };
      }
    }
    
    // Add borders to all data cells
    for (let row = 1; row <= data.length; row++) {
      for (let col = 0; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!wsDetails[cellAddress]) {
          wsDetails[cellAddress] = { t: 's', v: '' };
        }
        wsDetails[cellAddress].s = {
          border: {
            top: { style: 'thin', color: { auto: 1 } },
            bottom: { style: 'thin', color: { auto: 1 } },
            left: { style: 'thin', color: { auto: 1 } },
            right: { style: 'thin', color: { auto: 1 } }
          }
        };
      }
    }
    
    // Set column widths for details
    wsDetails['!cols'] = [
      { wch: 6 },   // No.
      { wch: 35 },  // Book Title
      { wch: 25 },  // Book Author
      { wch: 15 },  // Book Category
      { wch: 20 },  // User Name
      { wch: 35 },  // User Email
      { wch: 12 },  // Status
      { wch: 20 },  // Reserved At
      { wch: 20 },  // Reservation Expires At
      { wch: 20 },  // Pickup Date
      { wch: 20 },  // Due Date
      { wch: 20 }   // Return Date
    ];
    
    // Set row height for header
    wsDetails['!rows'] = [
      { hpt: 25 }  // Header row height
    ];
    
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Detailed Records');
    
    return wb;
  };

  const generatePDF = (data: any[], startDate: Date, endDate: Date) => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add professional header with branding
    pdf.setFillColor(34, 112, 94); // Brand green color
    pdf.rect(0, 0, 297, 12, 'F'); // Header bar
    
    pdf.setTextColor(255, 255, 255); // White text for header
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text('Booklyn Library Management System', 148, 8, { align: 'center' });
    
    // Add decorative line
    pdf.setDrawColor(34, 112, 94);
    pdf.setLineWidth(0.5);
    pdf.line(15, 15, 282, 15);
    
    // Main title with enhanced styling
    pdf.setTextColor(0, 0, 0); // Black text for main content
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('BORROWING HISTORY REPORT', 148, 25, { align: 'center' });
    
    // Subtitle with date range
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(100, 100, 100); // Gray text for subtitle
    pdf.text(`Period: ${format(startDate, 'MMMM dd, yyyy')} - ${format(endDate, 'MMMM dd, yyyy')}`, 148, 33, { align: 'center' });
    
    // Report metadata
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, 148, 40, { align: 'center' });
    pdf.text(`Total Records: ${data.length}`, 148, 46, { align: 'center' });
    
    // Add another decorative line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, 52, 282, 52);
    
    // Enhanced summary section with professional layout
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('EXECUTIVE SUMMARY', 20, 65);
    
    // Summary statistics in a professional box
    const summaryBoxY = 72;
    const summaryBoxHeight = 35;
    
    // Draw summary box background
    pdf.setFillColor(248, 248, 248); // Light gray background
    pdf.rect(20, summaryBoxY, 262, summaryBoxHeight, 'F');
    
    // Draw summary box border
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(1);
    pdf.rect(20, summaryBoxY, 262, summaryBoxHeight);
    
    // Summary statistics with labels
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(34, 112, 94); // Brand color for labels
    
    const summaryData = [
      { label: 'Total Borrows:', value: data.length.toString() },
      { label: 'Returned:', value: data.filter(r => r.status === 'returned').length.toString() },
      { label: 'Active:', value: data.filter(r => r.status === 'borrowed' || r.status === 'due_soon' || r.status === 'overdue').length.toString() },
      { label: 'Overdue:', value: data.filter(r => r.status === 'overdue').length.toString() },
      { label: 'Expired:', value: data.filter(r => r.status === 'expired').length.toString() }
    ];
    
    // Position summary items in a grid
    summaryData.forEach((item, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 30 + (col * 85);
      const y = summaryBoxY + 10 + (row * 12);
      
      pdf.text(item.label, x, y);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.value, x + 50, y);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(34, 112, 94);
    });
    
    // Add detailed records section with enhanced styling
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('DETAILED RECORDS', 20, 120);
    
    // Add decorative line before table
    pdf.setDrawColor(34, 112, 94);
    pdf.setLineWidth(0.5);
    pdf.line(20, 125, 282, 125);
    
    // Table setup for landscape
    const tableStartY = 135;
    const rowHeight = 7;
    const pageHeight = 190;
    const margin = 20;
    const tableWidth = 262;
    const colWidths = [8, 42, 28, 16, 20, 35, 12, 20, 20, 20, 20, 21]; // Optimized to use full width
    const headers = ['No.', 'Title', 'Author', 'Category', 'User', 'Email', 'Status', 'Reserved', 'Expires', 'Picked Up', 'Due', 'Returned'];
    
    let currentY = tableStartY;
    
    // Function to draw table row
    const drawTableRow = (y: number, data: string[], isHeader: boolean = false) => {
      let x = margin;
      
      // Draw row background for header - fill entire row first
      if (isHeader) {
        pdf.setFillColor(34, 112, 94); // Brand green color
        pdf.rect(margin, y - 4, tableWidth, rowHeight, 'F'); // Use full tableWidth (262mm)
        pdf.setTextColor(255, 255, 255); // White text for header
      } else {
        // Alternate row colors for better readability
        if (Math.floor((y - tableStartY) / rowHeight) % 2 === 0) {
          pdf.setFillColor(248, 248, 248); // Light gray for even rows
          pdf.rect(margin, y - 4, tableWidth, rowHeight, 'F'); // Use full tableWidth (262mm)
        }
        pdf.setTextColor(0, 0, 0); // Black text for data rows
      }
      
      // Draw cell borders and text
      data.forEach((text, index) => {
        const width = colWidths[index];
        
        // Add text (truncate if too long) - more aggressive truncation
        const maxLength = Math.floor(width / 3.5); // Further reduced character limit
        const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        
        if (isHeader) {
          pdf.setFont(undefined, 'bold');
          pdf.setFontSize(6); // Further reduced from 7pt to 6pt
        } else {
          pdf.setFont(undefined, 'normal');
          pdf.setFontSize(5); // Further reduced from 6pt to 5pt
        }
        
        pdf.text(truncatedText, x + 0.5, y); // Reduced padding
        
        // Draw cell border after text to ensure it's visible
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(x, y - 4, width, rowHeight);
        x += width;
      });
    };
    
    // Draw table headers
    drawTableRow(currentY, headers, true);
    currentY += rowHeight;
    
    // Draw table data rows
    data.forEach((record, index) => {
      const book = getBookById(record.bookId);
      
      // Check if we need a new page
      if (currentY > pageHeight - rowHeight) {
        pdf.addPage();
        currentY = 20;
        
        // Add header to new page
        pdf.setFillColor(34, 112, 94);
        pdf.rect(0, 0, 297, 12, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Booklyn Library Management System', 148, 8, { align: 'center' });
        
        // Redraw headers on new page
        drawTableRow(currentY, headers, true);
        currentY += rowHeight;
      }
      
      const rowData = [
        (index + 1).toString(),
        book?.title || 'Unknown',
        book?.author || 'Unknown',
        book?.category || 'Unknown',
        record.user?.name || 'Unknown',
        record.user?.email || 'Unknown',
        record.status,
        format(record.reservedAt, 'yyyy/MM/dd'),
        record.reservationExpiresAt ? format(record.reservationExpiresAt, 'yyyy/MM/dd') : '',
        record.pickupDate ? format(record.pickupDate, 'yyyy/MM/dd') : '',
        record.dueDate ? format(record.dueDate, 'yyyy/MM/dd') : '',
        record.returnDate ? format(record.returnDate, 'yyyy/MM/dd') : ''
      ];
      
      drawTableRow(currentY, rowData, false);
      currentY += rowHeight;
    });
    
    // Add professional footer
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFillColor(34, 112, 94);
      pdf.rect(0, 198, 297, 12, 'F'); // Footer bar
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.text('Confidential - Library Management Report', 148, 204, { align: 'center' });
      pdf.text(`Page ${i} of ${pageCount}`, 280, 204, { align: 'right' });
    }
    
    return pdf;
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold">Reports & Analytics</h1>
        
        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="books" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Books Stats
            </TabsTrigger>
            <TabsTrigger value="borrows" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Borrows Stats
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Generate Report
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

          {/* Generate Report Tab */}
          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Generate Detailed Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Range Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Date Range</Label>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="start-date" className="text-sm text-muted-foreground">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={reportStartDate}
                          onChange={(e) => setReportStartDate(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date" className="text-sm text-muted-foreground">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={reportEndDate}
                          onChange={(e) => setReportEndDate(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Format Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Document Format</Label>
                    <Select value={reportFormat} onValueChange={(value: 'excel' | 'pdf') => setReportFormat(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel" className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Excel (.xlsx)
                        </SelectItem>
                        <SelectItem value="pdf" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          PDF Document
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Quick Date Range Buttons */}
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground">Quick Select</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReportStartDate(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
                        setReportEndDate(format(new Date(), 'yyyy-MM-dd'));
                      }}
                    >
                      Last 7 days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReportStartDate(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
                        setReportEndDate(format(new Date(), 'yyyy-MM-dd'));
                      }}
                    >
                      Last 30 days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReportStartDate(format(subDays(new Date(), 90), 'yyyy-MM-dd'));
                        setReportEndDate(format(new Date(), 'yyyy-MM-dd'));
                      }}
                    >
                      Last 90 days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const now = new Date();
                        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                        setReportStartDate(format(firstDay, 'yyyy-MM-dd'));
                        setReportEndDate(format(now, 'yyyy-MM-dd'));
                      }}
                    >
                      This Month
                    </Button>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={generateReport}
                    disabled={isGeneratingReport || !reportStartDate || !reportEndDate}
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {isGeneratingReport ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate {reportFormat === 'excel' ? 'Excel' : 'PDF'} Report
                      </>
                    )}
                  </Button>
                </div>

                {/* Report Info */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Report Information</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Reports include detailed borrowing history for the selected date range</p>
                    <p>• Excel format generates a properly formatted .xlsx file with summary and detailed records sheets</p>
                    <p>• PDF format generates a properly formatted PDF document with summary and detailed records</p>
                    <p>• Reports include book details (title, author, category), user information, and all relevant dates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
