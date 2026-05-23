import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Copy, Download, Heart, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { downloadBlob, makeImageFilename } from '@/lib/utils/download';
import type { Creation } from '@/types/creation';

interface LightboxProps {
  list: Creation[];
  currentId: string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
  onToggleFavorite?: (c: Creation) => void;
}

export function Lightbox({
  list,
  currentId,
  onClose,
  onNavigate,
  onToggleFavorite,
}: LightboxProps) {
  const idx = useMemo(
    () => (currentId ? list.findIndex((i) => i.id === currentId) : -1),
    [list, currentId]
  );
  const current = idx >= 0 ? list[idx] : null;

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && idx > 0) onNavigate(list[idx - 1].id);
      if (e.key === 'ArrowRight' && idx < list.length - 1) onNavigate(list[idx + 1].id);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [current, idx, list, onClose, onNavigate]);

  const objectUrl = useMemo(
    () => (current ? URL.createObjectURL(current.blob) : null),
    [current]
  );

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const copyPrompt = async () => {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(current.prompt);
      toast.success('Prompt 已复制');
    } catch {
      toast.error('复制失败');
    }
  };

  const onDownload = () => {
    if (!current) return;
    downloadBlob(current.blob, makeImageFilename(current.createdAt));
  };

  return (
    <AnimatePresence>
      {current && objectUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex flex-col bg-void/95"
        >
          {/* top bar */}
          <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-body text-ink">{current.prompt}</p>
              <p className="text-caption text-ink-faded">
                {current.model} · {current.size}
                {current.quality === 'hd' ? ' · HD' : ''} ·{' '}
                {new Date(current.createdAt).toLocaleString('zh-CN')}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <ToolBtn onClick={copyPrompt} label="复制 Prompt">
                <Copy className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn onClick={onDownload} label="下载">
                <Download className="h-4 w-4" />
              </ToolBtn>
              {onToggleFavorite && (
                <ToolBtn
                  onClick={() => onToggleFavorite(current)}
                  label={current.favorite ? '取消收藏' : '收藏'}
                  active={current.favorite}
                >
                  <Heart
                    className={cn(
                      'h-4 w-4',
                      current.favorite && 'fill-status-err text-status-err'
                    )}
                  />
                </ToolBtn>
              )}
              <ToolBtn onClick={onClose} label="关闭">
                <X className="h-4 w-4" />
              </ToolBtn>
            </div>
          </div>

          {/* image stage */}
          <div className="relative flex flex-1 items-center justify-center p-6">
            {idx > 0 && (
              <button
                type="button"
                aria-label="上一张"
                onClick={() => onNavigate(list[idx - 1].id)}
                className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-slate-card/70 text-ink-mist backdrop-blur-sm transition-colors hover:bg-slate-raised hover:text-ink"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <motion.img
              key={current.id}
              src={objectUrl}
              alt={current.prompt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18 }}
              className="max-h-[calc(100vh-160px)] max-w-full rounded-xl object-contain shadow-pop"
            />
            {idx < list.length - 1 && (
              <button
                type="button"
                aria-label="下一张"
                onClick={() => onNavigate(list[idx + 1].id)}
                className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-slate-card/70 text-ink-mist backdrop-blur-sm transition-colors hover:bg-slate-raised hover:text-ink"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToolBtn({
  onClick,
  children,
  label,
  active,
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-sm transition-colors',
        active ? 'text-status-err' : 'text-ink-mist hover:bg-slate-raised hover:text-ink'
      )}
    >
      {children}
    </button>
  );
}
