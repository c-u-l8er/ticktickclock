import { writable } from "svelte/store";
import type { Workspace } from "$lib/db";
import { Clerk } from "@clerk/clerk-js";

export const selectedWorkspaceId = writable<number | null>(null);
export const workspaces = writable<Workspace[]>([]);
export const clerkFrontendApi = writable<Clerk | null>(null);
export const clerkReady = writable<boolean>(false);

let clerkInstance: Clerk | null = null;
let initializationPromise: Promise<Clerk | null> | null = null;

export async function initializeClerk(
  publishableKey: string,
): Promise<Clerk | null> {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = new Promise(async (resolve) => {
    try {
      if (clerkInstance?.loaded) {
        clerkReady.set(true);
        resolve(clerkInstance);
        return;
      }

      clerkInstance = new Clerk(publishableKey);
      await clerkInstance.load();

      // Add a small delay to ensure everything is ready
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (clerkInstance.loaded) {
        console.log("✅ Clerk loaded successfully");
        clerkFrontendApi.set(clerkInstance);
        clerkReady.set(true);
        resolve(clerkInstance);
      } else {
        console.error("❌ Clerk failed to load");
        clerkReady.set(false);
        resolve(null);
      }
    } catch (e) {
      console.error("❌ Error initializing Clerk:", e);
      clerkFrontendApi.set(null);
      clerkReady.set(false);
      resolve(null);
    }
  });

  return initializationPromise;
}
