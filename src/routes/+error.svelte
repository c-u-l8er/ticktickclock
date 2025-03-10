<script lang="ts">
    import { page } from "$app/stores";
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="p-8 bg-white rounded shadow-lg">
        <h1 class="text-2xl font-bold mb-4">Error {$page.status}</h1>
        <p class="mb-4">{$page.error?.message}</p>
        {#if $page.status === 503}
            <button
                color="purple"
                class="bg-blue-500 text-white px-4 py-2 rounded"
                on:click={() => window.location.reload()}
            >
                Retry
            </button>
        {/if}
        <a href="/" class="ml-4 text-blue-500 hover:underline"> Go to Home </a>
    </div>
</div>
