import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Car, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/api/auth';

const schema = z.object({ email: z.string().email('Correo inválido') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage(): ReactElement {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Error al enviar el correo');
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/" className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Car className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
        </div>

        {sent ? (
          <div className="rounded-xl border bg-card p-6 text-center space-y-3">
            <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
            <p className="text-sm text-muted-foreground">
              Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link to="/auth/login">Volver al inicio de sesión</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo institucional</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm">
          <Link to="/auth/login" className="text-primary hover:underline">
            ← Volver
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
