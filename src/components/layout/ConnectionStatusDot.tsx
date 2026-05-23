import { cn } from '@/lib/utils/cn';
import { useSettings } from '@/lib/store/settings';

export function ConnectionStatusDot() {
  const apiKey = useSettings((s) => s.apiKey);
  const lastTest = useSettings((s) => s.lastTest);

  let dot = 'bg-ink-disabled';
  let label = '未配置 Key';
  let breathe = false;

  if (apiKey) {
    if (lastTest === 'ok') {
      dot = 'bg-status-ok';
      label = '已连通';
      breathe = true;
    } else if (lastTest === 'failed') {
      dot = 'bg-status-err';
      label = '连接失败';
      breathe = true;
    } else {
      dot = 'bg-status-warn';
      label = '已配置·未测试';
    }
  }

  return (
    <div className="flex items-center gap-2 text-caption text-ink-mist" title={label}>
      <span
        aria-hidden
        className={cn('h-1.5 w-1.5 rounded-full', dot, breathe && 'animate-breathe')}
      />
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}
