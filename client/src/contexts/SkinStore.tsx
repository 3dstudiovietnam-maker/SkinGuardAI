import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

/** Vertex AI (Gemini) ABCDE elemzés eredménye — egy-egy ABCDE kritérium */
export interface AIAnalysisCriterion {
  score: number;        // 0–100, ahol 0 = semmi gond, 100 = súlyos
  description: string; // Gemini szöveges magyarázata
}

/** A Vertex AI teljes ABCDE elemzési eredménye */
export interface AIAnalysis {
  asymmetry: AIAnalysisCriterion;
  border: AIAnalysisCriterion;
  color: AIAnalysisCriterion;
  diameter: AIAnalysisCriterion;
  overallRisk: "low" | "medium" | "high";
  recommendation: string;
  disclaimer: string;
}

export interface MolePhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  notes: string;
  /** Vertex AI (Gemini) ABCDE elemzés — csak akkor van jelen, ha az elemzés lefutott */
  aiAnalysis?: AIAnalysis;
}

export interface MoleEntry {
  id: string;
  name: string;
  region: string;
  photos: MolePhoto[];
  createdAt: number;
  lastChecked: number;
  reminderDays: number;
  riskLevel: "low" | "medium" | "high" | "unknown";
}

export interface AnalysisResult {
  asymmetry: number;
  borderIrregularity: number;
  colorVariation: number;
  diameter: number;
  evolution: number;
  overallScore: number;
  recommendation: string;
}

interface SkinStoreContextType {
  moles: MoleEntry[];
  addMole: (mole: Omit<MoleEntry, "id" | "createdAt" | "lastChecked">) => string;
  updateMole: (id: string, updates: Partial<MoleEntry>) => void;
  deleteMole: (id: string) => void;
  getMole: (id: string) => MoleEntry | undefined;
  getMolesByRegion: (region: string) => MoleEntry[];
  addPhotoToMole: (moleId: string, photo: Omit<MolePhoto, "id" | "timestamp">) => void;
  isLoggedIn: boolean;
  userName: string;
  userId: string | null;
  login: (name: string, id: string) => void;
  logout: () => void;
}

const SkinStoreContext = createContext<SkinStoreContextType | null>(null);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function SkinStoreProvider({ children }: { children: ReactNode }) {
  const [moles, setMoles] = useState<MoleEntry[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("dermiq_logged_in") === "true";
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("dermiq_user_name") || "";
  });
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem("dermiq_user_id") || null;
  });

  // Adatok betöltése user ID alapján
  useEffect(() => {
    if (userId) {
      try {
        const stored = localStorage.getItem(`dermiq_moles_${userId}`);
        if (stored) {
          setMoles(JSON.parse(stored));
        } else {
          setMoles([]);
        }
      } catch {
        setMoles([]);
      }
    } else {
      setMoles([]);
    }
  }, [userId]);

  // Adatok mentése user ID alapján
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`dermiq_moles_${userId}`, JSON.stringify(moles));
    }
  }, [moles, userId]);

  const addMole = useCallback((mole: Omit<MoleEntry, "id" | "createdAt" | "lastChecked">): string => {
    const id = generateId();
    const now = Date.now();
    setMoles(prev => [...prev, { ...mole, id, createdAt: now, lastChecked: now }]);
    return id;
  }, []);

  const updateMole = useCallback((id: string, updates: Partial<MoleEntry>) => {
    setMoles(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const deleteMole = useCallback((id: string) => {
    setMoles(prev => prev.filter(m => m.id !== id));
  }, []);

  const getMole = useCallback((id: string) => {
    return moles.find(m => m.id === id);
  }, [moles]);

  const getMolesByRegion = useCallback((region: string) => {
    return moles.filter(m => m.region === region);
  }, [moles]);

  const addPhotoToMole = useCallback((moleId: string, photo: Omit<MolePhoto, "id" | "timestamp">) => {
    const photoEntry: MolePhoto = {
      ...photo,
      id: generateId(),
      timestamp: Date.now(),
    };
    setMoles(prev => prev.map(m =>
      m.id === moleId
        ? { ...m, photos: [...m.photos, photoEntry], lastChecked: Date.now() }
        : m
    ));
  }, []);

  const login = useCallback((name: string, id: string) => {
    setIsLoggedIn(true);
    setUserName(name);
    setUserId(id);
    localStorage.setItem("dermiq_logged_in", "true");
    localStorage.setItem("dermiq_user_name", name);
    localStorage.setItem("dermiq_user_id", id);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserName("");
    setUserId(null);
    localStorage.removeItem("dermiq_logged_in");
    localStorage.removeItem("dermiq_user_name");
    localStorage.removeItem("dermiq_user_id");
    setMoles([]);
  }, []);

  return (
    <SkinStoreContext.Provider value={{
      moles, addMole, updateMole, deleteMole, getMole,
      getMolesByRegion, addPhotoToMole, isLoggedIn, userName, userId,
      login, logout
    }}>
      {children}
    </SkinStoreContext.Provider>
  );
}

export function useSkinStore() {
  const ctx = useContext(SkinStoreContext);
  if (!ctx) throw new Error("useSkinStore must be used within SkinStoreProvider");
  return ctx;
}