import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { registerAPI } from './AuthService';
import { useAuthStore } from '../../app/store';
import { Input } from '../../components/ui/Input';
import { baseURL } from '../../services/api';
import { AuthSplitLayout } from './AuthSplitLayout';

const buildRegisterSchema = (t) =>
  z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string().min(6),
      acceptTerms: z.boolean(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })
    .refine((data) => data.acceptTerms === true, {
      message: t('termsMustAccept'),
      path: ['acceptTerms'],
    });

const inputClass =
  'rounded-xl border-none bg-surface-container-lowest px-5 py-4 text-base text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/50';

export function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMsg, setErrorMsg] = useState('');
  const rootRef = React.useRef(null);

  const registerSchema = React.useMemo(() => buildRegisterSchema(t), [t]);

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
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptTerms: false },
  });

  const mutation = useMutation({
    mutationFn: registerAPI,
    onSuccess: (data) => {
      const user = data.data?.user ?? data.user;
      const token = data.data?.token ?? data.token;
      if (user && token) {
        setAuth(user, token);
        navigate('/');
      } else {
        navigate('/login');
      }
    },
    onError: (err) => {
      setErrorMsg(
        err.response?.data?.message || err.response?.data?.error || 'Registration failed'
      );
    },
  });

  const onSubmit = (data) => {
    setErrorMsg('');
    mutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  };

  const googleUrl = `${baseURL}/auth/google`;

  return (
    <AuthSplitLayout variant="register">
      <div ref={rootRef} className="w-full max-w-md space-y-10">
        <header className="text-center md:text-start">
          <h2 className="mb-2 font-sans text-3xl font-bold tracking-tight text-on-surface">{t('joinAuthority')}</h2>
          <p className="font-sans text-on-surface-variant">{t('registerStartBlurb')}</p>
        </header>

        {errorMsg ? (
          <div className="rounded-xl bg-error/15 px-4 py-3 text-sm text-error">{errorMsg}</div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="block px-1 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                {t('fullName')}
              </label>
              <Input type="text" placeholder={t('fullNamePlaceholder')} className={inputClass} {...register('name')} />
              {errors.name ? <p className="text-xs text-error">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="block px-1 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                {t('email')}
              </label>
              <Input
                type="email"
                placeholder="name@example.com"
                className={inputClass}
                {...register('email')}
              />
              {errors.email ? <p className="text-xs text-error">{errors.email.message}</p> : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block px-1 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                  {t('password')}
                </label>
                <Input type="password" placeholder="••••••••" className={inputClass} {...register('password')} />
                {errors.password ? <p className="text-xs text-error">{errors.password.message}</p> : null}
              </div>
              <div className="space-y-2">
                <label className="block px-1 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                  {t('confirmPassword')}
                </label>
                <Input type="password" placeholder="••••••••" className={inputClass} {...register('confirmPassword')} />
                {errors.confirmPassword ? (
                  <p className="text-xs text-error">{errors.confirmPassword.message}</p>
                ) : null}
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <div className="flex h-5 items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-5 w-5 rounded-md border-none bg-surface-container-highest text-primary focus:ring-primary focus:ring-offset-background"
                  {...register('acceptTerms', { valueAsBoolean: true })}
                />
              </div>
              <label htmlFor="terms" className="text-sm leading-tight text-on-surface-variant">
                {t('termsAgreeFull')}
              </label>
            </div>
            {errors.acceptTerms ? (
              <p className="text-xs text-error">{errors.acceptTerms.message}</p>
            ) : null}
          </div>

          <div className="space-y-4 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 enabled:active:scale-[0.98] disabled:opacity-60"
            >
              {mutation.isPending ? '…' : t('createAccount')}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-outline-variant/20" />
              <span className="mx-4 flex-shrink text-xs font-semibold uppercase tracking-widest text-outline">
                {t('orSignUpWith')}
              </span>
              <div className="flex-grow border-t border-outline-variant/20" />
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-low py-4 px-6 font-medium text-on-surface transition-colors hover:bg-surface-container active:scale-[0.98]"
              onClick={() => {
                window.location.href = googleUrl;
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="currentColor"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="currentColor"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="currentColor"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="currentColor"
                />
              </svg>
              Google
            </button>
          </div>
        </form>

        <footer className="pb-4 text-center">
          <p className="text-sm text-on-surface-variant">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="px-1 font-bold text-primary transition-colors hover:underline">
              {t('logInLink')}
            </Link>
          </p>
        </footer>
      </div>
    </AuthSplitLayout>
  );
}
