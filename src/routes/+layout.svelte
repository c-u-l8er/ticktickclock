<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import "../app.css";
</script>

<div class="flex flex-col h-screen">
    <Header />

    <div class="flex flex-1">
        <Sidebar />

        <main class="flex-1 p-4 bg-gray-100 dark:bg-gray-900 dark:text-white">
            <slot />
        </main>
    </div>
</div>
