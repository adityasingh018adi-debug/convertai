export type CompanyProfile = { id: string; name: string; address: string };

const LS_KEY = "doclify_companies_v1";
const LS_LAST_USED = "doclify_companies_last_used_v1";

const DEFAULT_COMPANY: CompanyProfile = {
  id: "default",
  name: "DoclifyAI Business",
  address: "Mumbai, Maharashtra",
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function getCompanies(): CompanyProfile[] {
  if (typeof window === "undefined") return [DEFAULT_COMPANY];
  try {
    const raw = localStorage.getItem(LS_KEY);
    const list = raw ? (JSON.parse(raw) as CompanyProfile[]) : [];
    return list.length > 0 ? list : [DEFAULT_COMPANY];
  } catch {
    return [DEFAULT_COMPANY];
  }
}

export function addCompany(name: string, address: string): CompanyProfile {
  const company: CompanyProfile = { id: uid(), name: name.trim(), address: address.trim() };
  if (typeof window !== "undefined") {
    try {
      const next = [...getCompanies().filter((c) => c.id !== "default"), company];
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      localStorage.setItem(LS_LAST_USED, company.id);
    } catch {
      /* ignore */
    }
  }
  return company;
}

export function getLastUsedCompanyId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LS_LAST_USED);
  } catch {
    return null;
  }
}

export function setLastUsedCompanyId(id: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_LAST_USED, id);
  } catch {
    /* ignore */
  }
}
