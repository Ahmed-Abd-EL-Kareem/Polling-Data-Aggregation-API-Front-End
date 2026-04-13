import React, { useState, useLayoutEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { fetchUserById, updateUser } from '../../services/userService';
import { useAuthStore } from '../../app/store';
import { getPollsByUser, deletePoll, updatePoll } from '../polls/PollService';
import { uploadImageToCloudinary } from '../../services/cloudinary';
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
  const rootRef = useRef(null);

  const [activeTab, setActiveTab] = useState('settings'); // 'polls' | 'settings'
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading avatar...');
    try {
      const url = await uploadImageToCloudinary(file);
      const updatedUserRes = await updateUser(id, { image: url });
      
      setUser({ ...user, ...updatedUserRes.data });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      toast.success('Avatar updated successfully!', { id: toastId });
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Upload failed. Check Cloudinary connection & config.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
  }, [activeTab]);

  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUserById(id),
    enabled: Boolean(id),
  });

  const { data: myPolls, isLoading: isPollsLoading, refetch: refetchPolls } = useQuery({
    queryKey: ['my-polls', id],
    queryFn: () => getPollsByUser(id, { limit: 50, sort: '-createdAt' }),
    enabled: Boolean(id) && activeTab === 'polls',
  });

  const remote = data?.data;
  const createdPolls = myPolls?.data || [];

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm(t('confirmDelete', 'Are you sure you want to delete this poll?'))) return;
    try {
      await deletePoll(pollId);
      toast.success(t('pollDeleted', 'Poll deleted successfully'));
      refetchPolls();
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    } catch (err) {
      toast.error(t('deleteFailed', 'Failed to delete poll'));
    }
  };

  const handleEditPoll = async (pollId, currentTitle) => {
    const newTitle = window.prompt(t('updateTitlePrompt', 'Update Poll Title:'), currentTitle);
    if (!newTitle || newTitle === currentTitle) return;
    try {
      await updatePoll(pollId, { title: newTitle });
      toast.success(t('pollUpdated', 'Poll updated successfully'));
      refetchPolls();
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
    } catch (err) {
      toast.error(t('updateFailed', 'Failed to update poll'));
    }
  };

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
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-24 text-center">
        <Skeleton className="h-40 w-full rounded-2xl mx-auto max-w-xl" />
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen pt-28 pb-24 font-sans px-4 md:px-8">
      <div className="max-w-5xl mx-auto w-full">
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-xl overflow-hidden bg-surface-container-high shadow-2xl flex items-center justify-center relative">
                {remote?.image ? (
                  <img src={remote.image} alt={remote.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-extrabold text-primary opacity-50 uppercase">
                    {remote?.name?.[0] || 'U'}
                  </span>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="material-symbols-outlined animate-spin text-white">progress_activity</span>
                  </div>
                )}
              </div>
              <label 
                className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-lg text-on-primary shadow-lg cursor-pointer hover:scale-110 transition-transform"
                title="Change Avatar"
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload} 
                  disabled={isUploading}
                />
                <span className="material-symbols-outlined text-sm">edit</span>
              </label>
            </div>
            
            <div className="flex-grow text-center md:text-left space-y-4">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tighter mb-1">{remote?.name || 'User Profile'}</h1>
                <p className="text-on-surface-variant font-medium tracking-wide text-xs uppercase opacity-80">
                  {remote?.role} • Active Member
                </p>
              </div>
              <p className="text-on-surface-variant max-w-2xl leading-relaxed text-sm">
                 Manage your settings, update credentials, and review polls. Exploring continuous data integrity and democracy.
              </p>
              <div className="flex justify-center md:justify-start gap-4 pt-2">
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all ${activeTab === 'settings' ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => setActiveTab('polls')}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all ${activeTab === 'polls' ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                >
                  My Polls
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full md:w-auto">
              <div className="bg-surface-container-low p-4 rounded-xl text-center min-w-[120px]">
                <span className="block text-2xl font-bold text-primary">{createdPolls.length}</span>
                <span className="text-[10px] tracking-widest text-on-surface-variant uppercase">Created</span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl text-center min-w-[120px]">
                 <span className="block text-2xl font-bold text-secondary">Active</span>
                 <span className="text-[10px] tracking-widest text-on-surface-variant uppercase">Status</span>
              </div>
            </div>
          </div>
        </section>

        <div ref={rootRef} className="w-full">
           {activeTab === 'settings' ? (
             <form
                onSubmit={handleSubmit((vals) => mutation.mutate(vals))}
                className="space-y-6 rounded-2xl border-none bg-surface-container p-8 shadow-xl max-w-2xl"
              >
                <h3 className="text-xl font-extrabold mb-6">Account Settings</h3>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">{t('fullName')}</label>
                  <Input {...register('name')} className="bg-surface-container-low border-none rounded-xl" />
                  {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">{t('email')}</label>
                  <Input type="email" {...register('email')} className="bg-surface-container-low border-none rounded-xl" />
                  {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
                </div>
                
                <Button type="submit" className="w-full rounded-xl py-4 font-bold bg-primary text-on-primary hover:bg-primary-fixed mt-4" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving...' : t('save')}
                </Button>
              </form>
           ) : (
             <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/create">
                  <div className="bg-surface-container-low border-2 border-dashed border-outline-variant/20 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 group cursor-pointer hover:border-primary/40 transition-all h-full min-h-[220px]">
                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">add</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface text-lg">Create New Poll</h3>
                      <p className="text-xs text-on-surface-variant">Launch your next inquiry</p>
                    </div>
                  </div>
                </Link>

                {createdPolls.map(poll => (
                  <div key={poll._id || poll.id} className="bg-surface-container rounded-xl p-6 hover:bg-surface-container-high transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2 py-1 rounded bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest">{poll.category || 'General'}</span>
                    </div>
                    <Link to={`/poll/${poll._id || poll.id}`}>
                      <h3 className="text-lg font-bold mb-6 leading-tight group-hover:text-primary transition-colors cursor-pointer">{poll.title}</h3>
                    </Link>
                    <div className="mt-6 flex items-center justify-between text-xs text-on-surface-variant font-medium">
                      <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
                      <div className="flex gap-4">
                        <Link to={`/poll/${poll._id || poll.id}`}>
                          <button className="hover:text-primary transition-colors" title="View Poll"><span className="material-symbols-outlined text-lg">visibility</span></button>
                        </Link>
                        <button className="hover:text-primary transition-colors" title="Edit Poll" onClick={() => handleEditPoll(poll._id || poll.id, poll.title)}>
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button className="hover:text-error transition-colors" title="Delete Poll" onClick={() => handleDeletePoll(poll._id || poll.id)}>
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </section>
           )}
        </div>
      </div>
    </div>
  );
}
