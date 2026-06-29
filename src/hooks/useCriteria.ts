import { useState, useCallback } from "react";

export interface Criterion {
  id: string;
  label: string;
  checked: boolean;
}

const STORAGE_KEY = "cv-reviewer-criteria";

const DEFAULT_CRITERIA: Criterion[] = [
  { id: "exp", label: "Kinh nghiệm làm việc phù hợp", checked: true },
  { id: "edu", label: "Học vấn đáp ứng yêu cầu", checked: true },
  { id: "skill", label: "Kỹ năng kỹ thuật", checked: true },
  { id: "lang", label: "Ngoại ngữ", checked: false },
  { id: "soft", label: "Kỹ năng mềm", checked: false },
];

function loadFromStorage(): Criterion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CRITERIA;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // ignore
  }
  return DEFAULT_CRITERIA;
}

function saveToStorage(criteria: Criterion[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(criteria));
  } catch {
    // ignore
  }
}

export function useCriteria() {
  const [criteria, setCriteria] = useState<Criterion[]>(loadFromStorage);

  const update = useCallback((updated: Criterion[]) => {
    setCriteria(updated);
    saveToStorage(updated);
  }, []);

  const toggle = useCallback(
    (id: string) => {
      update(criteria.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)));
    },
    [criteria, update]
  );

  const add = useCallback(
    (label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      const newItem: Criterion = {
        id: `custom-${Date.now()}`,
        label: trimmed,
        checked: true,
      };
      update([...criteria, newItem]);
    },
    [criteria, update]
  );

  const remove = useCallback(
    (id: string) => {
      update(criteria.filter((c) => c.id !== id));
    },
    [criteria, update]
  );

  const checkedLabels = criteria.filter((c) => c.checked).map((c) => c.label);

  return { criteria, toggle, add, remove, checkedLabels };
}
