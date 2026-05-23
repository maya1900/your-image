import { Component, type ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface State {
  error: Error | null;
}

interface Props {
  children: ReactNode;
  /** 兜底用：如果整个根节点崩了，不依赖 Router */
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    // 仅本地开发用 — 不上报，保护隐私
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  reset = () => this.setState({ error: null });

  reload = () => window.location.reload();

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-status-err/30 bg-status-err/10">
            <AlertOctagon className="h-6 w-6 text-status-err" strokeWidth={1.5} />
          </div>
          <h2 className="text-h2 text-ink">页面遇到了问题</h2>
          <p className="mt-2 text-body-sm text-ink-mist">
            {this.state.error.message || '未知错误'}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<RotateCcw className="h-4 w-4" />}
              onClick={this.reset}
            >
              重试
            </Button>
            <Button size="sm" onClick={this.reload}>
              刷新页面
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
