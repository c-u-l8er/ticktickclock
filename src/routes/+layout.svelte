<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import "../app.css";

    // Ensure client-side only rendering
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import SuperHeader from "$lib/components/SuperHeader.svelte";

    let mounted = false;

    onMount(() => {
        mounted = true;
    });
</script>

{#if mounted}
    <SuperHeader />
    <div class="mt-8 flex flex-col h-screen">
        <Header />

        <div class="flex flex-1">
            <Sidebar />

            <main class="flex-1 p-4 dark:text-white">
                <slot />
            </main>
        </div>
    </div>
{/if}
