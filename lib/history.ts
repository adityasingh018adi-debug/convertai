export type HistoryType = "word-to-pdf" | "pdf-to-word" | "invoice" | "challan" | "ocr";

export type HistoryItem = {
  id: string;
  type: HistoryType;
  name: string;
  meta: string;
  createdAt: string;
};

const LS_KEY = "doclify_history_v1";
const MAX_ITEMS = 50;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function addHistoryItem(type: HistoryType, name: string, meta: string) {
  if (typeof window === "undefined") return;
  try {
    const items = getHistory();
    const next: HistoryItem[] = [
      { id: uid(), type, name, meta, createdAt: new Date().toISOString() },
      ...items,
    ].slice(0, MAX_ITEMS);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function removeHistoryItem(id: string) {
  if (typeof window === "undefined") return;
  try {
    const items = getHistory().filter((i) => i.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "Yesterday";
  return `${day} days ago`;
}
