import { useState, type ReactElement } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { RideSalleLogo } from '@/components/RideSalleLogo';
import { getApiError } from '@/lib/apiError';

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage(): ReactElement {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setApiError('');
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setApiError(getApiError(err, 'Credenciales incorrectas'));
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-between bg-white px-6 py-10 dark:bg-background">
      <motion.div
        className="flex w-full max-w-sm flex-col gap-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-1 pt-6">
          <RideSalleLogo size="md" showTagline />
        </div>

        {/* Error general */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {apiError}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email Address"
              autoComplete="email"
              className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 dark:bg-secondary"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              className="pl-10 pr-20 h-12 rounded-xl bg-gray-50 border-gray-200 dark:bg-secondary"
              {...register('password')}
            />
            <Link
              to="/auth/forgot-password"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-primary hover:underline"
            >
              Forgot?
            </Link>
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl py-3.5 text-base font-bold text-[#1A3785] transition-opacity disabled:opacity-70"
            style={{ backgroundColor: '#F5B800' }}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          New to RideSalle?{' '}
          <Link to="/auth/register" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>

      <p className="text-[10px] text-muted-foreground/50">www.ridesalle.com</p>
    </div>
  );
}
