import { writable } from "svelte/store";
import type { Workspace } from "$lib/db";

export const selectedWorkspaceId = writable<number | null>(null);
export const workspaces = writable<Workspace[]>([]);
export const clerkFrontendApi = writable<any | null>(
  typeof window !== "undefined" ? (window as any).Clerk : null,
); // Modified
export const clerkReady = writable<boolean>(true); // Clerk isReady
