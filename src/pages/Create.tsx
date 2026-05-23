import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { PromptInput } from '@/components/prompt/PromptInput';
import { OptimizeButton } from '@/components/prompt/OptimizeButton';
import { StylePresetsBar } from '@/components/prompt/StylePresetsBar';
import { PromptHistoryChips } from '@/components/prompt/PromptHistoryChips';
import { SizeSelector } from '@/components/params/SizeSelector';
import { ModelSelector } from '@/components/params/ModelSelector';
import { QualityToggle } from '@/components/params/QualityToggle';
import { CountSelector, type GenerateCount } from '@/components/params/CountSelector';
import { ResultGrid, EmptyKeyHint } from '@/components/results/ResultGrid';
import { Lightbox } from '@/components/results/Lightbox';
import { generateImageWithRetry } from '@/lib/api/cogview';
import { ZhipuError } from '@/lib/api/zhipu';
import { blobToThumbnail, urlToBlob } from '@/lib/utils/image';
import { runPool } from '@/lib/utils/concurrency';
import { uuid } from '@/lib/utils/id';
import { applyPresets } from '@/lib/presets/styles';
import { useGallery } from '@/lib/store/gallery';
import { usePromptHistory } from '@/lib/store/prompt-history';
import { useSettings, type ImageModel } from '@/lib/store/settings';
import { useTasks } from '@/lib/store/tasks';
import type { Creation, Quality } from '@/types/creation';

interface FormState {
  prompt: string;
  size: string;
  model: ImageModel;
  quality: Quality;
  count: GenerateCount;
}

const HD_MODELS: ImageModel[] = ['cogview-4', 'cogview-4-250304'];

/**
 * 各模型每次提交允许的并发请求数。
 * 免费的 cogview-3-flash 在并发 ≥ 2 时几乎一定撞 QPS 限制，必须串行。
 */
const MAX_PARALLEL: Record<ImageModel, number> = {
  'glm-image': 2,
  'cogview-3-flash': 1,
  'cogview-4': 2,
  'cogview-4-250304': 2,
};

