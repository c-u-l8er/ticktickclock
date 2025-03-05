<script lang="ts">
    import { db, type Client } from "$lib/db";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { Button } from "flowbite-svelte";

    let client: Client | undefined;
    let clientId: number;

    onMount(async () => {
        clientId = parseInt($page.params.clientId);
        client = await db.clients.get(clientId);
    });
</script>

{#if client}
    <div class="p-4">
        <h2 class="text-xl font-bold mb-4">Client Details</h2>
        <p>Name: {client.name}</p>
        <p>Rate: {client.rate}</p>
        <p>Contact Details: {client.contactDetails}</p>

        <Button href={`/clients/${clientId}/projects`}>Manage Projects</Button>
    </div>
{:else}
    <p>Client not found.</p>
{/if}
