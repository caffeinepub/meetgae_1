import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      size="lg"
      className="gap-2 min-w-[140px]"
    >
      {disabled ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Logging in...
        </>
      ) : isAuthenticated ? (
        'Logout'
      ) : (
        <>
          <LogIn className="h-5 w-5" />
          Sign In
        </>
      )}
    </Button>
  );
}

