import React from 'react';
import { Button } from '@shared/components/ui/Button';
import { useAuth } from '@shared/hooks/useAuth';

export function LoginForm() {
  const { signInWithGoogle, loading } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <Button onClick={signInWithGoogle} disabled={loading}>
        Continue with Google
      </Button>
    </div>
  );
}

export default LoginForm;
