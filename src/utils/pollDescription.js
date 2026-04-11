/**
 * Backend stores a single `description` string. We encode optional cover image + body as JSON
 * for rich create-poll UX while staying compatible with plain text.
 */
const PREFIX = '__POLL_JSON__';

export function encodePollDescription({ coverUrl, body }) {
  const trimmedBody = (body ?? '').trim();
  if (!coverUrl && !trimmedBody) return '';
  if (!coverUrl) return trimmedBody;
  return `${PREFIX}${JSON.stringify({ cover: coverUrl, body: trimmedBody })}`;
}

export function decodePollDescription(raw) {
  if (!raw || typeof raw !== 'string') {
    return { coverUrl: null, body: '' };
  }
  if (raw.startsWith(PREFIX)) {
    try {
      const parsed = JSON.parse(raw.slice(PREFIX.length));
      return {
        coverUrl: typeof parsed.cover === 'string' ? parsed.cover : null,
        body: typeof parsed.body === 'string' ? parsed.body : '',
      };
    } catch {
      return { coverUrl: null, body: raw };
    }
  }
  if (/^https?:\/\//i.test(raw.trim())) {
    return { coverUrl: raw.trim(), body: '' };
  }
  return { coverUrl: null, body: raw };
}

/**
 * Prefer API `coverImage` when present; otherwise decode legacy `description` encoding.
 */
export function getPollCoverAndBody(poll) {
  if (!poll || typeof poll !== 'object') {
    return { coverUrl: null, body: '' };
  }
  const fromApi = typeof poll.coverImage === 'string' ? poll.coverImage.trim() : '';
  if (fromApi) {
    const desc = poll.description;
    if (typeof desc === 'string' && desc.startsWith(PREFIX)) {
      const { body } = decodePollDescription(desc);
      return { coverUrl: fromApi, body };
    }
    return { coverUrl: fromApi, body: typeof desc === 'string' ? desc : '' };
  }
  return decodePollDescription(poll.description);
}
