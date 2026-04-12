import React, { useLayoutEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useAuthStore } from '../../app/store';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { getAdminGlobalStats, getPolls, deletePoll } from '../polls/PollService';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }, []);

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminGlobalStats,
    enabled: user?.role === 'admin',
  });

  const [page, setPage] = useState(1);

  const { data: pollsData, isLoading: isPollsLoading, refetch } = useQuery({
    queryKey: ['admin-polls', page],
    queryFn: () => getPolls({ limit: 10, page }),
    enabled: user?.role === 'admin',
  });

  if (user?.role !== 'admin') {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-2xl font-bold">{t('accessDenied')}</h1>
        <Link to="/">
          <Button>{t('home')}</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this poll?')) return;
    try {
      await deletePoll(id);
      toast.success('Poll deleted successfully');
      refetch();
    } catch {
      toast.error('Failed to delete poll');
    }
  };

  const stats = statsData?.data;
  const pollList = pollsData?.data ?? [];

  return (
    <div ref={rootRef} className="bg-[#0b1326] text-[#dae2fd] min-h-screen pb-16 pt-24 font-sans">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
        
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tighter text-[#dae2fd]">Dashboard Overview</h1>
          <p className="text-on-surface-variant text-sm font-medium">Welcome back to the command center.</p>
        </header>

        {/* Analytics Cards Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-container rounded-xl p-6 border-none flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Total Polls</span>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">ballot</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tighter">
                {isStatsLoading ? <Skeleton className="h-8 w-16" /> : (stats?.totalPolls ?? 0)}
              </div>
              <div className="flex items-center gap-1 text-secondary text-xs mt-1">
                <span>All time created</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-6 border-none flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Total Votes</span>
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">how_to_vote</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tighter">
                 {isStatsLoading ? <Skeleton className="h-8 w-16" /> : (stats?.totalVotes ?? 0)}
              </div>
              <div className="flex items-center gap-1 text-secondary text-xs mt-1">
                <span>Platform engagement</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-6 border-none flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Live Users</span>
              <div className="w-10 h-10 rounded-lg bg-tertiary-container/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary-container">group</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tighter">System</div>
              <div className="flex items-center gap-1 text-on-surface-variant text-xs mt-1">
                <span className="material-symbols-outlined text-sm">remove</span>
                <span>Stable connectivity</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-6 border-none flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Alerts</span>
              <div className="w-10 h-10 rounded-lg bg-error-container/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error">report</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tighter">0</div>
              <div className="flex items-center gap-1 text-secondary text-xs mt-1">
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </section>

        {/* Most Popular Asymmetry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-container rounded-xl p-8 space-y-8 flex flex-col justify-center relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-lg font-bold">Trending Poll</h3>
               <p className="text-on-surface-variant text-sm mb-4">Highest engagement overall</p>
               {isStatsLoading ? (
                 <Skeleton className="h-16 w-full rounded-xl" />
               ) : (
                 <div>
                   <h4 className="text-2xl font-extrabold text-primary mb-2">
                     {stats?.mostPopularPoll?.title ?? "No data yet"}
                   </h4>
                   <p className="font-medium text-secondary">{stats?.mostPopularPoll?.votes ?? 0} total votes</p>
                 </div>
               )}
             </div>
             <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
          </div>

          <div className="bg-surface-container rounded-xl p-8 relative overflow-hidden flex flex-col">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-6">Winning Option</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-1 h-12 bg-secondary rounded-full"></div>
                  <div>
                    <p className="text-sm font-bold">{stats?.mostVotedOption?.optionText ?? "No Option Yet"}</p>
                    <p className="text-xs text-on-surface-variant">Globally most selected</p>
                    <p className="text-[10px] text-primary mt-1 font-bold">TOP PICK</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table List */}
        <section className="bg-surface-container rounded-xl overflow-hidden mt-8">
          <div className="p-8 flex justify-between items-center border-none">
            <div>
              <h3 className="text-lg font-bold">Manage Polls</h3>
              <p className="text-on-surface-variant text-sm">Review, edit, or remove community content.</p>
            </div>
            <Link to="/create">
              <button className="bg-gradient-to-r from-[#c0c1ff] to-[#8083ff] text-[#1000a9] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-sm">add</span>
                New Poll
              </button>
            </Link>
          </div>
          
          <div className="overflow-x-auto px-8 pb-8">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant border-none">
                  <th className="pb-4 font-bold">Poll Title</th>
                  <th className="pb-4 font-bold">Creator</th>
                  <th className="pb-4 font-bold">Created Date</th>
                  <th className="pb-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-surface-container-low/50">
                {isPollsLoading ? (
                  <tr>
                    <td colSpan={4} className="py-4"><Skeleton className="h-8 w-full" /></td>
                  </tr>
                ) : pollList.map((poll) => (
                  <tr key={poll._id || poll.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-5 border-none max-w-[250px] truncate">
                      <p className="font-bold truncate">{poll.title}</p>
                      <span className="text-[10px] text-primary font-bold uppercase">{poll.category || "General"}</span>
                    </td>
                    <td className="py-5 border-none text-on-surface-variant">{poll.createdBy?.name || "System"}</td>
                    <td className="py-5 border-none text-on-surface-variant">
                      {new Date(poll.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-5 border-none text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/poll/${poll._id || poll.id}`}>
                          <button className="p-2 rounded-lg hover:bg-surface-bright text-primary transition-colors">
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                        </Link>
                        <button onClick={() => handleDelete(poll._id || poll.id)} className="p-2 rounded-lg hover:bg-error-container/20 text-error transition-colors">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isPollsLoading && pollList.length === 0 && (
                   <tr>
                     <td colSpan={4} className="py-8 text-center text-on-surface-variant font-medium text-sm">
                       No polls exist yet.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
            
            {(pollsData?.totalPages > 1) && (
              <div className="flex items-center justify-between border-t border-surface-container-low/50 pt-4 mt-4">
                <span className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">
                  Page {page} of {pollsData.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isPollsLoading}
                    className="bg-transparent border-surface-container-highest text-xs px-3 h-8"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(pollsData.totalPages, p + 1))}
                    disabled={page === pollsData.totalPages || isPollsLoading}
                    className="bg-transparent border-surface-container-highest text-xs px-3 h-8"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
