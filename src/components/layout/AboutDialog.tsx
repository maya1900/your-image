import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Github, MessageCircle, X } from 'lucide-react';
import pkg from '../../../package.json';

const REPO_URL = 'https://github.com/maya1900/your-image';
const ISSUES_URL = `${REPO_URL}/issues/new`;

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AboutDialog({ open, onClose }: AboutDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/70 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.19, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="关于 Your Image"
            className="relative w-full max-w-[480px] rounded-xl border border-hairline bg-slate-card p-6 shadow-pop"
          >
            <button
              type="button"
              aria-label="关闭"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-sm text-ink-mist transition-colors hover:bg-slate-raised hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-aurora-gradient">
                <span className="text-h3 font-bold text-void">Y</span>
              </div>
              <div>
                <h2 className="text-h3 text-ink">Your Image</h2>
                <p className="font-mono text-caption text-ink-faded">
                  v{pkg.version} · MIT License
                </p>
              </div>
            </div>

            <p className="mb-5 text-body-sm leading-relaxed text-ink-mist">
              基于智谱 CogView / GLM 系列的本地 AI 文生图工作台。
              单页应用，自带 API Key，作品仅存本机浏览器，不登录、不上云。
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 items-center justify-center gap-2 rounded-sm border border-hairline bg-transparent px-4 text-body-sm text-ink-mist transition-colors hover:border-[#28283A] hover:bg-slate-raised hover:text-ink"
              >
                <Github className="h-4 w-4" strokeWidth={1.75} />
                GitHub 仓库
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
              <a
                href={ISSUES_URL}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 items-center justify-center gap-2 rounded-sm border border-hairline bg-transparent px-4 text-body-sm text-ink-mist transition-colors hover:border-[#28283A] hover:bg-slate-raised hover:text-ink"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                反馈 / Issues
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </div>

            <div className="mt-5 border-t border-hairline pt-4 text-center text-caption text-ink-faded">
              © 2026 maya1900
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
