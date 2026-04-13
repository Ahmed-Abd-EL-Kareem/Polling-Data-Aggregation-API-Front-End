import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { loginAPI } from './AuthService';
import { useAuthStore } from '../../app/store';
import { Input } from '../../components/ui/Input';
import { baseURL } from '../../services/api';
import { AuthSplitLayout } from './AuthSplitLayout';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const inputClass =
  'rounded-xl border-none bg-surface-container-lowest px-4 py-4 text-base text-on-surface placeholder:text-on-surface-variant/30 focus:bg-surface-bright focus:ring-2 focus:ring-primary/20';

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
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
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginAPI,
    onSuccess: (data) => {
      const user = data.data?.user ?? data.user;
      const token = data.token;
      if (user && token) setAuth(user, token);
      navigate('/');
    },
    onError: (err) => {
      setErrorMsg(
        err.response?.data?.message || err.response?.data?.error || 'Login failed'
      );
    },
  });

  const onSubmit = (data) => {
    setErrorMsg('');
    mutation.mutate(data);
  };

  const googleUrl = `${baseURL}/auth/google`;

  return (
    <AuthSplitLayout variant="login">
      <div ref={rootRef} className="w-full max-w-md">
        <header className="mb-10">
          <h2 className="mb-2 font-sans text-3xl font-bold tracking-tight text-on-surface">{t('welcomeBack')}</h2>
          <p className="font-sans text-on-surface-variant">{t('authCredentialsBlurb')}</p>
        </header>

        {errorMsg ? (
          <div className="mb-6 rounded-xl bg-error/15 px-4 py-3 text-sm text-error">{errorMsg}</div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label
              className="ml-1 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
              htmlFor="login-email"
            >
              {t('email')}
            </label>
            <Input
              id="login-email"
              type="email"
              placeholder="curator@authority.com"
              className={inputClass}
              {...register('email')}
            />
            {errors.email ? <p className="text-xs text-error">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-end justify-between px-1">
              <label
                className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                htmlFor="login-password"
              >
                {t('password')}
              </label>
              <Link to="/forgot-password" className="text-[11px] font-medium text-primary/60 hover:text-primary transition-colors hover:underline">
                {t('forgotPassword')}
              </Link>
            </div>
            <Input
              id="login-password"
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
            {mutation.isPending ? '…' : t('signIn')}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant/10" />
            <span className="mx-4 flex-shrink text-xs font-bold uppercase tracking-widest text-on-surface-variant/40">
              {t('orDivider')}
            </span>
            <div className="flex-grow border-t border-outline-variant/10" />
          </div>

          <button
            type="button"
            className="group flex w-full items-center justify-center gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-highest/30 py-4 px-6 font-medium text-on-surface transition-all duration-200 hover:bg-surface-container-highest"
            onClick={() => {
              window.location.href = googleUrl;
            }}
          >
            <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t('signInWithGoogle')}
          </button>
        </form>

        <footer className="mt-12 text-center">
          <p className="font-sans text-sm text-on-surface-variant">
            {t('noAccount')}{' '}
            <Link to="/register" className="ml-1 font-bold text-primary underline-offset-4 hover:underline">
              {t('register')}
            </Link>
          </p>
        </footer>
      </div>
    </AuthSplitLayout>
  );
}
