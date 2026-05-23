import { NavLink } from 'react-router-dom';
import { Images, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const items = [
  { to: '/create', label: '创作', icon: Sparkles },
  { to: '/gallery', label: '画廊', icon: Images },
  { to: '/settings', label: '设置', icon: SettingsIcon },
] as const;

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-carbon md:flex">
      <div className="flex h-14 items-center gap-2 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-aurora-gradient">
          <span className="text-[14px] font-bold text-void">Y</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-body font-semibold text-ink">Your Image</span>
          <span className="text-caption text-ink-faded">文生图工作台</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'group relative flex h-10 items-center gap-3 rounded-md px-3 text-body transition-colors',
                isActive
                  ? 'bg-slate-card text-ink'
                  : 'text-ink-mist hover:bg-slate-card/60 hover:text-ink'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-aurora-gradient" />
                )}
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-5 pb-4 text-caption text-ink-faded">
        <p>Key 与作品仅本机存储 ·</p>
        <p>v0.1.0</p>
      </div>
    </aside>
  );
}
