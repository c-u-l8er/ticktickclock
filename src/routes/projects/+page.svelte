<script lang="ts">
    import { db, type Project, type Client } from "$lib/db";
    import { onMount } from "svelte";
    import {
        Button,
        Label,
        Input,
        Select,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";
    import { ArrowRightOutline } from "flowbite-svelte-icons";
    import { get } from "svelte/store";
    import { selectedWorkspaceId } from "$lib/stores/workspaceStore";
    import { goto } from "$app/navigation";

    let projects: Project[] = [];
    let clients: Client[] = [];
    let newProject: Omit<Project, "id"> = {
        workspaceId: 0, // This will be set before adding
        name: "",
        description: "",
        clientId: 0,
        rate: 0, // Add Rate
    };
    let editingProjectId: number | null = null;
    let editingProject: Omit<Project, "id" | "workspaceId"> = {
        // Omit workspaceId here
        name: "",
        description: "",
        clientId: 0,
        rate: 0, // Add Rate
    };

    onMount(async () => {
        await fetchProjects();
        await fetchClients();
    });

    async function fetchClients() {
        const workspaceId = get(selectedWorkspaceId);
        if (!workspaceId) {
            clients = [];
            return;
        }
        clients = await db.clients
            .where("workspaceId")
            .equals(workspaceId)
            .toArray();
    }

    async function addProject() {
        const workspaceId = get(selectedWorkspaceId);
        if (!workspaceId) {
            alert("Please select a workspace first.");
            return;
        }

        const projectToAdd = {
            ...newProject,
            workspaceId: workspaceId,
        };

        await db.projects.add(projectToAdd);
        newProject = {
            workspaceId: workspaceId,
            name: "",
            description: "",
            clientId: 0,
            rate: 0,
        };
        await fetchProjects();
    }

    // Update fetchProjects to filter by workspace
    async function fetchProjects() {
        const workspaceId = get(selectedWorkspaceId);
        if (!workspaceId) {
            projects = [];
            return;
        }
        projects = await db.projects
            .where("workspaceId")
            .equals(workspaceId)
            .toArray();
    }

    async function deleteProject(id: number) {
        if (confirm("Are you sure you want to delete this project?")) {
            await db.projects.delete(id);
            await fetchProjects();
        }
    }

    async function startEdit(project: Project) {
        editingProjectId = project.id;
        editingProject = {
            name: project.name,
            description: project.description,
            clientId: project.clientId,
            rate: project.rate, // Include Rate
        };
    }

    async function cancelEdit() {
        editingProjectId = null;
    }

    async function saveEdit() {
        if (editingProjectId) {
            const workspaceId = get(selectedWorkspaceId);
            if (!workspaceId) {
                alert("Please select a workspace first.");
                return;
            }
            await db.projects.update(editingProjectId, {
                ...editingProject,
                workspaceId: workspaceId,
            });
            editingProjectId = null;
            await fetchProjects();
        }
    }

    function goToClientProject(clientId: number, projectId: number) {
        goto(`/clients/${clientId}/projects/${projectId}/details`);
    }

    function getClientName(clientId: number): string {
        const client = clients.find((client) => client.id === clientId);
        return client ? client.name : "Unknown Client";
    }
</script>

<div class="p-4">
    <h2 class="text-2xl font-bold mb-4 flex items-center">
        <ArrowRightOutline class="w-6 h-6 mr-2" />
        Project Management
    </h2>

    <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="grid gap-4 mb-4">
            <div>
                <Label class="block mb-2">Name:</Label>
                <Input
                    type="text"
                    bind:value={newProject.name}
                    class="w-full"
                />
            </div>

            <div>
                <Label class="block mb-2">Description:</Label>
                <Input
                    type="text"
                    bind:value={newProject.description}
                    class="w-full"
                />
            </div>
            <div>
                <Label class="block mb-2">Rate:</Label>
                <Input
                    type="number"
                    bind:value={newProject.rate}
                    class="w-full"
                />
            </div>

            <div>
                <Label for="clientSelect" class="block mb-2">Client:</Label>
                <Select
                    id="clientSelect"
                    bind:value={newProject.clientId}
                    class="w-full"
                >
                    <option value={0}>Select a client</option>
                    {#each clients as client (client.id)}
                        <option value={client.id}>{client.name}</option>
                    {/each}
                </Select>
            </div>
        </div>
        <Button on:click={addProject} class="mt-2">Add Project</Button>
    </div>

    <br />
    <br />

    <!-- Project List -->
    <h3 class="text-lg font-semibold mb-2">All Client's Projects</h3>
    {#if projects.length > 0}
        <Table>
            <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Rate</TableHeadCell>
                <TableHeadCell>Client</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody>
                {#each projects as project (project.id)}
                    <TableBodyRow>
                        {#if editingProjectId === project.id}
                            <TableBodyCell
                                ><Input
                                    type="text"
                                    bind:value={editingProject.name}
                                /></TableBodyCell
                            >
                            <TableBodyCell
                                ><Input
                                    type="text"
                                    bind:value={editingProject.description}
                                /></TableBodyCell
                            >
                            <TableBodyCell
                                ><Input
                                    type="number"
                                    bind:value={editingProject.rate}
                                /></TableBodyCell
                            >
                            <TableBodyCell>
                                <Select
                                    bind:value={editingProject.clientId}
                                    class="w-full"
                                >
                                    {#each clients as client (client.id)}
                                        <option value={client.id}
                                            >{client.name}</option
                                        >
                                    {/each}
                                </Select>
                            </TableBodyCell>
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
                            <TableBodyCell>{project.name}</TableBodyCell>
                            <TableBodyCell>{project.description}</TableBodyCell>
                            <TableBodyCell>{project.rate}</TableBodyCell>
                            <TableBodyCell
                                >{getClientName(
                                    project.clientId,
                                )}</TableBodyCell
                            >
                            <TableBodyCell>
                                <Button
                                    on:click={() =>
                                        goToClientProject(
                                            project.clientId,
                                            project.id,
                                        )}>View</Button
                                >
                                <Button on:click={() => startEdit(project)}
                                    >Edit</Button
                                >
                                <Button
                                    color="red"
                                    on:click={() => deleteProject(project.id)}
                                    >Delete</Button
                                >
                            </TableBodyCell>
                        {/if}
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <p>No projects yet.</p>
    {/if}
</div>
