import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { resetPasswordAPI } from './AuthService';
import { Input } from '../../components/ui/Input';
import { AuthSplitLayout } from './AuthSplitLayout';

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const inputClass =
  'rounded-xl border-none bg-surface-container-lowest px-4 py-4 text-base text-on-surface placeholder:text-on-surface-variant/30 focus:bg-surface-bright focus:ring-2 focus:ring-primary/20';

export function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useParams();
  const [errorMsg, setErrorMsg] = useState('');
  const rootRef = React.useRef(null);

  React.useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const mutation = useMutation({
    mutationFn: resetPasswordAPI,
    onSuccess: () => {
      navigate('/login', { replace: true });
    },
    onError: (err) => {
      setErrorMsg(
        err.response?.data?.message || err.response?.data?.error || 'Failed to reset password'
      );
    },
  });

  const onSubmit = (data) => {
    setErrorMsg('');
    mutation.mutate({ token, password: data.password });
  };

  return (
    <AuthSplitLayout variant="login">
      <div ref={rootRef} className="w-full max-w-md">
        <header className="mb-10">
          <h2 className="mb-2 font-sans text-3xl font-bold tracking-tight text-on-surface">New Password</h2>
          <p className="font-sans text-on-surface-variant">Enter your new secure password below.</p>
        </header>

        {errorMsg ? (
          <div className="mb-6 rounded-xl bg-error/15 px-4 py-3 text-sm text-error">{errorMsg}</div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label
              className="ml-1 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
              htmlFor="reset-password"
            >
              New Password
            </label>
            <Input
              id="reset-password"
              type="password"
              placeholder="••••••••"
              className={inputClass}
              {...register('password')}
            />
            {errors.password ? <p className="text-xs text-error">{errors.password.message}</p> : null}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-bold text-on-primary shadow-lg shadow-primary/10 transition-all duration-200 hover:shadow-primary/20 enabled:hover:scale-[0.98] enabled:active:scale-[0.96] disabled:opacity-60"
          >
            {mutation.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <footer className="mt-12 text-center">
          <p className="font-sans text-sm text-on-surface-variant">
            Remembered your password?{' '}
            <Link to="/login" className="ml-1 font-bold text-primary underline-offset-4 hover:underline">
              {t('signIn')}
            </Link>
          </p>
        </footer>
      </div>
    </AuthSplitLayout>
  );
}
