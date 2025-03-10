<script lang="ts">
    import { db, type Task, type Project, type Client } from "$lib/db";
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
    import { ListOutline } from "flowbite-svelte-icons";
    import { selectedWorkspaceId } from "$lib/stores/workspaceStore";
    import { get } from "svelte/store";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";

    let tasks: Task[] = [];
    let projects: Project[] = [];
    let clients: Client[] = [];
    let newProjectId: number | null = null;
    let newClientId: number | null = null;
    let newTask: Omit<Task, "id"> = {
        workspaceId: get(selectedWorkspaceId) || 0, // ADD THIS LINE
        projectId: newProjectId || 0,
        clientId: newClientId || 0,
        name: "",
        description: "",
        status: "open",
    };
    let editingTaskId: number | null = null;
    let editingTask: Omit<Task, "id"> = {
        workspaceId: get(selectedWorkspaceId) || 0, // ADD THIS LINE
        projectId: 0,
        clientId: 0,
        name: "",
        description: "",
        status: "open",
    };

    let dbReady = false; // NEW: Flag to track DB readiness
    let workspaceIdReady = false; // NEW: Flag to track workspaceId readiness

    onMount(async () => {
        if (browser) {
            dbReady = await db.waitForReady();

            // Subscribe to the store and set the workspaceIdReady flag
            const unsubscribe = selectedWorkspaceId.subscribe((value) => {
                if (value !== null) {
                    workspaceIdReady = true;
                    unsubscribe(); // Unsubscribe after the first valid value
                }
            });

            if (dbReady) {
                // Fetch initial values, but only if workspaceId is already available
                if (get(selectedWorkspaceId) !== null) {
                    await fetchTasks();
                    await fetchProjects();
                    await fetchClients();
                }
            }
        }
    });

    $: if (dbReady && workspaceIdReady) {
        fetchTasks();
        fetchProjects();
        fetchClients();
    }

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

    async function addTask() {
        const workspaceId = get(selectedWorkspaceId);
        if (!workspaceId) {
            alert("Please select a workspace first.");
            return;
        }

        const taskToAdd = {
            ...newTask,
            workspaceId: workspaceId, //ADD THIS LINE
            projectId: newProjectId || 0,
            clientId: newClientId || 0,
        };

        await db.tasks.add(taskToAdd);
        newTask = {
            workspaceId: workspaceId, //ADD THIS LINE
            projectId: newProjectId || 0,
            clientId: newClientId || 0,
            name: "",
            description: "",
            status: "open",
        };
        await fetchTasks();
    }

    // Update fetchTasks to filter by workspace
    async function fetchTasks() {
        const workspaceId = get(selectedWorkspaceId);
        if (!workspaceId) {
            tasks = [];
            return;
        }

        tasks = await db.tasks
            .where("workspaceId")
            .equals(workspaceId)
            .toArray();
    }

    async function deleteTask(id: number) {
        if (confirm("Are you sure you want to delete this task?")) {
            await db.tasks.delete(id);
            await fetchTasks();
        }
    }

    async function startEdit(task: Task) {
        editingTaskId = task.id;
        editingTask = {
            workspaceId: task.workspaceId, //ADD THIS LINE
            projectId: task.projectId,
            clientId: task.clientId,
            name: task.name,
            description: task.description || "",
            status: task.status,
        };
    }

    async function cancelEdit() {
        editingTaskId = null;
    }

    async function saveEdit() {
        const workspaceId = get(selectedWorkspaceId);
        if (editingTaskId && workspaceId) {
            await db.tasks.update(editingTaskId, {
                ...editingTask,
                workspaceId: workspaceId,
            });
            editingTaskId = null;
            await fetchTasks();
        }
    }

    function goToProjectTask(taskId: number) {
        const task = tasks.find((task) => task.id === taskId);
        if (task) {
            const projectId = task.projectId;
            goto(`/tasks/${taskId}/details`);
        }
    }

    function getProjectName(projectId: number): string {
        const project = projects.find((project) => project.id === projectId);
        return project ? project.name : "Unknown Project";
    }

    function getClientName(clientId: number): string {
        const client = clients.find((client) => client.id === clientId);
        return client ? client.name : "Unknown Client";
    }

    // Function to call when either the Client or Project is changed
    async function onDropdownChange() {
        await fetchTasks();
    }
</script>

