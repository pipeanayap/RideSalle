import { useState, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, GraduationCap, Hash, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { RideSalleLogo } from '@/components/RideSalleLogo';
import { getApiError } from '@/lib/apiError';

const schema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres').max(60),
  lastName: z.string().min(2, 'Mínimo 2 caracteres').max(60),
  email: z.string().email('Correo inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[a-z]/, 'Debe incluir minúscula')
    .regex(/[A-Z]/, 'Debe incluir mayúscula')
    .regex(/\d/, 'Debe incluir número'),
  university: z.string().min(2).max(120),
  career: z.string().min(2).max(120),
  semester: z.coerce.number().int().min(1).max(20),
});
type FormData = z.infer<typeof schema>;

function Field({ icon: Icon, error, children }: {
  icon: typeof Mail;
  error?: string;
  children: ReactElement;
}): ReactElement {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
      <div className="[&>input]:pl-10">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function RegisterPage(): ReactElement {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setApiError('');
    try {
      await registerUser(data);
      navigate('/');
    } catch (err: unknown) {
      setApiError(getApiError(err, 'Error al registrarse'));
    }
  }

  const inputCls = 'h-12 rounded-xl bg-gray-50 border-gray-200 dark:bg-secondary';

  return (
    <div className="flex min-h-dvh flex-col items-center justify-between bg-white px-6 py-8 dark:bg-background">
      <motion.div
        className="flex w-full max-w-sm flex-col gap-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col items-center pt-2">
          <RideSalleLogo size="sm" showTagline />
          <h2 className="mt-3 text-lg font-bold text-foreground">Create Account</h2>
          <p className="text-xs text-muted-foreground">Solo correos institucionales</p>
        </div>

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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Nombre" className={`${inputCls} pl-10`} {...register('firstName')} />
              {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div>
              <Input placeholder="Apellidos" className={inputCls} {...register('lastName')} />
              {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          <Field icon={Mail} error={errors.email?.message}>
            <Input type="email" placeholder="Email institucional" autoComplete="email" className={inputCls} {...register('email')} />
          </Field>

          <Field icon={Lock} error={errors.password?.message}>
            <Input type="password" placeholder="Contraseña" autoComplete="new-password" className={inputCls} {...register('password')} />
          </Field>

          <Field icon={GraduationCap} error={errors.university?.message}>
            <Input placeholder="Universidad" className={inputCls} {...register('university')} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field icon={GraduationCap} error={errors.career?.message}>
              <Input placeholder="Carrera" className={inputCls} {...register('career')} />
            </Field>
            <Field icon={Hash} error={errors.semester?.message}>
              <Input type="number" placeholder="Semestre" min={1} max={20} className={inputCls} {...register('semester')} />
            </Field>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl py-3.5 text-base font-bold text-[#1A3785] transition-opacity disabled:opacity-70"
            style={{ backgroundColor: '#F5B800' }}
          >
            {isSubmitting ? 'Creando cuenta...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-primary hover:underline">
            Log In
          </Link>
        </p>
      </motion.div>

      <p className="text-[10px] text-muted-foreground/50">www.ridesalle.com</p>
    </div>
  );
}
