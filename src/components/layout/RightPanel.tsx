import React from 'react';
import { useTasks } from '../../context/TaskContext';

export const RightPanel: React.FC = () => {
  const { announcements, notifications } = useTasks();
  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  return (
    <aside className="hidden lg:flex flex-col border-l-[1.5px] border-ink p-8 gap-8 bg-bg dark:bg-ink overflow-y-auto">
      <div>
        <span className="mono block mb-6 text-ink dark:text-bg">Latest Notices</span>
        
        {announcements.slice(0, 2).map((notice, idx) => (
          <div key={notice.id} className="border-b-[1.5px] border-ink-faint pb-6 mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <span className="mono text-accent">{idx === 0 ? 'Pinned' : 'New'}</span>
              <span className="mono text-ink-muted">{new Date(notice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            </div>
            <h4 className="font-serif text-2xl mb-2 text-ink dark:text-bg">{notice.title}</h4>
            <p className="text-sm text-ink-muted line-clamp-2">{notice.content}</p>
            
            <div className="flex items-center gap-3 mt-6">
              <div className="w-8 h-8 border-[1.5px] border-ink bg-bg dark:bg-ink text-ink dark:text-bg flex items-center justify-center mono text-[0.6rem]">
                CR
              </div>
              <div>
                <div className="mono text-[0.7rem] text-ink dark:text-bg">{notice.authorName}</div>
                <div className="mono text-[0.5rem] text-ink-muted">Verified</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto border-[1.5px] border-ink p-6">
        <span className="mono block text-ink dark:text-bg">Notification Center</span>
        <p className="text-[0.7rem] mt-2 text-ink dark:text-bg">
          You have ({unreadNotifs}) new unread alerts.
        </p>
        <button className="w-full bg-ink dark:bg-bg text-bg dark:text-ink mono text-[0.65rem] p-2 mt-4 hover:bg-accent dark:hover:bg-accent transition-colors">
          View All
        </button>
      </div>
    </aside>
  );
};
