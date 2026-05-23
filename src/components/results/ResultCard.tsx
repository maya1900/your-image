import { AlertCircle, Copy, Download, Heart, RefreshCw, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { downloadBlob, makeImageFilename } from '@/lib/utils/download';
import type { Creation } from '@/types/creation';
import type { TaskItem } from '@/lib/store/tasks';

interface ResultCardProps {
  task: TaskItem;
  onRetry: (taskId: string) => void;
  onSelect: (creation: Creation) => void;
  onToggleFavorite: (creation: Creation) => void;
  onDelete: (creation: Creation) => void;
}

export function ResultCard({
  task,
  onRetry,
  onSelect,
  onToggleFavorite,
  onDelete,
}: ResultCardProps) {
  const c = task.creation;

  if (task.status === 'pending') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative aspect-square overflow-hidden rounded-xl border border-hairline bg-slate-card"
      >
        <div className="skeleton absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center text-caption text-ink-mist">
          正在生成…
        </div>
      </motion.div>
    );
  }

  if (task.status === 'failed') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-status-err/40 bg-status-err/5 p-4 text-center"
      >
        <AlertCircle className="h-7 w-7 text-status-err" strokeWidth={1.5} />
        <p className="text-body-sm text-ink">{task.error ?? '生成失败'}</p>
        <Button
          size="sm"
          variant="secondary"
          iconLeft={<RefreshCw className="h-4 w-4" />}
          onClick={() => onRetry(task.id)}
        >
          重试
        </Button>
      </motion.div>
    );
  }

  if (!c) return null;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(c.prompt);
      toast.success('Prompt 已复制');
    } catch {
      toast.error('复制失败');
    }
  };

  const onDownload = () => {
    downloadBlob(c.blob, makeImageFilename(c.createdAt));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="group relative aspect-square overflow-hidden rounded-xl border border-hairline bg-slate-card"
    >
      <button
        type="button"
        onClick={() => onSelect(c)}
        className="block h-full w-full"
        aria-label="查看大图"
      >
        <img
          src={c.thumbnailDataUrl}
          alt={c.prompt.slice(0, 40)}
          className="h-full w-full object-cover transition-transform duration-300 ease-out-expo group-hover:scale-[1.02]"
        />
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-void/85 via-void/40 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="flex flex-wrap gap-1.5">
          <IconAction onClick={onDownload} label="下载">
            <Download className="h-4 w-4" />
          </IconAction>
          <IconAction onClick={copyPrompt} label="复制 Prompt">
            <Copy className="h-4 w-4" />
          </IconAction>
          <IconAction
            onClick={() => onToggleFavorite(c)}
            label={c.favorite ? '取消收藏' : '收藏'}
            active={c.favorite}
          >
            <Heart
              className={cn('h-4 w-4', c.favorite && 'fill-status-err text-status-err')}
            />
          </IconAction>
        </div>
        <IconAction onClick={() => onDelete(c)} label="删除" danger>
          <Trash2 className="h-4 w-4" />
        </IconAction>
      </div>
    </motion.div>
  );
}

function IconAction({
  onClick,
  label,
  children,
  active,
  danger,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={label}
      aria-label={label}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-sm bg-slate-card/80 backdrop-blur-sm transition-colors',
        active ? 'text-status-err' : 'text-ink-mist hover:text-ink',
        danger && 'hover:bg-status-err/20 hover:text-status-err'
      )}
    >
      {children}
    </button>
  );
}
