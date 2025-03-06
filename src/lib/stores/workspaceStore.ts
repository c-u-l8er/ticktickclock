import { writable } from "svelte/store";
import type { Workspace } from "$lib/db";

export const selectedWorkspaceId = writable<number | null>(null);
export const workspaces = writable<Workspace[]>([]);
