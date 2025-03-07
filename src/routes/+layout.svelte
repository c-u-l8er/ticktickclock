<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import "../app.css";

    // Ensure client-side only rendering
    import { browser } from "$app/environment";
    import { onMount } from "svelte";

    let mounted = false;

    onMount(() => {
        mounted = true;
    });
</script>

{#if mounted}
    <div class="flex flex-col h-screen">
        <Header />

        <div class="flex flex-1">
            <Sidebar />

            <main class="flex-1 p-4 dark:text-white">
                <slot />
            </main>
        </div>
    </div>
{/if}
