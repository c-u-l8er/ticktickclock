<script lang="ts">
    import { PUBLIC_CLERK_PUBLISHABLE_KEY } from "$env/static/public";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { clerkReady } from "$lib/stores/workspaceStore";
    import Header from "$lib/components/Header.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import SuperHeader from "$lib/components/SuperHeader.svelte";
    import "../app.css";

    let mounted = false;

    onMount(async () => {
        if (browser) {
            console.log("🔄 Initializing Clerk...");
            const clerk = window.Clerk;

            if (clerk) {
                try {
                    await clerk.load({
                        // No need to pass publishableKey here since it's already in the script tag
                    });
                    clerkReady.set(true);
                    console.log("✅ Clerk initialization complete");
                } catch (error) {
                    console.error("❌ Clerk initialization error:", error);
                    clerkReady.set(false);
                }
            } else {
                console.error("❌ Clerk not found on window object");
                clerkReady.set(false);
            }
        }
        mounted = true;
    });
</script>

{#if mounted}
    <SuperHeader />
    <div class="mt-7 flex flex-col h-screen">
        <Header />
        <div class="flex flex-1">
            <Sidebar />
            <main class="flex-1 p-4 dark:text-white">
                <slot />
            </main>
        </div>
    </div>
{/if}
