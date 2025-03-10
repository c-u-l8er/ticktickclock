<script lang="ts">
    import { db, type Workspace } from "$lib/db";
    import { onMount } from "svelte";
    import {
        Button,
        Input,
        Label,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";
    import {
        BuildingSolid,
        TrashBinSolid,
        PenSolid,
        EyeSolid,
    } from "flowbite-svelte-icons";
    import { workspaces } from "$lib/stores/workspaceStore";
    import { goto } from "$app/navigation";

    import { selectedWorkspaceId } from "$lib/stores/workspaceStore";

    let newWorkspace: Omit<Workspace, "id"> = { name: "", rate: 0 };
    let editingWorkspaceId: number | null = null;
    let editingWorkspace: Omit<Workspace, "id"> = { name: "", rate: 0 };

    onMount(async () => {
        await fetchWorkspaces();
    });

    async function fetchWorkspaces() {
        const workspacesList = await db.workspaces.toArray();
        workspaces.set(workspacesList);
    }

    async function addWorkspace() {
        if (!newWorkspace.name.trim()) {
            alert("Please enter a workspace name");
            return;
        }
        try {
            await db.workspaces.add(newWorkspace);
            newWorkspace = { name: "", rate: 0 }; // Clear the form
            await fetchWorkspaces(); // Refresh the workspace list

            // After adding, select the newly created workspace by default
            const allWorkspaces = await db.workspaces.toArray();
            selectedWorkspaceId.set(
                allWorkspaces[allWorkspaces.length - 1].id ?? null,
            );

            console.log("Workspace added successfully");
        } catch (error) {
            console.error("Error adding workspace:", error);
            alert("Failed to add workspace.  Check the console for details.");
        }
    }

    async function deleteWorkspace(id: number) {
        if (confirm("Are you sure you want to delete this workspace?")) {
            await db.workspaces.delete(id);
            await fetchWorkspaces();
        }
    }

    async function saveEdit() {
        if (editingWorkspaceId) {
            if (!editingWorkspace.name.trim()) {
                alert("Please enter a workspace name");
                return;
            }
            await db.workspaces.update(editingWorkspaceId, editingWorkspace);
            editingWorkspaceId = null;
            await fetchWorkspaces();
        }
    }

    async function startEdit(workspace: Workspace) {
        editingWorkspaceId = workspace.id;
        editingWorkspace = { ...workspace };
    }

    async function cancelEdit() {
        editingWorkspaceId = null;
    }

    function viewWorkspace(id: number) {
        // Function to navigate
        goto(`/workspaces/${id}`);
    }

    // New function to handle workspace selection and save to localStorage
    function selectWorkspace(id: number | null) {
        if (id !== null) {
            selectedWorkspaceId.set(id);
            localStorage.setItem("selectedWorkspaceId", String(id));
            console.log(`Workspace selected: ${id}`);
            // Optionally, reload the page to reflect the change immediately
            // window.location.reload();  // consider if reload is necessary
        }
    }
</script>

<div class="p-4">
    <h2 class="text-2xl font-bold mb-4 flex items-center">
        <BuildingSolid class="w-6 h-6 mr-2" />
        Workspace Management
    </h2>

    <!-- Add Workspace Form -->
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 class="text-xl font-semibold mb-4">Add New Workspace</h3>
        <div class="grid gap-4 mb-4">
            <div>
                <Label for="workspaceName">Workspace Name</Label>
                <Input
                    id="workspaceName"
                    type="text"
                    bind:value={newWorkspace.name}
                    placeholder="Enter workspace name"
                />
            </div>
            <div>
                <Label for="workspaceRate">Default Rate ($/hour)</Label>
                <Input
                    id="workspaceRate"
                    type="number"
                    bind:value={newWorkspace.rate}
                    placeholder="Enter default rate"
                />
            </div>
        </div>
        <Button color="purple" on:click={addWorkspace}>Add Workspace</Button>
    </div>

    <!-- Workspaces List -->
    <div>
        <h3 class="text-xl font-semibold mb-4">Your Workspaces</h3>
        {#if $workspaces.length > 0}
            <div class="overflow-x-auto">
                <Table hoverable={true}>
                    <TableHead>
                        <TableHeadCell>Name</TableHeadCell>
                        <TableHeadCell>Default Rate</TableHeadCell>
                        <TableHeadCell>Actions</TableHeadCell>
                    </TableHead>
                    <TableBody>
                        {#each $workspaces as workspace (workspace.id)}
                            <TableBodyRow>
                                {#if editingWorkspaceId === workspace.id}
                                    <TableBodyCell>
                                        <Input
                                            type="text"
                                            bind:value={editingWorkspace.name}
                                        />
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <Input
                                            type="number"
                                            bind:value={editingWorkspace.rate}
                                        />
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <div class="flex gap-2">
                                            <Button
                                                size="sm"
                                                color="green"
                                                on:click={saveEdit}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="alternative"
                                                on:click={cancelEdit}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </TableBodyCell>
                                {:else}
                                    <TableBodyCell
                                        >{workspace.name}</TableBodyCell
                                    >
                                    <TableBodyCell
                                        >${workspace.rate}/hr</TableBodyCell
                                    >
                                    <TableBodyCell>
                                        <div class="flex gap-2">
                                            <Button
                                                color="purple"
                                                size="sm"
                                                on:click={() => {
                                                    selectWorkspace(
                                                        workspace.id,
                                                    );
                                                    viewWorkspace(workspace.id);
                                                }}
                                            >
                                                <EyeSolid class="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="purple"
                                                on:click={() =>
                                                    startEdit(workspace)}
                                            >
                                                <PenSolid class="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="red"
                                                on:click={() =>
                                                    deleteWorkspace(
                                                        workspace.id,
                                                    )}
                                            >
                                                <TrashBinSolid
                                                    class="w-4 h-4"
                                                />
                                            </Button>
                                        </div>
                                    </TableBodyCell>
                                {/if}
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            </div>
        {:else}
            <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p>
                    No workspaces created yet. Create your first workspace
                    above!
                </p>
            </div>
        {/if}
    </div>
</div>
