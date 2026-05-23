import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Images, Sparkles, Settings as SettingsIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AboutDialog } from './AboutDialog';
import pkg from '../../../package.json';

const items = [
  { to: '/create', label: '创作', icon: Sparkles },
  { to: '/gallery', label: '画廊', icon: Images },
  { to: '/settings', label: '设置', icon: SettingsIcon },
] as const;

interface SidebarProps {
  /** 移动端抽屉是否展开（桌面端忽略） */
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* 桌面端：左侧常驻 */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-carbon md:flex">
        <SidebarContent onAboutClick={() => setAboutOpen(true)} />
      </aside>

      {/* 移动端：抽屉 + 遮罩 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30 bg-void/70 backdrop-blur-sm md:hidden"
            onClick={onClose}
            role="presentation"
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex h-full w-64 max-w-[80vw] flex-col border-r border-hairline bg-carbon"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="主导航"
              aria-modal="true"
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭导航"
                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-sm text-ink-mist transition-colors hover:bg-slate-raised hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent onAboutClick={() => setAboutOpen(true)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}

interface SidebarContentProps {
  onAboutClick: () => void;
}

function SidebarContent({ onAboutClick }: SidebarContentProps) {
  return (
    <>
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

      <div className="mt-auto px-5 pb-4">
        <p className="text-caption text-ink-faded">Key 与作品仅本机存储</p>
        <button
          type="button"
          onClick={onAboutClick}
          className="mt-1 inline-flex h-6 items-center gap-1 rounded-xs text-caption text-aurora-violet/80 transition-colors hover:text-aurora-violet"
        >
          关于 · v{pkg.version}
        </button>
      </div>
    </>
  );
}
