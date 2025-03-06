<script lang="ts">
    import { db, type Client } from "$lib/db";
    import { onMount } from "svelte";
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
    import { goto } from "$app/navigation";
    import { selectedWorkspaceId } from "$lib/stores/workspaceStore";
    import { get } from "svelte/store";

    let clients: Client[] = [];
    let newClient: Omit<Client, "id" | "workspaceId"> = {
        name: "",
        rate: 0,
        contactDetails: "",
    };
    let editingClientId: number | null = null;
    let editingClient: Omit<Client, "id"> = {
        name: "",
        rate: 0,
        contactDetails: "",
    };

    // Reactive statement to fetch clients when selectedWorkspaceId changes
    $: {
        console.log("selectedWorkspaceId changed:", $selectedWorkspaceId); // Debugging
        fetchClients();
    }

    async function fetchClients() {
        const currentWorkspaceId = get(selectedWorkspaceId);
        console.log("Fetching clients for workspace ID:", currentWorkspaceId); // Debugging
        if (currentWorkspaceId) {
            clients = await db.clients
                .where("workspaceId")
                .equals(currentWorkspaceId)
                .toArray();
            console.log("Fetched clients:", clients); // Debugging
        } else {
            clients = [];
            console.log("No workspace selected, clients set to empty array."); // Debugging
        }
    }

    async function addClient() {
        const currentWorkspaceId = get(selectedWorkspaceId);
        if (!currentWorkspaceId) {
            alert("Please select a workspace first.");
            return;
        }
        await db.clients.add({ ...newClient, workspaceId: currentWorkspaceId });
        newClient = { name: "", rate: 0, contactDetails: "" };
        await fetchClients();
    }

    async function deleteClient(id: number) {
        await db.clients.delete(id);
        await fetchClients();
    }

    async function startEdit(client: Client) {
        editingClientId = client.id;
        editingClient = { ...client };
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

    function goToClientProjects(clientId: number) {
        goto(`/clients/${clientId}/`);
    }
</script>

<div class="p-4">
    <h2 class="text-xl font-bold mb-4">Client Management</h2>

    <!-- Add Client Form -->
    <div class="mb-4">
        <div class="mb-4">
            <Label class="block mb-2">Name:</Label>
            <Input type="text" bind:value={newClient.name} class="w-full" />
        </div>

        <div class="mb-4">
            <Label class="block mb-2">Rate:</Label>
            <Input type="number" bind:value={newClient.rate} class="w-full" />
        </div>

        <div class="mb-4">
            <Label class="block mb-2">Contact Details:</Label>
            <Input
                type="text"
                bind:value={newClient.contactDetails}
                class="w-full"
            />
        </div>

        <Button on:click={addClient} class="mt-2">Add Client</Button>
    </div>

    <br />
    <br />

    <!-- Client List -->
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
                                <Button on:click={() => startEdit(client)}
                                    >Edit</Button
                                >
                                <Button
                                    color="red"
                                    on:click={() => deleteClient(client.id)}
                                    >Delete</Button
                                >
                                <Button
                                    on:click={() =>
                                        goToClientProjects(client.id)}
                                    >Projects</Button
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