{#if !dbReady}
    <p>Loading...</p>
{:else}
    <div class="p-4">
        <h2 class="text-2xl font-bold mb-4 flex items-center">
            <ListOutline class="w-6 h-6 mr-2" />
            Task Management
        </h2>

        <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="grid gap-4 mb-4">
                <div>
                    <Label for="taskName" class="block mb-2">Task Name:</Label>
                    <Input
                        type="text"
                        bind:value={newTask.name}
                        class="w-full"
                        id="taskName"
                    />
                </div>

                <div>
                    <Label for="taskClientId" class="block mb-2">Client:</Label>
                    <Select
                        id="taskClientId"
                        bind:value={newClientId}
                        class="w-full"
                        on:change={onDropdownChange}
                    >
                        <option value={null}>Select a Client</option>
                        {#each clients as client (client.id)}
                            <option value={client.id}>{client.name}</option>
                        {/each}
                    </Select>
                </div>

                <div>
                    <Label for="taskProjectId" class="block mb-2"
                        >Project:</Label
                    >
                    <Select
                        id="taskProjectId"
                        bind:value={newProjectId}
                        class="w-full"
                        on:change={onDropdownChange}
                    >
                        <option value={null}>Select a Project</option>
                        {#each projects as project (project.id)}
                            <option value={project.id}>{project.name}</option>
                        {/each}
                    </Select>
                </div>

                <div>
                    <Label for="description" class="block mb-2"
                        >Description:</Label
                    >
                    <Input
                        type="text"
                        bind:value={newTask.description}
                        class="w-full"
                        id="description"
                    />
                </div>

                <div>
                    <Label for="statusSelect" class="block mb-2">Status:</Label>
                    <Select
                        id="statusSelect"
                        bind:value={newTask.status}
                        class="w-full"
                    >
                        <option value="open">Open</option>
                        <option value="in progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                    </Select>
                </div>
            </div>
            <Button color="purple" on:click={addTask} class="mt-2"
                >Add Task</Button
            >
        </div>

        <br />
        <br />

        <!-- Task List -->
        <h3 class="text-lg font-semibold mb-2">All Tasks</h3>
        {#if tasks.length > 0}
            <Table>
                <TableHead>
                    <TableHeadCell>Task Name</TableHeadCell>
                    <TableHeadCell>Project</TableHeadCell>
                    <TableHeadCell>Client</TableHeadCell>
                    <TableHeadCell>Description</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell>
                    <TableHeadCell>Actions</TableHeadCell>
                </TableHead>
                <TableBody>
                    {#each tasks as task (task.id)}
                        <TableBodyRow>
                            {#if editingTaskId === task.id}
                                <TableBodyCell
                                    ><Input
                                        type="text"
                                        bind:value={editingTask.name}
                                    /></TableBodyCell
                                >
                                <TableBodyCell>
                                    <Select
                                        bind:value={editingTask.projectId}
                                        class="w-full"
                                    >
                                        <option value={null}>
                                            Select a Project
                                        </option>
                                        {#each projects as project (project.id)}
                                            <option value={project.id}
                                                >{project.name}</option
                                            >
                                        {/each}
                                    </Select>
                                </TableBodyCell>
                                <TableBodyCell>
                                    <Select
                                        bind:value={editingTask.clientId}
                                        class="w-full"
                                    >
                                        <option value={null}>
                                            Select a Client
                                        </option>
                                        {#each clients as client (client.id)}
                                            <option value={client.id}
                                                >{client.name}</option
                                            >
                                        {/each}
                                    </Select>
                                </TableBodyCell>
                                <TableBodyCell
                                    ><Input
                                        type="text"
                                        bind:value={editingTask.description}
                                    /></TableBodyCell
                                >
                                <TableBodyCell>
                                    <Select
                                        bind:value={editingTask.status}
                                        class="w-full"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in progress"
                                            >In Progress</option
                                        >
                                        <option value="completed"
                                            >Completed</option
                                        >
                                        <option value="blocked">Blocked</option>
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
                                <TableBodyCell>{task.name}</TableBodyCell>
                                <TableBodyCell>
                                    {getProjectName(task.projectId)}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {getClientName(task.clientId)}
                                </TableBodyCell>
                                <TableBodyCell>{task.description}</TableBodyCell
                                >
                                <TableBodyCell>{task.status}</TableBodyCell>
                                <TableBodyCell>
                                    <Button
                                        color="purple"
                                        on:click={() =>
                                            goToProjectTask(task.id)}
                                        >View</Button
                                    >
                                    <Button on:click={() => startEdit(task)}
                                        >Edit</Button
                                    >
                                    <Button
                                        color="red"
                                        on:click={() => deleteTask(task.id)}
                                        >Delete</Button
                                    >
                                </TableBodyCell>
                            {/if}
                        </TableBodyRow>
                    {/each}
                </TableBody>
            </Table>
        {:else}
            <p>No tasks yet.</p>
        {/if}
    </div>
{/if}
