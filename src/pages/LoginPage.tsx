import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, X } from 'lucide-react';
import { GlassModal } from '../components/ui/GlassModal';

interface LoginPageProps {
  onSuccess: () => void;
  id?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, id }) => {
  const { login, loginWithGoogleEmail, triggerGoogleOAuth } = useAuth();
  const [email, setEmail] = useState('admin@bitsathy');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState<string | null>(null);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your username or email');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    const valid = login(email, password);
    if (!valid) {
      setError('Invalid username or password.');
      return;
    }

    onSuccess();
  };

  const handleGoogleAccountSelect = (googleEmail: string) => {
    const valid = loginWithGoogleEmail(googleEmail);
    if (valid) {
      setShowGoogleChooser(false);
      onSuccess();
    } else {
      setError('Unable to authenticate with Google account.');
    }
  };

  const googleAccounts = [
    {
      name: 'SOUNDHAR RAJ V',
      email: 'soundharraj.ag23@bitsathy.ac.in',
      roleLabel: 'Student (Hosteller Dashboard)',
      avatarBg: 'bg-slate-700 text-white',
      initials: 'S'
    },
    {
      name: 'SOUNDHAR RAJ',
      email: 'soundharrajvellingiri@gmail.com',
      roleLabel: 'Parent (Realtime SMS & Tracking)',
      avatarBg: 'bg-emerald-700 text-white',
      initials: 'S'
    },
    {
      name: 'SOUNDHAR RAJ V',
      email: 'soundharvellingiri5912@gmail.com',
      roleLabel: 'Faculty Advisor / Mentor',
      avatarBg: 'bg-amber-600 text-white',
      initials: 'S'
    },
    {
      name: 'Soundhar Raj',
      email: 'soundharraj122005@gmail.com',
      roleLabel: 'Main Gate Security Officer',
      avatarBg: 'bg-[#1e40af] text-white',
      initials: 'S'
    }
  ];

  return (
    <div id={id} className="min-h-screen bg-[#f4f6f8] text-[#172033] font-sans flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 sm:p-10 shadow-md border border-slate-200 space-y-6">
        {/* Brand Logo & Title */}
        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#1e40af] text-white flex items-center justify-center font-bold shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
              Campus Pass
            </h1>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-[#5b6472]">
            Enterprise Student Leave & Outpass Management System
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#172033] mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter username"
              className="w-full h-12 bg-white border border-slate-300 rounded-lg px-4 text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#172033] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full h-12 bg-white border border-slate-300 rounded-lg px-4 text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#1e40af] hover:bg-blue-800 text-white font-bold text-base shadow-xs transition-colors text-center cursor-pointer"
          >
            Sign In to Account
          </button>
        </form>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-bold text-slate-400">
            <span className="bg-white px-3">Or continue with</span>
          </div>
        </div>

        {/* Real Supabase Google SSO Login Button */}
        <button
          type="button"
          onClick={async () => {
            try {
              await triggerGoogleOAuth();
            } catch (err: any) {
              setError(err?.message || 'Google OAuth redirect failed.');
            }
          }}
          className="w-full h-12 rounded-xl bg-white hover:bg-slate-50 text-[#172033] font-bold text-base border border-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center justify-center space-x-3 cursor-pointer"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>

        {/* GOOGLE OAUTH ACCOUNT CHOOSER MODAL */}
        {showGoogleChooser && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#121212] text-white w-full max-w-md rounded-2xl border border-neutral-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <h3 className="font-bold text-base text-white">Choose a Google Account</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(false)}
                  className="text-neutral-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-neutral-400">
                Select an authorized account to sign in to <strong className="text-white">Campus Pass</strong>:
              </p>

              {/* Account List */}
              <div className="space-y-1 divide-y divide-neutral-800/60">
                {googleAccounts.map((acc, idx) => (
                  <button
                    type="button"
                    key={`gacc-${idx}`}
                    onClick={() => handleGoogleAccountSelect(acc.email)}
                    className="w-full text-left py-3 px-2 hover:bg-neutral-800/80 rounded-xl transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full ${acc.avatarBg} flex items-center justify-center font-bold text-base shrink-0`}>
                        {acc.initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors truncate">
                          {acc.name}
                        </h4>
                        <p className="text-xs text-neutral-400 truncate font-mono">
                          {acc.email}
                        </p>
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-1.5 py-0.5 rounded">
                          {acc.roleLabel}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
