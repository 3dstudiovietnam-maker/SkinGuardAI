import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { trpc } from "@/lib/trpc";

/** Gemini ABCDE elemzés eredménye — egy-egy ABCDE kritérium */
export interface AIAnalysisCriterion {
  score: number;        // 0–100, ahol 0 = semmi gond, 100 = súlyos
  descriptionCode: string; // Gemini description code (pl. "ASYMMETRY_NONE")
}

/** A Gemini teljes ABCDE elemzési eredménye */
export interface AIAnalysis {
  asymmetry: AIAnalysisCriterion;
  border: AIAnalysisCriterion;
  color: AIAnalysisCriterion;
  diameter: AIAnalysisCriterion;
  overallRisk: "low" | "medium" | "high";
  recommendationCode: string; // pl. "RECOMMENDATION_LOW"
  disclaimer: string;
}

export interface MolePhoto {
  id: string;           // backend ID (number) stringgé alakítva
  dataUrl: string;
  timestamp: number;
  notes: string;
  aiAnalysis?: AIAnalysis;
  moleId: string;
}

export interface MoleEntry {
  id: string;           // backend ID (number) stringgé alakítva
  name: string;
  region: string;
  photos: MolePhoto[];  // Helyi cache — MoleDetail tölti be külön
  photoCount: number;   // DB-ből jövő pontos szám (scan-limit ellenőrzéshez)
  createdAt: number;
  lastChecked: number;
  reminderDays: number;
  riskLevel: "low" | "medium" | "high" | "unknown";
  userId: string;
}

interface SkinStoreContextType {
  moles: MoleEntry[];
  isLoading: boolean;
  addMole: (mole: Omit<MoleEntry, "id" | "createdAt" | "lastChecked" | "userId" | "photos" | "photoCount">) => Promise<string>;
  updateMole: (id: string, updates: Partial<MoleEntry>) => Promise<void>;
  deleteMole: (id: string) => Promise<void>;
  getMole: (id: string) => MoleEntry | undefined;
  getMolesByRegion: (region: string) => MoleEntry[];
  addPhotoToMole: (moleId: string, photo: Omit<MolePhoto, "id" | "timestamp" | "moleId">) => Promise<string>;
  isLoggedIn: boolean;
  userName: string;
  userId: string | null;
  login: (name: string, id: string) => void;
  logout: () => void;
  refreshMoles: () => Promise<void>;
}

const SkinStoreContext = createContext<SkinStoreContextType | null>(null);

