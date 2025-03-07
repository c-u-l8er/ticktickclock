<script lang="ts">
    import { db, type Client } from "$lib/db";
    import { onMount, onDestroy } from "svelte"; // Import onDestroy
    import {
        Button,
        Label,
        Input,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";
    import { ProfileCardSolid } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";
    import {
        selectedWorkspaceId,
        workspaces,
    } from "$lib/stores/workspaceStore";
    import { get } from "svelte/store";

    let clients: Client[] = [];
    let newClient: Omit<Client, "id"> = {
        workspaceId: get(selectedWorkspaceId) || 0,
        name: "",
        rate: 0,
        contactDetails: "",
    };
    let editingClientId: number | null = null;
    let editingClient: Omit<Client, "id"> = {
        workspaceId: 0,
        name: "",
        rate: 0,
        contactDetails: "",
    };
    let currentWorkspaceRate: number | undefined;

    // Use a subscription to react to selectedWorkspaceId changes
    let unsubscribe: () => void;

    onMount(() => {
        unsubscribe = selectedWorkspaceId.subscribe(() => {
            fetchClientsAndUpdateForm(); // Call the combined function
        });
        fetchClientsAndUpdateForm(); // Initial fetch
    });

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });

    $: {
        const workspaceId = get(selectedWorkspaceId);
        const currentWorkspace = $workspaces.find((w) => w.id === workspaceId);
        currentWorkspaceRate = currentWorkspace?.rate;

        if (workspaceId) {
            newClient.workspaceId = workspaceId;
        }
    }

    // Combined function to fetch clients AND update the form
    async function fetchClientsAndUpdateForm() {
        await fetchClients(); // Fetch the clients (as before)

        const workspaceId = get(selectedWorkspaceId);
        if (workspaceId) {
            const currentWorkspace = $workspaces.find(
                (w) => w.id === workspaceId,
            );
            newClient.rate = currentWorkspace?.rate ?? 0; // Update newClient.rate here
        } else {
            newClient.rate = 0;
        }
    }

    async function fetchClients() {
        const currentWorkspaceId = get(selectedWorkspaceId);
        if (currentWorkspaceId) {
            clients = await db.clients
                .where("workspaceId")
                .equals(currentWorkspaceId)
                .toArray();
        } else {
            clients = [];
        }
    }

    // ... (rest of your ClientManager.svelte code remains the same) ...
    async function addClient() {
        const currentWorkspaceId = get(selectedWorkspaceId);
        if (!currentWorkspaceId) {
            alert("Please select a workspace first.");
            return;
        }

        // No need to manually set workspaceId here; it's already in newClient
        await db.clients.add(newClient); // Use the newClient object directly
        newClient = {
            workspaceId: currentWorkspaceId,
            name: "",
            rate: currentWorkspaceRate ?? 0,
            contactDetails: "",
        }; // Reset, including rate
        await fetchClients();
    }

    async function deleteClient(id: number) {
        if (confirm("Are you sure you want to delete this client?")) {
            await db.clients.delete(id);
            await fetchClients();
        }
    }

    async function startEdit(client: Client) {
        editingClientId = client.id;
        editingClient = { ...client }; // This now correctly copies all fields
    }

    async function cancelEdit() {
        editingClientId = null;
    }

    async function saveEdit() {
        if (editingClientId) {
            await db.clients.update(editingClientId, editingClient);
            editingClientId = null;
            await fetchClients();
        }
    }

    function goToClient(clientId: number) {
        goto(`/clients/${clientId}`);
    }
</script>

<div class="p-4">
    <h2 class="text-2xl font-bold mb-4 flex items-center">
        <ProfileCardSolid class="w-6 h-6 mr-2" />
        Client Management
    </h2>

    <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="grid gap-4 mb-4">
            <div>
                <Label class="block mb-2">Name:</Label>
                <Input type="text" bind:value={newClient.name} class="w-full" />
            </div>

            <div>
                <Label class="block mb-2">Rate:</Label>
                <Input
                    type="number"
                    bind:value={newClient.rate}
                    class="w-full"
                />
            </div>

            <div>
                <Label class="block mb-2">Contact Details:</Label>
                <Input
                    type="text"
                    bind:value={newClient.contactDetails}
                    class="w-full"
                />
            </div>
        </div>
        <Button on:click={addClient} class="mt-2">Add Client</Button>
    </div>

    <br />
    <br />

    <!-- Client List -->
    <h3 class="text-lg font-semibold mb-2">All Clients</h3>
    {#if clients.length > 0}
        <Table>
            <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Rate</TableHeadCell>
                <TableHeadCell>Contact Details</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody>
                {#each clients as client (client.id)}
                    <TableBodyRow>
                        {#if editingClientId === client.id}
                            <TableBodyCell
                                ><Input
                                    type="text"
                                    bind:value={editingClient.name}
                                /></TableBodyCell
                            >
                            <TableBodyCell
                                ><Input
                                    type="number"
                                    bind:value={editingClient.rate}
                                /></TableBodyCell
                            >
                            <TableBodyCell
                                ><Input
                                    type="text"
                                    bind:value={editingClient.contactDetails}
                                /></TableBodyCell
                            >
                            <TableBodyCell>
                                <Button color="green" on:click={saveEdit}
                                    >Save</Button
                                >
                                <Button
                                    color="alternative"
                                    on:click={cancelEdit}>Cancel</Button
                                >
                            </TableBodyCell>
                        {:else}
                            <TableBodyCell>{client.name}</TableBodyCell>
                            <TableBodyCell>${client.rate}</TableBodyCell>
                            <TableBodyCell
                                >{client.contactDetails}</TableBodyCell
                            >
                            <TableBodyCell>
                                <Button on:click={() => goToClient(client.id)}
                                    >View</Button
                                >
                                <Button on:click={() => startEdit(client)}
                                    >Edit</Button
                                >
                                <Button
                                    color="red"
                                    on:click={() => deleteClient(client.id)}
                                    >Delete</Button
                                >
                            </TableBodyCell>
                        {/if}
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <p>No clients yet.</p>
    {/if}
</div>
