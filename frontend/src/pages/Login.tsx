import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, AlertCircle, Eye, EyeOff, ChevronDown, Shield, Building2, Truck, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

const TEST_ACCOUNTS = [
  {
    label: 'Super Admin',
    email: 'super_admin@logisight.dev',
    password: 'TestPass123!',
    description: 'Platform-wide access, manages all companies',
    icon: Shield,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
  },
  {
    label: 'Client Admin',
    email: 'client.admin@acmeco.dev',
    password: 'TestPass123!',
    description: 'AcmeCo Logistics — admin access',
    icon: Building2,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  },
  {
    label: 'Client User',
    email: 'client.user@acmeco.dev',
    password: 'TestPass123!',
    description: 'AcmeCo Logistics — standard access',
    icon: User,
    color: 'text-blue-500',
    bg: 'bg-blue-50/70 border-blue-200 hover:bg-blue-100',
  },
  {
    label: 'Forwarder Admin',
    email: 'fwd.admin@fastfreight.dev',
    password: 'TestPass123!',
    description: 'FastFreight Co — admin access',
    icon: Truck,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200 hover:bg-green-100',
  },
  {
    label: 'Forwarder User',
    email: 'fwd.user@fastfreight.dev',
    password: 'TestPass123!',
    description: 'FastFreight Co — standard access',
    icon: User,
    color: 'text-green-500',
    bg: 'bg-green-50/70 border-green-200 hover:bg-green-100',
  },
];

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOpen, setDevOpen] = useState(false);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/app');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setError(msg);
    }
  };

  const quickLogin = async (email: string, password: string) => {
    setError(null);
    setQuickLoading(email);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setError(msg);
    } finally {
      setQuickLoading(null);
    }
  };

  const fillCredentials = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── Left panel: marketing ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gray-950 relative overflow-hidden">
        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Zap className="w-4 h-4 text-gray-900" />
          </div>
          <span className="font-bold text-lg text-white">LogiSight</span>
        </Link>

        {/* Value Prop */}
        <div className="relative max-w-sm">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-2xl backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-5">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Enterprise-Grade Freight Audit</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              LogiSight automatically maps disparate forwarder charge lines to your standardized internal 
              Charge Master with 99%+ accuracy using our three-tier AI pipeline.
            </p>
          </div>
        </div>

        <p className="relative text-xs text-gray-700">&copy; {new Date().getFullYear()} LogiSight</p>
      </div>

      {/* ── Right panel: form ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">LogiSight</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="input-field"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 active:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Dev Quick Login */}
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setDevOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all text-xs font-medium"
            >
              <span>Dev — Quick Login</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${devOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {devOpen && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-400 mb-3">
                  All accounts use password: <span className="font-mono text-gray-500">TestPass123!</span>
                </p>
                {TEST_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  const isLoading = quickLoading === acc.email;
                  return (
                    <div
                      key={acc.email}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${acc.bg}`}
                      onClick={() => !quickLoading && quickLogin(acc.email, acc.password)}
                    >
                      <div className="flex-shrink-0">
                        <Icon className={`w-4 h-4 ${acc.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${acc.color}`}>{acc.label}</p>
                        <p className="text-xs text-gray-500 truncate">{acc.description}</p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {isLoading ? (
                          <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fillCredentials(acc.email, acc.password);
                              }}
                              className="text-gray-400 hover:text-gray-600 text-xs transition-colors px-1"
                              title="Fill credentials"
                            >
                              Fill
                            </button>
                            <span className="text-gray-300 text-xs">|</span>
                            <span className="text-gray-400 text-xs">Login</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Platform access is by invitation only.{' '}
            <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Learn more
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