export function CreatePage() {
  const apiKey = useSettings((s) => s.apiKey);
  const defaultImageModel = useSettings((s) => s.defaultImageModel);

  const tasks = useTasks((s) => s.current);
  const resetTasks = useTasks((s) => s.reset);
  const succeedTask = useTasks((s) => s.succeed);
  const failTask = useTasks((s) => s.fail);

  const galleryAdd = useGallery((s) => s.add);
  const galleryRemove = useGallery((s) => s.remove);
  const galleryToggleFav = useGallery((s) => s.toggleFavorite);
  const loadGallery = useGallery((s) => s.load);

  const addHistory = usePromptHistory((s) => s.add);

  const [form, setForm] = useState<FormState>(() => ({
    prompt: '',
    size: '1024x1024',
    model: defaultImageModel,
    quality: 'standard',
    count: 1,
  }));

  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  /** 优化前的 prompt 原文，用于撤销 */
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [optimized, setOptimized] = useState(false);

  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm((f) => ({ ...f, model: defaultImageModel }));
  }, [defaultImageModel]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  useEffect(() => {
    if (!HD_MODELS.includes(form.model) && form.quality === 'hd') {
      setForm((f) => ({ ...f, quality: 'standard' }));
    }
  }, [form.model, form.quality]);

  const galleryList = useGallery((s) => s.items);
  const lightboxItems = useMemo(() => {
    const success = tasks
      .filter((t) => t.creation)
      .map((t) => t.creation!) as Creation[];
    if (success.length > 0) return success;
    return galleryList;
  }, [tasks, galleryList]);

  const PROMPT_MAX = 1500;
  const canSubmit =
    !!apiKey &&
    form.prompt.trim().length > 0 &&
    form.prompt.length <= PROMPT_MAX &&
    !submitting;

  const runOne = async (taskId: string, req: ReturnType<typeof buildRequest>) => {
    try {
      const resp = await generateImageWithRetry(req);
      const url = resp.data[0]?.url;
      if (!url) throw new Error('未返回图像 URL');
      const blob = await urlToBlob(url);
      const thumb = await blobToThumbnail(blob);
      const creation: Creation = {
        id: taskId,
        prompt: req.prompt,
        model: req.model,
        size: req.size ?? '1024x1024',
        quality: req.quality,
        blob,
        thumbnailDataUrl: thumb,
        createdAt: Date.now(),
      };
      await galleryAdd(creation);
      succeedTask(taskId, creation);
    } catch (e) {
      const msg = e instanceof ZhipuError ? e.friendly : (e as Error).message;
      failTask(taskId, msg ?? '生成失败');
    }
  };

  const handleGenerate = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const ids = Array.from({ length: form.count }, () => uuid());
    resetTasks(ids);
    const req = buildRequest(form, selectedPresets);
    addHistory(form.prompt);
    const limit = MAX_PARALLEL[form.model] ?? 1;
    try {
      await runPool(ids, limit, (id) => runOne(id, req));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = async (taskId: string) => {
    const req = buildRequest(form, selectedPresets);
    useTasks.setState((s) => ({
      current: s.current.map((t) =>
        t.id === taskId
          ? { ...t, status: 'pending', error: undefined, creation: undefined }
          : t
      ),
    }));
    await runOne(taskId, req);
  };

  const handleDelete = async (c: Creation) => {
    await galleryRemove(c.id);
    useTasks.setState((s) => ({ current: s.current.filter((t) => t.id !== c.id) }));
    toast.success('已删除');
  };

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      {/* Params panel */}
      <aside className="shrink-0 border-b border-hairline bg-carbon/50 md:w-[360px] md:border-b-0 md:border-r">
        <div className="flex h-full flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-overline uppercase tracking-wider text-ink-faded">
                  描述画面
                </span>
                <OptimizeButton
                  prompt={form.prompt}
                  onOptimized={(next) => {
                    setOriginalPrompt(form.prompt);
                    setOptimized(true);
                    setForm((f) => ({ ...f, prompt: next }));
                  }}
                  originalPrompt={originalPrompt}
                  onUndo={() => {
                    setForm((f) => ({ ...f, prompt: originalPrompt }));
                    setOptimized(false);
                  }}
                  hasOptimized={optimized}
                />
              </div>
              <PromptInput
                value={form.prompt}
                onChange={(v) => {
                  if (optimized) setOptimized(false);
                  setForm((f) => ({ ...f, prompt: v }));
                }}
                onSubmit={handleGenerate}
                maxLength={PROMPT_MAX}
              />
            </div>

            <PromptHistoryChips
              onPick={(p) => {
                setOriginalPrompt('');
                setOptimized(false);
                setForm((f) => ({ ...f, prompt: p }));
              }}
            />

            <StylePresetsBar
              selected={selectedPresets}
              onToggle={(id) =>
                setSelectedPresets((s) =>
                  s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
                )
              }
            />

            <SizeSelector
              value={form.size}
              onChange={(v) => setForm((f) => ({ ...f, size: v }))}
            />

            <ModelSelector
              value={form.model}
              onChange={(v) => setForm((f) => ({ ...f, model: v }))}
            />

            <QualityToggle
              value={form.quality}
              onChange={(v) => setForm((f) => ({ ...f, quality: v }))}
              model={form.model}
            />

            <CountSelector
              value={form.count}
              onChange={(v) => setForm((f) => ({ ...f, count: v }))}
            />
          </div>

          <div className="border-t border-hairline bg-carbon px-5 py-4">
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={!canSubmit}
              loading={submitting}
              iconLeft={!submitting ? <Sparkles className="h-4 w-4" /> : undefined}
            >
              {submitting ? `生成中 · ${tasks.filter((t) => t.status !== 'pending').length}/${tasks.length}` : '生成图像'}
            </Button>
            {!apiKey ? (
              <p className="mt-2 text-center text-caption text-ink-faded">
                请先到{' '}
                <Link to="/settings" className="text-aurora-violet hover:underline">
                  设置页
                </Link>{' '}
                配置 API Key
              </p>
            ) : (
              <p className="mt-2 text-center text-caption text-ink-faded">
                <kbd className="rounded-xs border border-hairline bg-slate-raised px-1 font-mono text-[10px] text-ink-mist">
                  ⌘
                </kbd>{' '}
                +{' '}
                <kbd className="rounded-xs border border-hairline bg-slate-raised px-1 font-mono text-[10px] text-ink-mist">
                  Enter
                </kbd>{' '}
                快速生成
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Results area */}
      <section className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
        {!apiKey ? (
          <EmptyKeyHint />
        ) : (
          <>
            <header className="mb-5 flex items-baseline justify-between">
              <h2 className="text-h3 text-ink">本次生成</h2>
              {tasks.length > 0 && (
                <p className="text-caption text-ink-faded">
                  {tasks.filter((t) => t.status === 'success').length} /{' '}
                  {tasks.length} 完成
                </p>
              )}
            </header>
            <ResultGrid
              tasks={tasks}
              onRetry={handleRetry}
              onSelect={(c) => setLightboxId(c.id)}
              onToggleFavorite={(c) => galleryToggleFav(c.id)}
              onDelete={handleDelete}
            />
            {submitting && tasks.length === 0 && (
              <div className="mt-6 flex items-center justify-center gap-2 text-body-sm text-ink-mist">
                <Loader2 className="h-4 w-4 animate-spin" />
                正在派发请求…
              </div>
            )}
          </>
        )}
      </section>

      <Lightbox
        list={lightboxItems}
        currentId={lightboxId}
        onClose={() => setLightboxId(null)}
        onNavigate={(id) => setLightboxId(id)}
        onToggleFavorite={(c) => galleryToggleFav(c.id)}
      />
    </div>
  );
}

function buildRequest(form: FormState, presetIds: string[]) {
  const includeQuality = HD_MODELS.includes(form.model);
  return {
    model: form.model,
    prompt: applyPresets(form.prompt, presetIds),
    size: form.size,
    quality: includeQuality ? form.quality : undefined,
  };
}
