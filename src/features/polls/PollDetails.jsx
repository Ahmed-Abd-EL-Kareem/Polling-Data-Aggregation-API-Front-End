import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Clock, CalendarX2 } from 'lucide-react';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { getPollDetails, getPollOptions, getResults, voteOption } from './PollService';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuthStore } from '../../app/store';
import { getPollCoverAndBody } from '../../utils/pollDescription';

export function PollDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const [selectedOption, setSelectedOption] = useState(null);
  const rootRef = React.useRef(null);

  React.useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
  }, [id]);

  const { data: pollReq, isLoading: loadingPoll } = useQuery({
    queryKey: ['poll', id],
    queryFn: () => getPollDetails(id),
  });

  const { data: optionsReq, isLoading: loadingOptions } = useQuery({
    queryKey: ['options', id],
    queryFn: () => getPollOptions(id),
    enabled: Boolean(token && id),
  });

  const { data: resultsReq } = useQuery({
    queryKey: ['results', id],
    queryFn: () => getResults(id),
    enabled: Boolean(token && id),
    refetchInterval: (query) => {
      const d = query.state.data?.data;
      if (d?.hasVoted) return 8000;
      return false;
    },
  });

  const voteMutation = useMutation({
    mutationFn: voteOption,
    onMutate: async ({ pollId, optionId }) => {
      await queryClient.cancelQueries({ queryKey: ['results', pollId] });
      const previous = queryClient.getQueryData(['results', pollId]);

      queryClient.setQueryData(['results', pollId], (old) => {
        if (!old?.data?.results) return old;
        const total = (old.data.totalVotes ?? 0) + 1;
        const withPct = old.data.results.map((row) => {
          const votes =
            String(row.optionId) === String(optionId)
              ? (row.votes ?? 0) + 1
              : (row.votes ?? 0);
          return { ...row, votes };
        });
        const normalized = withPct.map((row) => ({
          ...row,
          percentage:
            total > 0
              ? Number((((row.votes ?? 0) / total) * 100).toFixed(2))
              : 0,
        }));
        normalized.sort((a, b) => b.votes - a.votes);
        return {
          ...old,
          data: {
            ...old.data,
            totalVotes: total,
            results: normalized,
          },
        };
      });

      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['results', variables.pollId], context.previous);
      }
      const msg = _err.response?.data?.message || t('errorLoading');
      const already = String(msg).toLowerCase().includes('already voted');
      if (already) {
        queryClient.invalidateQueries({ queryKey: ['results', variables.pollId] });
        toast.success(t('voteRecorded'));
        return;
      }
      toast.error(msg);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results', id] });
      toast.success(t('voteRecorded'));
    },
  });

  const poll = pollReq?.data;
  const options = optionsReq?.options ?? [];
  const results = resultsReq?.data ?? null;

  const totalVotes = results?.totalVotes ?? 0;
  const isExpired = poll ? new Date() > new Date(poll.expiresAt) : false;
  const errorMessage = voteMutation.error?.response?.data?.message || '';
  const hideVoteError = String(errorMessage).toLowerCase().includes('already voted');

  const hasVoted = Boolean(results?.hasVoted);
  const showResults = hasVoted || isExpired || voteMutation.isSuccess;
  const canShowVoteTally = Boolean(token && (hasVoted || isExpired || voteMutation.isSuccess));

  const winningId = useMemo(() => {
    if (!results?.results?.length) return null;
    const max = Math.max(...results.results.map((r) => r.votes ?? 0));
    const top = results.results.find((r) => (r.votes ?? 0) === max);
    return top ? String(top.optionId) : null;
  }, [results]);

  const userVotedOptionId = results?.userVotedOptionId
    ? String(results.userVotedOptionId)
    : null;

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (loadingPoll) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 px-4 pb-16 pt-24">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="px-4 pt-24 text-center text-xl font-bold">{t('pollNotFound')}</div>
    );
  }

  const { coverUrl, body } = getPollCoverAndBody(poll);

  const pollHeader = (
    <>
      {coverUrl && (
        <div className="relative mb-10 h-72 w-full overflow-hidden rounded-2xl ring-1 ring-white/10 md:h-96">
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}

      <div className="relative z-10 mb-10 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {isExpired ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-600 dark:text-red-400">
              <CalendarX2 className="h-4 w-4" /> {t('ended')}{' '}
              {dateFormatter.format(new Date(poll.expiresAt))}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-600 dark:text-green-400">
              <Clock className="h-4 w-4" /> {t('ends')}{' '}
              {dateFormatter.format(new Date(poll.expiresAt))}
            </span>
          )}
          {canShowVoteTally ? (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {totalVotes} {t('votesCast')}
            </span>
          ) : null}
        </div>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{poll.title}</h1>
        {body ? <p className="text-lg text-on-surface-variant">{body}</p> : null}
      </div>
    </>
  );

  if (!token) {
    return (
      <div ref={rootRef} className="mx-auto max-w-3xl space-y-8 px-4 pb-16 pt-24">
        <div className="relative overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container p-6 shadow-2xl md:p-10">
          <div className="pointer-events-none absolute end-0 top-0 -mt-20 -me-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
          {pollHeader}
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-8 text-center">
            <h2 className="mb-3 text-2xl font-bold">{t('loginToVoteTitle')}</h2>
            <p className="mb-8 text-on-surface-variant">{t('loginToVoteBody')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="rounded-xl px-8">
                  {t('login')}
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="rounded-xl px-8">
                  {t('register')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="mx-auto max-w-3xl space-y-8 px-4 pb-16 pt-24">
      <div className="relative overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container p-6 shadow-2xl md:p-10">
        <div className="pointer-events-none absolute end-0 top-0 -mt-20 -me-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
        {pollHeader}

        {loadingOptions ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : (
          <div className="space-y-4">
            {options.map((option) => {
              const optionId = option._id;
              let votes = 0;
              let percentage = 0;
              if (results?.results) {
                const match = results.results.find((r) => String(r.optionId) === String(optionId));
                if (match) {
                  votes = match.votes;
                  percentage = match.percentage ?? 0;
                }
              }

              const isUserPick = userVotedOptionId && userVotedOptionId === String(optionId);

              return (
                <div key={optionId} className="relative">
                  {!showResults ? (
                    <button
                      type="button"
                      onClick={() => !isExpired && setSelectedOption(optionId)}
                      disabled={isExpired}
                      className={`w-full rounded-2xl border-none p-6 text-start transition-all hover:brightness-105 ${
                        selectedOption === optionId
                          ? 'bg-surface-bright shadow-lg ring-2 ring-primary ring-offset-2 ring-offset-surface-container'
                          : 'bg-surface-container-lowest hover:bg-surface-bright'
                      } ${isExpired ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <span className="text-lg font-semibold">{option.text}</span>
                    </button>
                  ) : (
                    <div
                      className={`relative overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-highest p-5 shadow-sm ${
                        winningId === String(optionId) ? 'ring-2 ring-secondary/70' : ''
                      } ${isUserPick ? 'ring-1 ring-primary/50' : ''}`}
                    >
                      <ProgressBar
                        value={percentage}
                        highlight={winningId === String(optionId)}
                        className="mb-4 h-4"
                      />
                      <div className="relative z-10 flex items-center justify-between gap-4">
                        <span className="text-lg font-semibold">{option.text}</span>
                        <div className="text-end">
                          <span className="text-xl font-bold">{percentage}%</span>
                          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                            {votes} {t('votesCast')}
                          </p>
                          {isUserPick ? (
                            <p className="mt-1 text-xs font-semibold text-primary">{t('yourVote')}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!showResults && !isExpired ? (
          <div className="mt-10 space-y-3">
            <Button
              size="lg"
              className="w-full rounded-2xl py-8 text-xl font-bold shadow-xl"
              disabled={!selectedOption || voteMutation.isPending}
              onClick={() => voteMutation.mutate({ pollId: id, optionId: selectedOption })}
            >
              {voteMutation.isPending ? t('submittingVote') : t('castVote')}
            </Button>

            {voteMutation.isError && !hideVoteError ? (
              <p className="text-center text-sm font-semibold text-error">{errorMessage}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
