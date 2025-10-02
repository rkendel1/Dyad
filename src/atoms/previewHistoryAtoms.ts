import { atom } from "jotai";

export interface PreviewHistoryItem {
  url: string;
  timestamp: number;
  appId: number;
  title?: string;
}

// Store preview history (max 20 items)
export const previewHistoryAtom = atom<PreviewHistoryItem[]>([]);

// Add item to preview history
export const addToPreviewHistoryAtom = atom(
  null,
  (get, set, item: PreviewHistoryItem) => {
    const history = get(previewHistoryAtom);

    // Check if URL already exists in history
    const existingIndex = history.findIndex(
      (h) => h.url === item.url && h.appId === item.appId,
    );

    let newHistory: PreviewHistoryItem[];
    if (existingIndex >= 0) {
      // Move to front and update timestamp
      newHistory = [
        { ...item, timestamp: Date.now() },
        ...history.slice(0, existingIndex),
        ...history.slice(existingIndex + 1),
      ];
    } else {
      // Add to front
      newHistory = [{ ...item, timestamp: Date.now() }, ...history];
    }

    // Keep only last 20 items
    if (newHistory.length > 20) {
      newHistory = newHistory.slice(0, 20);
    }

    set(previewHistoryAtom, newHistory);
  },
);

// Clear preview history
export const clearPreviewHistoryAtom = atom(null, (get, set) => {
  set(previewHistoryAtom, []);
});

// Get history for specific app
export const getAppPreviewHistoryAtom = atom((get) => {
  return (appId: number) => {
    const history = get(previewHistoryAtom);
    return history.filter((item) => item.appId === appId);
  };
});
