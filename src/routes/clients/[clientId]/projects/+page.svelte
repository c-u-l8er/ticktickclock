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

    export let data;

    let projects: Project[] = [];
    let newProject: Omit<Project, "id" | "clientId"> = {
        name: "",
        description: "",
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
        projects = await db.projects
            .where("clientId")
            .equals(clientId)
            .toArray();
    }

    async function addProject() {
        await db.projects.add({ ...newProject, clientId: clientId });
        newProject = { name: "", description: "" };
        await fetchProjects();
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

    async function saveEdit() {
        if (editingProjectId) {
            await db.projects.update(editingProjectId, {
                ...editingProject,
                clientId: clientId,
            });
            editingProjectId = null;
            await fetchProjects();
        }
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
