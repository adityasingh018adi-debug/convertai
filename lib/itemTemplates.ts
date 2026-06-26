export type ItemTemplateLine = { desc: string; hsn?: string; qty: number; rate: number; gstPercent: number };
export type ItemTemplate = { id: string; name: string; items: ItemTemplateLine[]; createdAt: string };

const LS_KEY = "doclify_item_templates_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function getItemTemplates(): ItemTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as ItemTemplate[]) : [];
  } catch {
    return [];
  }
}

export function saveItemTemplate(name: string, items: ItemTemplateLine[]): ItemTemplate {
  const template: ItemTemplate = { id: uid(), name: name.trim(), items, createdAt: new Date().toISOString() };
  const next = [template, ...getItemTemplates()];
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return template;
}

export function deleteItemTemplate(id: string) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(getItemTemplates().filter((t) => t.id !== id)));
  } catch {
    /* ignore */
  }
}
