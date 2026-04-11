import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { fetchUserById, updateUser } from '../../services/userService';
import { useAuthStore } from '../../app/store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export function Profile() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const id = user?._id || user?.id;
  const rootRef = React.useRef(null);

  React.useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUserById(id),
    enabled: Boolean(id),
  });

  const remote = data?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  });

  React.useEffect(() => {
    if (remote) {
      reset({ name: remote.name ?? '', email: remote.email ?? '' });
    }
  }, [remote, reset]);

  const mutation = useMutation({
    mutationFn: (payload) => updateUser(id, payload),
    onSuccess: (res) => {
      const u = res?.data;
      if (u) setUser(u);
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      toast.success(t('save'));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('errorLoading'));
    },
  });

  if (isLoading || !id) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-16 pt-24">
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div ref={rootRef} className="mx-auto max-w-lg px-4 pb-16 pt-24">
      <h1 className="text-display mb-2 text-3xl">{t('profileTitle')}</h1>
      <p className="mb-8 text-on-surface-variant">{t('profileBlurb')}</p>

      <form
        onSubmit={handleSubmit((vals) => mutation.mutate(vals))}
        className="space-y-6 rounded-2xl border border-outline-variant/10 bg-surface-container p-8 shadow-xl"
      >
        <div className="space-y-2">
          <label className="text-label">{t('fullName')}</label>
          <Input {...register('name')} />
          {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-label">{t('email')}</label>
          <Input type="email" {...register('email')} />
          {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
        </div>
        <p className="text-sm text-on-surface-variant">
          {t('role')}: <span className="font-semibold text-on-surface">{remote?.role}</span>
        </p>
        <Button type="submit" className="w-full rounded-xl py-4 font-bold" disabled={mutation.isPending}>
          {mutation.isPending ? '…' : t('save')}
        </Button>
      </form>
    </div>
  );
}
