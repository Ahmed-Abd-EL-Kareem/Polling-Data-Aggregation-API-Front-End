import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { getPolls } from './PollService';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { PollCard } from '../../components/PollCard';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../app/store';
import { usePollCardsReveal } from '../../hooks/usePollCardsReveal';

export function Home() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const [q, setQ] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['polls'],
    queryFn: () => getPolls(),
  });

  const pollList = data?.data ?? [];
  const filtered = useMemo(() => {
    if (!q.trim()) return pollList;
    const s = q.toLowerCase();
    return pollList.filter((p) => {
      const title = (p.title || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const creator = (p.createdBy?.name || '').toLowerCase();
      return title.includes(s) || desc.includes(s) || creator.includes(s);
    });
  }, [pollList, q]);

  const gridRef = usePollCardsReveal([filtered.length, isLoading]);

  if (isLoading) {
    return (
      <div className="space-y-4 px-6 pb-16 pt-24 md:px-12">
        <Skeleton className="mx-auto mb-10 h-40 max-w-5xl rounded-2xl" />
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 pt-24 text-center text-error">
        {t('errorLoading')}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 pt-24">
      <section className="relative overflow-hidden px-6 py-16 md:px-12 md:py-20">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-25">
          <div className="absolute end-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-0 start-0 h-[300px] w-[300px] translate-y-1/2 -translate-x-1/2 rounded-full bg-secondary blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          <span className="label-md mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
            {t('tagline')}
          </span>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tighter text-on-surface md:text-7xl">
            {t('heroTitle')}
          </h1>
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
            {t('heroSubtitle')}
          </p>
          {token && (
            <Link to="/create">
              <Button size="lg" className="gradient-primary rounded-xl px-10 py-4 text-lg font-bold text-on-primary shadow-lg shadow-primary/20">
                {t('createPoll')}
              </Button>
            </Link>
          )}
        </div>
      </section>

      <section className="sticky top-[72px] z-40 px-6 py-6 md:px-12">
        <div className="glass-panel mx-auto max-w-7xl rounded-2xl border border-outline-variant/10 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-grow">
              <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-12 rounded-xl border-none ps-12"
                placeholder={t('searchPlaceholder')}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select className="h-12 cursor-pointer rounded-xl border-none bg-surface-container-low px-4 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/50">
                <option>{t('allCategories')}</option>
              </select>
              <select className="h-12 cursor-pointer rounded-xl border-none bg-surface-container-low px-4 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/50">
                <option>{t('sortNewest')}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:px-12">
        <div ref={gridRef} className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-3xl border-2 border-dashed border-outline-variant/30 p-16 text-center">
              <h3 className="mb-2 text-xl font-bold">{t('noPolls')}</h3>
              <p className="text-on-surface-variant">{t('noPollsHint')}</p>
            </div>
          ) : (
            filtered.map((poll, i) => <PollCard key={poll._id || poll.id} poll={poll} index={i} />)
          )}
        </div>
      </section>
    </div>
  );
}
