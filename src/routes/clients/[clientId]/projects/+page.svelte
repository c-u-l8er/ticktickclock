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
    import { page } from "$app/stores";
    import { get } from "svelte/store";
    import { selectedWorkspaceId } from "$lib/stores/workspaceStore";

    export let data;

    let projects: Project[] = [];
    let newProject: Omit<Project, "id"> = {
        workspaceId: 0, // This will be set before adding
        name: "",
        description: "",
        clientId: 0,
    };
    let editingProjectId: number | null = null;
    let editingProject: Omit<Project, "id" | "clientId"> = {
        name: "",
        description: "",
    };
    let clientId: number;

    onMount(async () => {
        clientId = parseInt($page.params.clientId);
        await fetchProjects();
    });

    async function fetchProjects() {
        const workspaceId = get(selectedWorkspaceId);
        if (!workspaceId) {
            projects = [];
            return;
        }
        projects = await db.projects
            .where("workspaceId")
            .equals(workspaceId)
            .and((item) => item.clientId === parseInt($page.params.clientId))
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
            clientId: parseInt($page.params.clientId),
        };

        await db.projects.add(projectToAdd);
        newProject = {
            workspaceId: workspaceId,
            name: "",
            description: "",
            clientId: parseInt($page.params.clientId),
        };
        await fetchProjects();
    }

    // Update saveEdit to include workspaceId
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

    async function deleteProject(id: number) {
        await db.projects.delete(id);
        await fetchProjects();
    }

    async function startEdit(project: Project) {
        editingProjectId = project.id;
        editingProject = {
            name: project.name,
            description: project.description,
        };
    }

    async function cancelEdit() {
        editingProjectId = null;
    }
</script>

<div class="p-4">
    <h2 class="text-xl font-bold mb-4">
        Project Management for Client ID: {clientId}
    </h2>

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
