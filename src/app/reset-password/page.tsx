'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Check if the user is authenticated (came from recovery link)
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Even if session is not active, standard Supabase recovery flow handles
        // token in hash fragment automatically behind the scenes.
        console.log('No active session found, checking hash fragment...');
      }
      setSessionChecked(true);
    }
    checkSession();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4EFE6] px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Star field effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-transparent" />

      <div className="max-w-md w-full space-y-8 p-8 bg-white/70 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 shadow-2xl relative z-10">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#3D2B1F] font-serif">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-[#705335]">
            Enter a new secure password for your AyuAstro account
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-4 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center">
            <div className="flex items-center justify-center p-4 bg-green-50 rounded-xl border border-green-200 text-green-700 text-sm space-x-2">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>Password updated successfully!</span>
            </div>
            <p className="text-sm text-[#705335]">
              You can now close this tab and return to the AyuAstro app to sign in.
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3D2B1F] uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#D4AF37]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-white/80 border border-[#D4AF37]/20 rounded-xl text-[#3D2B1F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-sm transition-all"
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#D4AF37] hover:text-[#BF9B30]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3D2B1F] uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#D4AF37]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-white/80 border border-[#D4AF37]/20 rounded-xl text-[#3D2B1F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-sm transition-all"
                    placeholder="••••••"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] hover:from-[#BF9B30] hover:to-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
              >
                {loading ? 'Updating password...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
