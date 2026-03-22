import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Lock, ArrowLeft, Loader2, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { resetPassword } from '@/api/auth';
import { validatePassword, validatePasswordMatch } from '@/utils/validation';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate password match (this also validates password requirements)
    const passwordMatchError = validatePasswordMatch(newPassword, confirmPassword);
    if (passwordMatchError) {
      if (passwordMatchError.includes('at least') || passwordMatchError.includes('less than') || passwordMatchError.includes('must contain')) {
        newErrors.newPassword = passwordMatchError;
      } else if (passwordMatchError.includes('do not match')) {
        newErrors.confirmPassword = passwordMatchError;
      }
    }

    setErrors(newErrors);
    setError('');
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPassword({ token, newPassword });
      setIsSuccess(true);
      toast({
        title: 'Password reset successful',
        description: 'Your password has been reset successfully.',
      });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setError(errorMessage);
      toast({
        title: 'Reset failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <img src="/favicon.png" alt="Booklyn Logo" className="h-16 w-16 rounded-2xl shadow-lg object-cover bg-white/80" />
              <span className="font-display font-bold text-3xl">BOOKLYN</span>
            </div>
            
            <h1 className="text-4xl font-display font-bold mb-4">
              Set New Password
            </h1>
            <p className="text-lg opacity-90 max-w-md">
              Choose a strong password for your account. Make sure it's unique 
              and hard to guess.
            </p>

            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                  <Lock className="h-5 w-5" />
                </div>
                <span>Use at least 8 characters</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                  <Lock className="h-5 w-5" />
                </div>
                <span>Include uppercase, lowercase, and numbers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                  <Lock className="h-5 w-5" />
                </div>
                <span>Keep it secure and memorable</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <img src="/logo.png" alt="Booklyn Logo" className="h-12 w-12 rounded-xl shadow object-cover bg-white/80" />
            <span className="font-display font-bold text-2xl">BOOKLYN</span>
          </div>

          <Card variant="elevated" className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToLogin}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-2xl font-display">Reset Password</CardTitle>
              <CardDescription>
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSuccess ? (
                <>
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (errors.newPassword || errors.confirmPassword) {
                              setErrors({ ...errors, newPassword: '', confirmPassword: '' });
                            }
                          }}
                          className={`pl-10 ${errors.newPassword ? 'border-destructive' : ''}`}
                          required
                          minLength={8}
                          disabled={!!error}
                        />
                      </div>
                      {errors.newPassword && (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.newPassword}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) {
                              setErrors({ ...errors, confirmPassword: '' });
                            }
                          }}
                          className={`pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                          required
                          minLength={8}
                          disabled={!!error}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Password must contain at least 8 characters, including uppercase, lowercase, and numbers
                    </div>

                    <Button 
                      type="submit" 
                      variant="emerald" 
                      className="w-full" 
                      size="lg"
                      disabled={isLoading || !!error}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Reset Password
                          <Lock className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">Password Reset Successful</h3>
                  <p className="text-muted-foreground mb-6">
                    Your password has been reset successfully. Redirecting to login...
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleBackToLogin}
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
