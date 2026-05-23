import { Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { CreatePage } from './pages/Create';
import { GalleryPage } from './pages/Gallery';
import { SettingsPage } from './pages/Settings';

export default function App() {
  return (
    <div className="flex h-full min-h-[100dvh] bg-void text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Navigate to="/create" replace />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/create" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
