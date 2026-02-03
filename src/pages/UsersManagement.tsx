import { useState, useEffect } from 'react';
import { useLibrary } from '@/contexts/LibraryContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, UserPlus, BookOpen, AlertTriangle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { User, UserRole } from '@/types/library';

export default function UsersManagement() {
  const { users, addUser, updateUser, deleteUser, borrowRecords, getBorrowStatus, getBookById, refetchUsers } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'client' as UserRole,
    isActive: true,
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserStats = (userId: string) => {
    const userRecords = borrowRecords.filter(r => r.userId === userId);
    const active = userRecords.filter(r => r.status !== 'returned');
    const overdue = active.filter(r => getBorrowStatus(r) === 'overdue');
    const total = userRecords.length;
    return { active: active.length, overdue: overdue.length, total };
  };

  const handleAddUser = () => {
    addUser(formData);
    setIsAddDialogOpen(false);
    setFormData({ name: '', email: '', role: 'client', isActive: true });
    toast({
      title: 'User created',
      description: `${formData.name} has been added.`,
    });
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleToggleActive = (user: User) => {
    updateUser(user.id, { isActive: !user.isActive });
    toast({
      title: user.isActive ? 'User deactivated' : 'User activated',
      description: `${user.name} has been ${user.isActive ? 'deactivated' : 'activated'}.`,
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Refetch users when component mounts to ensure fresh data
  useEffect(() => {
    refetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage library members and their accounts
            </p>
          </div>
          <Button variant="emerald" onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active Books</TableHead>
                    <TableHead>Overdue</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const stats = getUserStats(user.id);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'librarian' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'success' : 'error'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            {stats.active}
                          </div>
                        </TableCell>
                        <TableCell>
                          {stats.overdue > 0 ? (
                            <div className="flex items-center gap-1.5 text-destructive">
                              <AlertTriangle className="h-4 w-4" />
                              {stats.overdue}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(user.createdAt, 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewUser(user)}
                            >
                              View
                            </Button>
                            <Button
                              variant={user.isActive ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => handleToggleActive(user)}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add User Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new library member account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="librarian">Librarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active Account</Label>
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="emerald" onClick={handleAddUser}>
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View User Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-display font-semibold">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={selectedUser.role === 'librarian' ? 'default' : 'secondary'}>
                        {selectedUser.role}
                      </Badge>
                      <Badge variant={selectedUser.isActive ? 'success' : 'error'}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-display font-bold">{getUserStats(selectedUser.id).total}</p>
                        <p className="text-sm text-muted-foreground">Total Borrowed</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-display font-bold">{getUserStats(selectedUser.id).active}</p>
                        <p className="text-sm text-muted-foreground">Active Books</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-display font-bold text-destructive">{getUserStats(selectedUser.id).overdue}</p>
                        <p className="text-sm text-muted-foreground">Overdue</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Current Books</h4>
                  <div className="space-y-2">
                    {borrowRecords
                      .filter(r => r.userId === selectedUser.id && r.status !== 'returned')
                      .map(record => {
                        const book = getBookById(record.bookId);
                        return (
                          <div key={record.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{book?.title}</p>
                                <p className="text-sm text-muted-foreground">{book?.author}</p>
                              </div>
                              <Badge variant={getBorrowStatus(record) as any}>
                                {getBorrowStatus(record).replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span>Reserved: {format(record.reservedAt, 'yyyy/MM/dd HH:mm')}</span>
                              {record.reservationExpiresAt && (
                                <span className="text-warning">Expires: {format(record.reservationExpiresAt, 'yyyy/MM/dd HH:mm')}</span>
                              )}
                              {record.pickupDate && (
                                <span>Picked up: {format(record.pickupDate, 'yyyy/MM/dd HH:mm')}</span>
                              )}
                              {record.dueDate && (
                                <span className={getBorrowStatus(record) === 'overdue' ? 'text-destructive' : getBorrowStatus(record) === 'due_soon' ? 'text-warning' : ''}>
                                  Due: {format(record.dueDate, 'yyyy/MM/dd HH:mm')}
                                </span>
                              )}
                              {record.returnDate && (
                                <span>Returned: {format(record.returnDate, 'yyyy/MM/dd HH:mm')}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    {borrowRecords.filter(r => r.userId === selectedUser.id && r.status !== 'returned').length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No active books</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
