import { useState } from 'react';
import {
  Check,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { testConnection } from '@/lib/api/glm-chat';
import { ZhipuError } from '@/lib/api/zhipu';
import {
  useSettings,
  type ChatModel,
  type ImageModel,
} from '@/lib/store/settings';
import { useGallery } from '@/lib/store/gallery';
import { usePromptHistory } from '@/lib/store/prompt-history';
import { exportCreationsJson } from '@/lib/utils/export';

const IMAGE_MODELS: SelectOption<ImageModel>[] = [
  { value: 'cogview-3-flash', label: 'CogView-3-Flash', hint: '免费 · 速度快' },
  { value: 'glm-image', label: 'GLM-Image', hint: '智谱图像系列' },
  { value: 'cogview-4', label: 'CogView-4', hint: '高质量 · 中英双语' },
  { value: 'cogview-4-250304', label: 'CogView-4-250304', hint: '最新版本' },
];

const CHAT_MODELS: SelectOption<ChatModel>[] = [
  { value: 'glm-4-flash', label: 'GLM-4-Flash', hint: '免费' },
  { value: 'glm-4-plus', label: 'GLM-4-Plus', hint: '增强' },
];

export function SettingsPage() {
  const apiKey = useSettings((s) => s.apiKey);
  const defaultImageModel = useSettings((s) => s.defaultImageModel);
  const defaultChatModel = useSettings((s) => s.defaultChatModel);
  const removeWatermark = useSettings((s) => s.removeWatermark);
  const lastTest = useSettings((s) => s.lastTest);
  const setApiKey = useSettings((s) => s.setApiKey);
  const setImageModel = useSettings((s) => s.setDefaultImageModel);
  const setChatModel = useSettings((s) => s.setDefaultChatModel);
  const setRemoveWatermark = useSettings((s) => s.setRemoveWatermark);
  const setLastTest = useSettings((s) => s.setLastTest);
  const clearAll = useSettings((s) => s.clearAll);
  const clearGallery = useGallery((s) => s.clearAll);

  const [draftKey, setDraftKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showClearKey, setShowClearKey] = useState(false);
  const [showClearHistory, setShowClearHistory] = useState(false);
  const [showClearAll, setShowClearAll] = useState(false);

  const historyCount = usePromptHistory((s) => s.items.length);
  const clearHistory = usePromptHistory((s) => s.clear);

  const keyChanged = draftKey.trim() !== apiKey;

  const onSaveKey = () => {
    setApiKey(draftKey);
    toast.success('API Key 已保存');
  };

  const onTest = async () => {
    if (!apiKey) {
      toast.error('请先保存 API Key 再测试');
      return;
    }
    setTesting(true);
    try {
      await testConnection(defaultChatModel);
      setLastTest('ok');
      toast.success('连接成功');
    } catch (e) {
      const friendly =
        e instanceof ZhipuError
          ? e.friendly
          : ((e as Error).message ?? '连接失败');
      setLastTest('failed');
      toast.error(friendly);
    } finally {
      setTesting(false);
    }
  };

  const onCopyKey = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      toast.success('已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  };

  const onClearKey = () => {
    setApiKey('');
    setDraftKey('');
    setShowClearKey(false);
    toast.success('API Key 已清除');
  };

  const onClearAll = () => {
    clearAll();
    setDraftKey('');
    clearHistory();
    clearGallery().catch(() => {});
    setShowClearAll(false);
    toast.success('已清除所有本地数据');
  };

  const onClearHistory = () => {
    clearHistory();
    setShowClearHistory(false);
    toast.success('Prompt 历史已清除');
  };

  const onExport = async () => {
    setExporting(true);
    try {
      const count = await exportCreationsJson();
      toast.success(
        count > 0 ? `已导出 ${count} 条作品元数据` : '没有作品可导出',
      );
    } catch (e) {
      toast.error((e as Error).message ?? '导出失败');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[720px] px-6 py-8">
      <header className="mb-6">
        <h1 className="text-h1 text-ink">设置</h1>
        <p className="mt-1 text-body text-ink-mist">
          所有数据仅保存在本机浏览器，不会上传到任何服务器。
        </p>
      </header>

      <div className="space-y-4">
        {/* API Key */}
        <section className="rounded-lg border border-hairline bg-slate-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <KeyRound
              className="h-4 w-4 text-aurora-violet"
              strokeWidth={1.75}
            />
            <h2 className="text-h3 text-ink">API Key</h2>
            {lastTest === 'ok' && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-xs bg-status-ok/12 px-2 py-0.5 text-overline uppercase tracking-wider text-status-ok">
                <Check className="h-3 w-3" /> 已连通
              </span>
            )}
            {lastTest === 'failed' && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-xs bg-status-err/12 px-2 py-0.5 text-overline uppercase tracking-wider text-status-err">
                <X className="h-3 w-3" /> 失败
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                value={draftKey}
                onChange={(e) => setDraftKey(e.target.value)}
                placeholder="粘贴你的智谱 API Key"
                spellCheck={false}
                autoComplete="off"
                className="pr-20"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  aria-label={showKey ? '隐藏' : '显示'}
                  onClick={() => setShowKey((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-sm text-ink-mist transition-colors hover:bg-slate-raised hover:text-ink"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="复制"
                  onClick={onCopyKey}
                  disabled={!apiKey}
                  className="flex h-8 w-8 items-center justify-center rounded-sm text-ink-mist transition-colors hover:bg-slate-raised hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <Button onClick={onSaveKey} disabled={!keyChanged}>
              保存
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onTest}
              loading={testing}
              disabled={!apiKey}
            >
              测试连通性
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClearKey(true)}
              disabled={!apiKey}
            >
              清除 Key
            </Button>
          </div>

          <p className="mt-3 text-body-sm text-ink-faded">
            前往{' '}
            <a
              href="https://bigmodel.cn/usercenter/proj-mgmt/apikeys"
              target="_blank"
              rel="noreferrer"
              className="text-aurora-violet underline-offset-2 hover:underline"
            >
              智谱开放平台
            </a>{' '}
            获取你的 API Key。
          </p>
        </section>

        {/* 默认图像模型 */}
        <section className="rounded-lg border border-hairline bg-slate-card p-5">
          <h2 className="text-h3 text-ink">默认图像模型</h2>
          <p className="mt-1 mb-3 text-body-sm text-ink-mist">
            创作页生成图片时的默认选择，可在生成时单独切换。
          </p>
          <Select
            value={defaultImageModel}
            onValueChange={(v) => setImageModel(v as ImageModel)}
            options={IMAGE_MODELS}
          />
        </section>

        {/* 默认对话模型 */}
        <section className="rounded-lg border border-hairline bg-slate-card p-5">
          <h2 className="text-h3 text-ink">优化提示词模型</h2>
          <p className="mt-1 mb-3 text-body-sm text-ink-mist">
            用于扩写提示词和连通性测试，建议优先选择免费的 Flash。
          </p>
          <Select
            value={defaultChatModel}
            onValueChange={(v) => setChatModel(v as ChatModel)}
            options={CHAT_MODELS}
          />
        </section>

        {/* 水印 */}
        <section className="rounded-lg border border-hairline bg-slate-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-h3 text-ink">去除水印</h2>
              <p className="mt-1 text-body-sm text-ink-mist">
                生成图片时请求智谱不添加水印。付费模型 (CogView-4) 完整生效；
                免费的 CogView-3-Flash 由智谱服务端决定，可能仍强制保留。
              </p>
            </div>
            <Switch
              checked={removeWatermark}
              onChange={setRemoveWatermark}
              aria-label="去除水印"
            />
          </div>
        </section>

        {/* 数据管理 */}
        <section className="rounded-lg border border-hairline bg-slate-card p-5">
          <h2 className="text-h3 text-ink">数据管理</h2>
          <p className="mt-1 mb-4 text-body-sm text-ink-mist">
            管理本地的 Prompt 历史与作品元数据。原图请到画廊单张下载。
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Download className="h-4 w-4" />}
              loading={exporting}
              onClick={onExport}
            >
              导出作品元数据 (JSON)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Clock className="h-4 w-4" />}
              onClick={() => setShowClearHistory(true)}
              disabled={historyCount === 0}
            >
              清除 Prompt 历史
              {historyCount > 0 && (
                <span className="ml-1 font-mono text-caption text-ink-faded">
                  ({historyCount})
                </span>
              )}
            </Button>
          </div>
        </section>

        {/* 危险区域 */}
        <section className="rounded-lg border border-status-err/30 bg-slate-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert
              className="h-4 w-4 text-status-err"
              strokeWidth={1.75}
            />
            <h2 className="text-h3 text-ink">危险区域</h2>
          </div>
          <p className="mb-4 text-body-sm text-ink-mist">
            一键清除所有本地数据，包含 API
            Key、模型偏好、提示词历史、画廊作品。此操作不可撤销。
          </p>
          <Button
            variant="danger"
            size="sm"
            iconLeft={<Trash2 className="h-4 w-4" />}
            onClick={() => setShowClearAll(true)}
          >
            清除所有本地数据
          </Button>
        </section>
      </div>

      <ConfirmDialog
        open={showClearKey}
        title="确认清除 API Key？"
        description="清除后需要重新粘贴。其它本地数据不受影响。"
        destructive
        confirmText="清除"
        onConfirm={onClearKey}
        onCancel={() => setShowClearKey(false)}
      />
      <ConfirmDialog
        open={showClearHistory}
        title="确认清除 Prompt 历史？"
        description={`即将删除最近 ${historyCount} 条记录。作品画廊与 API Key 不受影响。`}
        destructive
        confirmText="清除"
        onConfirm={onClearHistory}
        onCancel={() => setShowClearHistory(false)}
      />
      <ConfirmDialog
        open={showClearAll}
        title="确认清除所有本地数据？"
        description="此操作不可撤销。API Key、模型偏好、Prompt 历史、画廊作品都会被删除。"
        destructive
        confirmText="全部清除"
        onConfirm={onClearAll}
        onCancel={() => setShowClearAll(false)}
      />
    </div>
  );
}
