<script lang="ts">
    import { PUBLIC_CLERK_PUBLISHABLE_KEY } from "$env/static/public";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { clerkReady } from "$lib/stores/workspaceStore";
    import Header from "$lib/components/Header.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import SuperHeader from "$lib/components/SuperHeader.svelte";
    import "../app.css";

    import { db } from "$lib/db";

    let mounted = false;

    onMount(async () => {
        if (browser && db) {
            try {
                // Initialize the database
                await db.waitForReady();

                // Try to sync but handle errors gracefully
                try {
                    await db.safeSync();
                } catch (error) {
                    console.warn(
                        "Initial sync failed, will retry later:",
                        error,
                    );
                }
            } catch (error) {
                console.error("Error initializing Dexie Cloud:", error);
            }
        }
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
        <div style="background: #000; padding: 2em 0 1em;">
            <div style="margin: 0 auto; width: 728px;">
                <iframe
                    src="https://watermark.wrand.cc/advertisements/leaderboard-watermark.html"
                    width="728"
                    height="90"
                    frameborder="0"
                    scrolling="no"
                    style="border:none; overflow:hidden;"
                    title="WaterMark Branding Design Agency Advertisement"
                >
                </iframe>
                <div style="text-align: right; color: #ccc; font-size: 0.75em;">
                    ^ADVERTISEMENT
                </div>
            </div>
        </div>
    </div>
{/if}
