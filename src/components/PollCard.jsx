import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { getPollCoverAndBody } from '../utils/pollDescription';

export function PollCard({ poll, index = 0 }) {
  const { t } = useTranslation();
  const id = poll._id || poll.id;
  const expiresAt = poll.expiresAt ? new Date(poll.expiresAt) : null;
  const isExpired = expiresAt ? new Date() > expiresAt : false;
  const { coverUrl, body } = getPollCoverAndBody(poll);
  const creator = poll.createdBy;
  const name = creator?.name || '—';
  const badge =
    index % 3 === 0 ? { key: 'trending', className: 'bg-secondary/10 text-secondary' } : index % 3 === 1
      ? { key: 'featured', className: 'bg-primary/10 text-primary' }
      : { key: 'active', className: 'bg-on-surface-variant/10 text-on-surface-variant' };

  return (
    <article
      data-poll-card
      className="group flex h-full flex-col rounded-2xl bg-surface-container p-8 transition-colors duration-200 hover:bg-surface-container-high"
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${badge.className}`}
        >
          {t(badge.key)}
        </span>
        {expiresAt && (
          <span className="flex items-center gap-1 text-xs text-on-surface-variant">
            <Clock className="h-3.5 w-3.5" />
            {isExpired ? t('ended') : expiresAt.toLocaleDateString()}
          </span>
        )}
      </div>

      {coverUrl && (
        <div className="relative mb-6 aspect-video overflow-hidden rounded-xl ring-1 ring-black/10">
          <img src={coverUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        </div>
      )}

      <h3 className="mb-4 text-2xl font-bold leading-tight text-on-surface line-clamp-2">{poll.title}</h3>

      {body ? (
        <p className="mb-6 line-clamp-2 text-sm text-on-surface-variant">{body}</p>
      ) : null}

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest text-sm font-bold text-primary">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">{name}</p>
          <p className="text-[10px] uppercase tracking-tighter text-on-surface-variant flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {creator?.role || 'Member'}
          </p>
        </div>
      </div>

      <div className="mt-auto">
        <Link to={`/poll/${id}`} className="block">
          <Button
            variant="outline"
            className="w-full rounded-xl border-primary/20 bg-surface-container-highest py-4 font-bold text-primary transition-all duration-300 hover:bg-primary hover:text-on-primary"
          >
            {isExpired ? t('viewResults') : t('voteNow')}
          </Button>
        </Link>
      </div>
    </article>
  );
}
