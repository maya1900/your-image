import { Cpu } from 'lucide-react';
import { Select, type SelectOption } from '@/components/ui/Select';
import type { ImageModel } from '@/lib/store/settings';

const IMAGE_MODELS: SelectOption<ImageModel>[] = [
  { value: 'glm-image', label: 'GLM-Image', hint: '智谱图像系列' },
  { value: 'cogview-3-flash', label: 'CogView-3-Flash', hint: '免费' },
  { value: 'cogview-4', label: 'CogView-4', hint: '高质量' },
  { value: 'cogview-4-250304', label: 'CogView-4-250304', hint: '最新' },
];

interface ModelSelectorProps {
  value: ImageModel;
  onChange: (v: ImageModel) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Cpu className="h-3.5 w-3.5 text-ink-faded" strokeWidth={1.75} />
        <span className="text-overline uppercase tracking-wider text-ink-faded">模型</span>
      </div>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as ImageModel)}
        options={IMAGE_MODELS}
      />
    </div>
  );
}
