import { useState } from 'react';
import { Sparkles, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { optimizePrompt } from '@/lib/api/glm-chat';
import { ZhipuError } from '@/lib/api/zhipu';
import { useSettings } from '@/lib/store/settings';

interface OptimizeButtonProps {
  prompt: string;
  onOptimized: (next: string) => void;
  /** 把"撤销"挂在 useState 里，需要父组件持有原文 */
  originalPrompt: string;
  onUndo: () => void;
  hasOptimized: boolean;
}

export function OptimizeButton({
  prompt,
  onOptimized,
  originalPrompt,
  onUndo,
  hasOptimized,
}: OptimizeButtonProps) {
  const apiKey = useSettings((s) => s.apiKey);
  const chatModel = useSettings((s) => s.defaultChatModel);
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (!prompt.trim()) {
      toast.error('请先输入描述');
      return;
    }
    if (!apiKey) {
      toast.error('请先在设置中填入 API Key');
      return;
    }
    setLoading(true);
    try {
      const optimized = await optimizePrompt(prompt, chatModel);
      if (!optimized) throw new Error('未返回内容');
      onOptimized(optimized);
      toast.success('提示词已优化');
    } catch (e) {
      const msg = e instanceof ZhipuError ? e.friendly : (e as Error).message;
      toast.error(msg ?? '优化失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        loading={loading}
        onClick={onClick}
        iconLeft={!loading ? <Sparkles className="h-3.5 w-3.5" /> : undefined}
        disabled={!prompt.trim() || !apiKey}
      >
        优化提示词
      </Button>
      {hasOptimized && originalPrompt !== prompt && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onUndo}
          iconLeft={<Undo2 className="h-3.5 w-3.5" />}
        >
          撤销
        </Button>
      )}
    </div>
  );
}
