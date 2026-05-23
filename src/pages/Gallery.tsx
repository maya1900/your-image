import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Images, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Lightbox } from '@/components/results/Lightbox';
import { cn } from '@/lib/utils/cn';
import { downloadBlob, makeImageFilename } from '@/lib/utils/download';
import { useGallery } from '@/lib/store/gallery';
import type { Creation } from '@/types/creation';

type Filter = 'all' | 'favorite';

export function GalleryPage() {
  const navigate = useNavigate();
  const items = useGallery((s) => s.items);
  const loaded = useGallery((s) => s.loaded);
  const load = useGallery((s) => s.load);
  const remove = useGallery((s) => s.remove);
  const toggleFavorite = useGallery((s) => s.toggleFavorite);
  const clearAll = useGallery((s) => s.clearAll);

  const [filter, setFilter] = useState<Filter>('all');
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Creation | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (filter === 'favorite' ? items.filter((i) => i.favorite) : items),
    [items, filter]
  );

  const handleReuse = (c: Creation) => {
    // Phase 3 会接入 prompt 历史；这里直接复制到剪贴板并跳转
    navigator.clipboard.writeText(c.prompt).catch(() => {});
    toast.success('已复制 Prompt，到创作页粘贴使用');
    navigate('/create');
  };

  const onConfirmDelete = async () => {
    if (!confirmDelete) return;
    await remove(confirmDelete.id);
    setConfirmDelete(null);
    if (lightboxId === confirmDelete.id) setLightboxId(null);
    toast.success('已删除');
  };

  const onConfirmClearAll = async () => {
    await clearAll();
    setConfirmClearAll(false);
    toast.success('画廊已清空');
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-h1 text-ink">画廊</h1>
          <span className="rounded-xs bg-slate-raised px-2 py-0.5 font-mono text-caption text-ink-mist">
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>
            全部
          </FilterTab>
          <FilterTab
            active={filter === 'favorite'}
            onClick={() => setFilter('favorite')}
          >
            收藏
          </FilterTab>
          {items.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              iconLeft={<Trash2 className="h-4 w-4" />}
              onClick={() => setConfirmClearAll(true)}
            >
              清空画廊
            </Button>
          )}
        </div>
      </header>

      {!loaded ? (
        <div className="py-16 text-center text-body-sm text-ink-mist">加载中…</div>
      ) : visible.length === 0 ? (
        <EmptyGallery filter={filter} onGo={() => navigate('/create')} />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {visible.map((c, i) => (
            <CreationCard
              key={c.id}
              creation={c}
              index={i}
              onOpen={() => setLightboxId(c.id)}
              onToggleFavorite={() => toggleFavorite(c.id)}
              onDownload={() => downloadBlob(c.blob, makeImageFilename(c.createdAt))}
              onDelete={() => setConfirmDelete(c)}
              onReuse={() => handleReuse(c)}
            />
          ))}
        </div>
      )}

      <Lightbox
        list={visible}
        currentId={lightboxId}
        onClose={() => setLightboxId(null)}
        onNavigate={setLightboxId}
        onToggleFavorite={(c) => toggleFavorite(c.id)}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="确认删除这张作品？"
        description="作品将从本地画廊中永久移除，不可恢复。"
        destructive
        confirmText="删除"
        onConfirm={onConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
      <ConfirmDialog
        open={confirmClearAll}
        title="确认清空整个画廊？"
        description={`即将删除全部 ${items.length} 张作品，不可恢复。`}
        destructive
        confirmText="全部清空"
        onConfirm={onConfirmClearAll}
        onCancel={() => setConfirmClearAll(false)}
      />
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-9 rounded-sm px-3 text-body-sm transition-colors',
        active
          ? 'bg-aurora-soft text-ink'
          : 'text-ink-mist hover:bg-slate-raised hover:text-ink'
      )}
    >
      {children}
    </button>
  );
}

function CreationCard({
  creation,
  index,
  onOpen,
  onToggleFavorite,
  onDownload,
  onDelete,
  onReuse,
}: {
  creation: Creation;
  index: number;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onReuse: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.28 }}
      className="group relative overflow-hidden rounded-xl border border-hairline bg-slate-card"
    >
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
        aria-label="查看大图"
      >
        <div className="aspect-square w-full overflow-hidden">
          <img
            src={creation.thumbnailDataUrl}
            alt={creation.prompt.slice(0, 40)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 ease-out-expo group-hover:scale-[1.03]"
          />
        </div>
        <div className="px-3 py-2.5">
          <p className="line-clamp-2 text-body-sm text-ink">{creation.prompt}</p>
          <p className="mt-1 font-mono text-[11px] text-ink-faded">
            {creation.model} · {creation.size}
            {creation.quality === 'hd' ? ' · HD' : ''}
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        aria-label={creation.favorite ? '取消收藏' : '收藏'}
        className={cn(
          'absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-sm bg-slate-card/80 backdrop-blur-sm transition-colors',
          creation.favorite
            ? 'text-status-err'
            : 'text-ink-mist opacity-0 hover:text-ink group-hover:opacity-100'
        )}
      >
        <Heart
          className={cn(
            'h-4 w-4',
            creation.favorite && 'fill-status-err text-status-err'
          )}
        />
      </button>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end gap-1 bg-gradient-to-b from-void/70 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <HoverBtn
          onClick={onReuse}
          label="再生成"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <HoverBtn
          onClick={onDownload}
          label="下载"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          }
        />
        <HoverBtn
          onClick={onDelete}
          label="删除"
          danger
          icon={<Trash2 className="h-4 w-4" />}
        />
      </div>
    </motion.div>
  );
}

function HoverBtn({
  onClick,
  label,
  icon,
  danger,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
      className={cn(
        'pointer-events-auto flex h-8 w-8 items-center justify-center rounded-sm bg-slate-card/80 text-ink-mist backdrop-blur-sm transition-colors hover:text-ink',
        danger && 'hover:bg-status-err/20 hover:text-status-err'
      )}
    >
      {icon}
    </button>
  );
}

function EmptyGallery({
  filter,
  onGo,
}: {
  filter: Filter;
  onGo: () => void;
}) {
  if (filter === 'favorite') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-hairline bg-slate-card">
          <Heart className="h-6 w-6 text-status-err" strokeWidth={1.5} />
        </div>
        <h3 className="text-h3 text-ink">还没有收藏的作品</h3>
        <p className="mt-2 text-body-sm text-ink-mist">
          在画廊或生成结果中点击 ♥ 即可加入收藏。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-aurora-soft blur-md" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-hairline bg-slate-card">
          <Images className="h-6 w-6 text-aurora-violet" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-h3 text-ink">这里会保存你生成的所有作品</h3>
      <p className="mt-2 text-body-sm text-ink-mist">
        所有图片仅保存在本机浏览器，不会上传到任何服务器。
      </p>
      <Button className="mt-5" onClick={onGo} iconLeft={<Sparkles className="h-4 w-4" />}>
        去创作
      </Button>
    </div>
  );
}
