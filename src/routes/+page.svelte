<script lang="ts">
    import ClientManager from "$lib/ClientManager.svelte";
    import TimeTracker from "$lib/TimeTracker.svelte";
    import InvoiceGenerator from "$lib/InvoiceGenerator.svelte";
</script>

<div class="container mx-auto py-8">
    <h1 class="text-2xl font-bold mb-4">TickTickClock</h1>
    <ClientManager />
    <TimeTracker />
    <InvoiceGenerator />
</div>
