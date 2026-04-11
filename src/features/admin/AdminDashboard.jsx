import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { getAdminGlobalStats } from '../polls/PollService';
import { useAuthStore } from '../../app/store';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';

export function AdminDashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const rootRef = React.useRef(null);

  React.useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminGlobalStats,
    enabled: user?.role === 'admin',
  });

  if (user?.role !== 'admin') {
    return (
      <div className="px-4 pb-16 pt-24 text-center">
        <h1 className="mb-4 text-2xl font-bold">{t('accessDenied')}</h1>
        <Link to="/">
          <Button>{t('home')}</Button>
        </Link>
      </div>
    );
  }

  const stats = data?.data;

  return (
    <div ref={rootRef} className="mx-auto max-w-5xl px-4 pb-16 pt-24">
      <h1 className="text-display mb-2 text-3xl">{t('adminTitle')}</h1>
      <p className="mb-10 text-on-surface-variant">{t('adminBlurb')}</p>

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      )}

      {isError && (
        <p className="text-error">{t('errorLoading')}</p>
      )}

      {!isLoading && stats && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container p-6 shadow-lg">
            <p className="text-label mb-2">{t('totalPolls')}</p>
            <p className="text-4xl font-bold text-primary">{stats.totalPolls ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container p-6 shadow-lg">
            <p className="text-label mb-2">{t('globalVotes')}</p>
            <p className="text-4xl font-bold text-secondary">{stats.totalVotes ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container p-6 shadow-lg md:col-span-2">
            <p className="text-label mb-2">{t('mostPopularPoll')}</p>
            <p className="text-lg font-semibold">
              {stats.mostPopularPoll?.title ?? '—'}
            </p>
            {stats.mostPopularPoll?.votes != null && (
              <p className="text-sm text-on-surface-variant">{stats.mostPopularPoll.votes} votes</p>
            )}
          </div>
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container p-6 shadow-lg md:col-span-2">
            <p className="text-label mb-2">{t('mostVotedOption')}</p>
            <p className="text-lg font-semibold">
              {stats.mostVotedOption?.optionText ?? '—'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
