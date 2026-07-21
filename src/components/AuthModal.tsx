import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LogIn, UserPlus } from 'lucide-react';
import { ModalShell, Button, inputClass } from './ui';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const { login, register, isLoading, error } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      onClose();
    } catch {
      // Error surfaces through the store
    }
  };

  const formId = 'auth-form';

  return (
    <ModalShell
      open={isOpen}
      onClose={onClose}
      size="sm"
      title={isLogin ? 'Sign in' : 'Create account'}
      subtitle={isLogin ? 'Access your saved designs' : 'Save designs and track orders'}
      footer={
        <div className="space-y-3">
          <Button
            type="submit"
            form={formId}
            variant="primary"
            size="lg"
            block
            disabled={isLoading}
          >
            {isLoading ? (
              'Working…'
            ) : isLogin ? (
              <>
                <LogIn className="h-4 w-4" /> Sign in
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" /> Create account
              </>
            )}
          </Button>
          <p className="text-center text-[12px] text-[var(--color-text-muted)]">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="u-interactive font-semibold text-[var(--color-text-accent)] underline underline-offset-2 hover:text-[var(--color-gold-800)]"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--color-danger-fg)_25%,transparent)] bg-[var(--color-danger-bg)] px-3 py-2.5 text-[13px] text-[var(--color-danger-fg)]"
          >
            {error}
          </div>
        )}

        {!isLogin && (
          <div className="space-y-1.5">
            <label htmlFor="auth-name" className="label-micro block">
              Full name
            </label>
            <input
              id="auth-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Juan Dela Cruz"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="auth-email" className="label-micro block">
            Email address
          </label>
          <input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="artisan@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="auth-password" className="label-micro block">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            /* Correct token lets password managers distinguish the two flows;
               previously neither field carried an autocomplete hint. */
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>
      </form>
    </ModalShell>
  );
};
