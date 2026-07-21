import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LogIn, UserPlus, X } from 'lucide-react';

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
    } catch (err) {
      // Error is handled in store
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fcfaf8] w-full max-w-md rounded-sm border hairline border-obsidian-200/50 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-5 border-b hairline border-obsidian-200/50 bg-white">
          <h2 className="font-serif text-xl font-bold text-[var(--theme-primary)]">
            {isLogin ? 'Sign In to Studio' : 'Create Artisan Account'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-obsidian-100 rounded-sm text-obsidian-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm font-mono border border-red-200 rounded-sm">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-widest text-obsidian-600">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-panel border hairline border-obsidian-200/50 px-3 py-2 rounded-sm text-sm focus:outline-none focus:border-gold-400 transition-colors"
                placeholder="Juan Dela Cruz"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-widest text-obsidian-600">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass-panel border hairline border-obsidian-200/50 px-3 py-2 rounded-sm text-sm focus:outline-none focus:border-gold-400 transition-colors"
              placeholder="artisan@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-widest text-obsidian-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full glass-panel border hairline border-obsidian-200/50 px-3 py-2 rounded-sm text-sm focus:outline-none focus:border-gold-400 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--theme-primary)] hover:brightness-110 text-gold-100 text-sm font-semibold py-3 rounded-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                'Processing...'
              ) : isLogin ? (
                <><LogIn className="w-4 h-4" /> Sign In</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              )}
            </button>
          </div>
        </form>

        <div className="p-4 border-t hairline border-obsidian-200/50 bg-obsidian-50/50 text-center">
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setEmail(''); setPassword(''); setName(''); }}
            className="text-xs font-mono tracking-wide text-obsidian-500 hover:text-[var(--theme-primary)] transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up." : "Already have an account? Sign in."}
          </button>
        </div>
      </div>
    </div>
  );
};
