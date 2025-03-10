<script lang="ts">
    import { PUBLIC_CLERK_PUBLISHABLE_KEY } from "$env/static/public";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { initializeClerk, clerkReady } from "$lib/stores/workspaceStore";
    import Header from "$lib/components/Header.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import SuperHeader from "$lib/components/SuperHeader.svelte";
    import "../app.css";

    let mounted = false;

    onMount(async () => {
        if (browser) {
            console.log("🔄 Initializing Clerk...");
            const clerk = await initializeClerk(PUBLIC_CLERK_PUBLISHABLE_KEY);
            if (clerk) {
                console.log("✅ Clerk initialization complete");
            } else {
                console.error("❌ Clerk initialization failed");
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
