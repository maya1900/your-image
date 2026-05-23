import type { ChatModel, ImageModel } from '@/lib/store/settings';

export type Quality = 'standard' | 'hd';

export interface Creation {
  id: string;
  prompt: string;
  negativePrompt?: string;
  model: ImageModel;
  size: string;
  quality?: Quality;
  blob: Blob;
  thumbnailDataUrl: string;
  favorite?: boolean;
  createdAt: number;
}

export type CreationListItem = Omit<Creation, 'blob'> & { blobUrl?: string };

export type { ChatModel, ImageModel };