export function SkinStoreProvider({ children }: { children: ReactNode }) {
  const [moles, setMoles] = useState<MoleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("dermiq_logged_in") === "true";
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("dermiq_user_name") || "";
  });
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem("dermiq_user_id") || null;
  });

  const utils = trpc.useUtils();

  // NOTE: onSuccess was removed from useQuery in TanStack Query v5 — use useEffect instead
  const getAllMolesQuery = trpc.mole.getAll.useQuery(undefined, {
    enabled: !!userId && isLoggedIn,
  });

  // Sync moles from query data to local state
  useEffect(() => {
    if (getAllMolesQuery.data) {
      const frontendMoles: MoleEntry[] = getAllMolesQuery.data.map(mole => ({
        id: String(mole.id),
        name: mole.name,
        region: mole.region,
        createdAt: new Date(mole.createdAt).getTime(),
        lastChecked: new Date(mole.lastChecked).getTime(),
        reminderDays: mole.reminderDays,
        riskLevel: (mole.riskLevel ?? "unknown") as "low" | "medium" | "high" | "unknown",
        userId: String(mole.userId),
        photoCount: Number((mole as any).photoCount ?? 0),
        photos: [],
      }));
      setMoles(frontendMoles);
    }
  }, [getAllMolesQuery.data]);

  const createMoleMutation = trpc.mole.create.useMutation({
    onSuccess: (data) => {
      // Add new mole to local state immediately (so MoleDetail finds it before refetch)
      setMoles(prev => [...prev, {
        id: String(data.id),
        name: data.name,
        region: data.region,
        createdAt: new Date(data.createdAt).getTime(),
        lastChecked: new Date(data.lastChecked).getTime(),
        reminderDays: data.reminderDays,
        riskLevel: (data.riskLevel ?? "unknown") as "low" | "medium" | "high" | "unknown",
        userId: String(data.userId),
        photoCount: 0,
        photos: [],
      }]);
    },
  });

  const updateMoleMutation = trpc.mole.update.useMutation({
    onSuccess: () => {
      utils.mole.getAll.invalidate();
    },
  });

  const deleteMoleMutation = trpc.mole.delete.useMutation();

  const uploadPhotoMutation = trpc.photo.upload.useMutation({
    onSuccess: (_data, variables) => {
      // Only increment photoCount — don't invalidate (would reset photos to [])
      setMoles(prev => prev.map(mole =>
        mole.id === String(variables.moleId)
          ? { ...mole, photoCount: (mole.photoCount ?? 0) + 1, lastChecked: Date.now() }
          : mole
      ));
    },
  });

  const saveAnalysisMutation = trpc.analysis.save.useMutation();

  const refreshMoles = useCallback(async () => {
    if (userId && isLoggedIn) {
      setIsLoading(true);
      try {
        await utils.mole.getAll.invalidate();
      } finally {
        setIsLoading(false);
      }
    }
  }, [userId, isLoggedIn, utils]);

  // Load moles on login, clear on logout
  useEffect(() => {
    if (userId && isLoggedIn) {
      refreshMoles();
    } else {
      setMoles([]);
    }
  }, [userId, isLoggedIn, refreshMoles]);

  const addMole = useCallback(async (
    mole: Omit<MoleEntry, "id" | "createdAt" | "lastChecked" | "userId" | "photos" | "photoCount">
  ): Promise<string> => {
    if (!userId) throw new Error("User not logged in");

    const result = await createMoleMutation.mutateAsync({
      name: mole.name,
      region: mole.region,
      reminderDays: mole.reminderDays,
    });

    return String(result.id);
  }, [userId, createMoleMutation]);

  const updateMole = useCallback(async (id: string, updates: Partial<MoleEntry>) => {
    if (!userId) throw new Error("User not logged in");

    await updateMoleMutation.mutateAsync({
      id: Number(id),
      name: updates.name,
      region: updates.region,
      reminderDays: updates.reminderDays,
      riskLevel: updates.riskLevel,
      lastChecked: updates.lastChecked ? new Date(updates.lastChecked) : undefined,
    });

    setMoles(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, [userId, updateMoleMutation]);

  const deleteMole = useCallback(async (id: string) => {
    if (!userId) throw new Error("User not logged in");

    await deleteMoleMutation.mutateAsync({ id: Number(id) });
    setMoles(prev => prev.filter(m => m.id !== id));
  }, [userId, deleteMoleMutation]);

  const getMole = useCallback((id: string) => {
    return moles.find(m => m.id === id);
  }, [moles]);

  const getMolesByRegion = useCallback((region: string) => {
    return moles.filter(m => m.region === region);
  }, [moles]);

  const addPhotoToMole = useCallback(async (
    moleId: string,
    photo: Omit<MolePhoto, "id" | "timestamp" | "moleId">
  ): Promise<string> => {
    if (!userId) throw new Error("User not logged in");

    const result = await uploadPhotoMutation.mutateAsync({
      moleId: Number(moleId),
      dataUrl: photo.dataUrl,
      notes: photo.notes || "",
    });

    const photoId = String(result.id);

    // Save AI analysis to DB if provided
    if (photo.aiAnalysis) {
      try {
        await saveAnalysisMutation.mutateAsync({
          photoId: Number(photoId),
          asymmetryScore: photo.aiAnalysis.asymmetry.score,
          asymmetryCode: photo.aiAnalysis.asymmetry.descriptionCode,
          borderScore: photo.aiAnalysis.border.score,
          borderCode: photo.aiAnalysis.border.descriptionCode,
          colorScore: photo.aiAnalysis.color.score,
          colorCode: photo.aiAnalysis.color.descriptionCode,
          diameterScore: photo.aiAnalysis.diameter.score,
          diameterCode: photo.aiAnalysis.diameter.descriptionCode,
          overallRisk: photo.aiAnalysis.overallRisk,
          recommendationCode: photo.aiAnalysis.recommendationCode,
        });
        // Update mole riskLevel in local state
        setMoles(prev => prev.map(m =>
          m.id === moleId ? { ...m, riskLevel: photo.aiAnalysis!.overallRisk } : m
        ));
      } catch (err) {
        console.warn("Failed to save AI analysis to DB:", err);
      }
    }

    return photoId;
  }, [userId, uploadPhotoMutation, saveAnalysisMutation]);

  const login = useCallback((name: string, id: string) => {
    setIsLoggedIn(true);
    setUserName(name);
    setUserId(id);
    localStorage.setItem("dermiq_logged_in", "true");
    localStorage.setItem("dermiq_user_name", name);
    localStorage.setItem("dermiq_user_id", id);
  }, []);

  const logout = useCallback(() => {
    // ⚠️ SECURITY: Clear all cached tRPC query data FIRST
    // This prevents stale data from one user being shown to the next user
    // who logs in on the same browser session.
    utils.mole.getAll.reset();
    utils.photo.getByMoleId.reset();

    setIsLoggedIn(false);
    setUserName("");
    setUserId(null);
    setMoles([]);
    localStorage.removeItem("dermiq_logged_in");
    localStorage.removeItem("dermiq_user_name");
    localStorage.removeItem("dermiq_user_id");
  }, [utils]);

  // Combine query loading state with manual loading state
  const isLoadingCombined = isLoading || getAllMolesQuery.isLoading;

  return (
    <SkinStoreContext.Provider value={{
      moles,
      isLoading: isLoadingCombined,
      addMole,
      updateMole,
      deleteMole,
      getMole,
      getMolesByRegion,
      addPhotoToMole,
      isLoggedIn,
      userName,
      userId,
      login,
      logout,
      refreshMoles,
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
