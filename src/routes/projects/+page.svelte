<script lang="ts">
    import { db, type Project } from "$lib/db";
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
    import { get } from "svelte/store";
    import { selectedWorkspaceId } from "$lib/stores/workspaceStore";

    let projects: Project[] = [];
    let newProject: Omit<Project, "id"> = {
        workspaceId: 0, // This will be set before adding
        name: "",
        description: "",
        clientId: 0,
    };
    let editingProjectId: number | null = null;
    let editingProject: Omit<Project, "id" | "workspaceId"> = {
        // Omit workspaceId here
        name: "",
        description: "",
        clientId: 0,
    };

    onMount(async () => {
        await fetchProjects();
    });

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
        await db.projects.delete(id);
        await fetchProjects();
    }

    async function startEdit(project: Project) {
        editingProjectId = project.id;
        editingProject = {
            name: project.name,
            description: project.description,
            clientId: project.clientId,
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
</script>

<div class="p-4">
    <h2 class="text-xl font-bold mb-4">Project Management</h2>

    <!-- Add Project Form -->
    <div class="mb-4">
        <div class="mb-4">
            <Label class="block mb-2">Name:</Label>
            <Input type="text" bind:value={newProject.name} class="w-full" />
        </div>

        <div class="mb-4">
            <Label class="block mb-2">Description:</Label>
            <Input
                type="text"
                bind:value={newProject.description}
                class="w-full"
            />
        </div>

        <div class="mb-4">
            <Label class="block mb-2">Client ID:</Label>
            <Input
                type="number"
                bind:value={newProject.clientId}
                class="w-full"
            />
        </div>

        <Button on:click={addProject} class="mt-2">Add Project</Button>
    </div>

    <br />
    <br />

    <!-- Project List -->
    {#if projects.length > 0}
        <Table>
            <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Client ID</TableHeadCell>
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
                                    bind:value={editingProject.clientId}
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
                            <TableBodyCell>{project.name}</TableBodyCell>
                            <TableBodyCell>{project.description}</TableBodyCell>
                            <TableBodyCell>{project.clientId}</TableBodyCell>
                            <TableBodyCell>
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
