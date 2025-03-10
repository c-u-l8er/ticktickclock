<script lang="ts">
    import { db, type Project, type Client } from "$lib/db";
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
        Tabs,
        TabItem,
    } from "flowbite-svelte";
    import { ProfileCardSolid } from "flowbite-svelte-icons";
    import { page } from "$app/stores";
    import { get } from "svelte/store";
    import { selectedWorkspaceId } from "$lib/stores/workspaceStore";
    import { goto } from "$app/navigation";

    export let data;

    let projects: Project[] = [];
    let newProject: Omit<Project, "id"> = {
        workspaceId: 0, // This will be set before adding
        name: "",
        description: "",
        clientId: 0,
        rate: 0,
    };
    let editingProjectId: number | null = null;
    let editingProject: Omit<Project, "id" | "clientId"> = {
        name: "",
        description: "",
        rate: 0,
    };
    let clientId: number;
    let client: Client | null = null;

    onMount(async () => {
        clientId = parseInt($page.params.clientId);
        client = await db.clients.get(clientId);
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
            rate: 0,
        };
        await fetchProjects();
    }

    async function viewProject(project: any) {
        goto(`/clients/${project.clientId}/projects/${project.id}/details`);
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
            rate: project.rate,
        };
    }

    async function cancelEdit() {
        editingProjectId = null;
    }
</script>

<div class="p-4">
    <h2 class="text-2xl font-bold mb-4 flex items-center">
        <ProfileCardSolid class="w-6 h-6 mr-2" />
        <a href="/clients">Client Management</a>
        &nbsp;/ {client?.name}
    </h2>

    <Tabs tabStyle="pill">
        <TabItem
            activeClasses="bg-purple-700 rounded-lg p-3 text-white"
            title="Details"
            on:click={() => goto(`/clients/${clientId}`)}
        ></TabItem>
        <TabItem
            activeClasses="bg-purple-700 rounded-lg p-3 text-white"
            open
            title="Projects"
        >
            <!-- Add Project Form -->
            <div>
                <div class="mb-4">
                    <Label class="block mb-2">Name:</Label>
                    <Input
                        type="text"
                        bind:value={newProject.name}
                        class="w-full"
                    />
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
                    <Label class="block mb-2">Rate:</Label>
                    <Input
                        type="number"
                        bind:value={newProject.rate}
                        class="w-full"
                    />
                </div>

                <Button color="purple" on:click={addProject} class="mt-2"
                    >Add Project</Button
                >
            </div>
        </TabItem>
        <TabItem
            activeClasses="bg-purple-700 rounded-lg p-3 text-white"
            title="Invoices"
            on:click={() => goto(`/clients/${clientId}/invoices`)}
        ></TabItem>
    </Tabs>
    <br />
    <br />

    <!-- Project List -->
    {#if projects.length > 0}
        <h3 class="text-xl font-semibold mb-4">This Client's Projects</h3>
        <Table>
            <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Rate</TableHeadCell>
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
                            <TableBodyCell>
                                <Button
                                    color="purple"
                                    on:click={() => viewProject(project)}
                                    >View</Button
                                >
                                <Button
                                    color="purple"
                                    on:click={() => startEdit(project)}
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
