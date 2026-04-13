import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { forgotPasswordAPI } from './AuthService';
import { Input } from '../../components/ui/Input';
import { AuthSplitLayout } from './AuthSplitLayout';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const inputClass =
  'rounded-xl border-none bg-surface-container-lowest px-4 py-4 text-base text-on-surface placeholder:text-on-surface-variant/30 focus:bg-surface-bright focus:ring-2 focus:ring-primary/20';

export function ForgotPassword() {
  const { t } = useTranslation();
  const [successMsg, setSuccessMsg] = useState('');
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
    resolver: zodResolver(forgotSchema),
  });

  const mutation = useMutation({
    mutationFn: forgotPasswordAPI,
    onSuccess: () => {
      setSuccessMsg('Reset password link has been sent to your email.');
    },
    onError: (err) => {
      setErrorMsg(
        err.response?.data?.message || err.response?.data?.error || 'Failed to send reset link'
      );
    },
  });

  const onSubmit = (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    mutation.mutate(data.email);
  };

  return (
    <AuthSplitLayout variant="login">
      <div ref={rootRef} className="w-full max-w-md">
        <header className="mb-10">
          <h2 className="mb-2 font-sans text-3xl font-bold tracking-tight text-on-surface">Reset Password</h2>
          <p className="font-sans text-on-surface-variant">Enter your email to receive a secure reset link.</p>
        </header>

        {errorMsg ? (
          <div className="mb-6 rounded-xl bg-error/15 px-4 py-3 text-sm text-error">{errorMsg}</div>
        ) : null}
        {successMsg ? (
          <div className="mb-6 rounded-xl bg-primary/15 px-4 py-3 text-sm text-primary">{successMsg}</div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label
              className="ml-1 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
              htmlFor="forgot-email"
            >
              {t('email')}
            </label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="curator@authority.com"
              className={inputClass}
              {...register('email')}
            />
            {errors.email ? <p className="text-xs text-error">{errors.email.message}</p> : null}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending || !!successMsg}
            className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-bold text-on-primary shadow-lg shadow-primary/10 transition-all duration-200 hover:shadow-primary/20 enabled:hover:scale-[0.98] enabled:active:scale-[0.96] disabled:opacity-60"
          >
            {mutation.isPending ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <footer className="mt-12 text-center">
          <p className="font-sans text-sm text-on-surface-variant">
            Remember your password?{' '}
            <Link to="/login" className="ml-1 font-bold text-primary underline-offset-4 hover:underline">
              {t('signIn')}
            </Link>
          </p>
        </footer>
      </div>
    </AuthSplitLayout>
  );
}
