"use client";

import { useEffect, useRef } from "react";
import { getTaskStoreSnapshot, type TaskStoreSnapshot, useTaskStore } from "@/store/task-store";

interface AppStateResponse {
  configured: boolean;
  data?: TaskStoreSnapshot | null;
}

interface DbSyncProviderProps {
  children: React.ReactNode;
}

async function saveSnapshot(snapshot: TaskStoreSnapshot) {
  await fetch("/api/app-state", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(snapshot),
  });
}

export function DbSyncProvider({ children }: DbSyncProviderProps) {
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    let isReady = false;
    let isSyncEnabled = false;
    let isApplyingRemoteSnapshot = false;

    async function bootstrapSync() {
      try {
        const response = await fetch("/api/app-state", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json()) as AppStateResponse;

        if (!isMounted || !payload.configured) {
          isReady = true;
          return;
        }

        isSyncEnabled = true;

        if (payload.data) {
          isApplyingRemoteSnapshot = true;
          useTaskStore.getState().hydrateFromSnapshot(payload.data);
          isApplyingRemoteSnapshot = false;
        } else {
          await saveSnapshot(getTaskStoreSnapshot(useTaskStore.getState()));
        }

        isReady = true;
      } catch {
        isReady = true;
      }
    }

    const unsubscribe = useTaskStore.subscribe((state) => {
      if (!isReady || !isSyncEnabled || isApplyingRemoteSnapshot) return;

      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = window.setTimeout(() => {
        void saveSnapshot(getTaskStoreSnapshot(state));
      }, 700);
    });

    void bootstrapSync();

    return () => {
      isMounted = false;
      unsubscribe();

      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return children;
}
