import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { Plus, Trash2, CalendarClock } from 'lucide-react';
import { createPoll, createOption } from './PollService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UploadComponent } from '../../components/ui/UploadComponent';

const pollSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  image: z.string().optional(),
  expiresAt: z.string().min(1, 'Expiration date is required'),
  options: z
    .array(z.object({ text: z.string().min(1, 'Option text cannot be empty') }))
    .min(2, 'At least two options are required'),
});

export function CreatePoll() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rootRef = React.useRef(null);

  React.useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  }, []);

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 16);
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: '',
      description: '',
      image: '',
      expiresAt: getTomorrow(),
      options: [{ text: '' }, { text: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const imageValue = watch('image');

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const coverUrl = String(payload.image ?? '')
        .trim()
        .replace(/^javascript:/i, '');
      const pollRes = await createPoll({
        title: payload.title,
        description: (payload.description || '').trim(),
        coverImage: coverUrl || undefined,
        expiresAt: new Date(payload.expiresAt).toISOString(),
      });
      const pollId = pollRes.data._id;
      for (const text of payload.options) {
        await createOption({ pollId, text });
      }
      return pollId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      navigate('/');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({
      title: data.title,
      description: data.description,
      image: data.image,
      options: data.options.map((o) => o.text),
      expiresAt: data.expiresAt,
    });
  };

  return (
    <div ref={rootRef} className="mx-auto max-w-2xl px-4 pb-16 pt-24">
      <h1 className="text-display mb-10 text-4xl md:text-5xl">{t('createPoll')}</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-10 rounded-3xl border border-outline-variant/10 bg-surface-container p-8 shadow-2xl md:p-10"
      >
        <div className="space-y-3">
          <label className="text-label">{t('pollTitleField')}</label>
          <Input
            className="h-12 text-lg"
            placeholder="What's your question?"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-xs font-medium text-error">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-label">{t('description')}</label>
          <textarea
            className="min-h-[100px] w-full rounded-md bg-surface-container-lowest px-4 py-3 text-sm text-on-surface ring-offset-background placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="Optional context for voters"
            {...register('description')}
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-label">
            <CalendarClock className="h-4 w-4 text-primary" /> {t('expiration')}
          </label>
          <Input type="datetime-local" className="h-12" {...register('expiresAt')} />
          {errors.expiresAt && (
            <p className="text-xs font-medium text-error">{errors.expiresAt.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-label">{t('coverOptional')}</label>
          <input type="hidden" {...register('image')} />
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-transparent p-1">
            <UploadComponent
              value={imageValue}
              onChange={(url) =>
                setValue('image', url || '', { shouldDirty: true, shouldTouch: true, shouldValidate: true })
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-label">{t('options')}</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant/50">
                  {index + 1}
                </span>
                <Input
                  className="h-12 ps-10"
                  placeholder={t('optionLabel', { n: index + 1 })}
                  {...register(`options.${index}.text`)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length <= 2}
                className="h-12 w-12 shrink-0 text-error hover:bg-error/10"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}
          {errors.options && (
            <p className="text-xs font-medium text-error">{errors.options.message}</p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ text: '' })}
            className="w-full rounded-xl border-dashed py-6"
          >
            <Plus className="me-2 h-5 w-5" /> {t('addOption')}
          </Button>
        </div>

        <Button
          type="submit"
          className="w-full rounded-xl py-6 text-lg font-bold shadow-xl"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? t('publishing') : t('publishPoll')}
        </Button>
      </form>
    </div>
  );
}
