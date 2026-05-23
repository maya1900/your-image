import { Link, useLocation } from 'react-router-dom';
import { Settings as SettingsIcon } from 'lucide-react';
import { ConnectionStatusDot } from './ConnectionStatusDot';

const PAGE_TITLES: Record<string, string> = {
  '/create': '创作',
  '/gallery': '画廊',
  '/settings': '设置',
};

export function TopBar() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? '';

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-hairline bg-carbon/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-h2 font-semibold text-ink">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <ConnectionStatusDot />
        <Link
          to="/settings"
          aria-label="设置"
          className="flex h-9 w-9 items-center justify-center rounded-sm text-ink-mist transition-colors hover:bg-slate-raised hover:text-ink"
        >
          <SettingsIcon className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>
    </header>
  );
}
