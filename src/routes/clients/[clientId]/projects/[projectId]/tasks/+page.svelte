<script lang="ts">
    import { page } from "$app/stores";
    import { db, type Task, type Client, type Project } from "$lib/db";
    import { onMount } from "svelte";
    import CreateNewTask from "$lib/components/CreateNewTask.svelte";
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Button,
    } from "flowbite-svelte";
    import { goto } from "$app/navigation";

    let tasks: Task[] = [];
    let isLoading = true;
    let error: Error | null = null;
    let project: Project | null = null;
    let client: Client | null = null;
    let clientId: number;
    let projectId: number;

    onMount(() => {
        loadData();
    });

    async function loadData() {
        try {
            isLoading = true;
            error = null;

            clientId = parseInt($page.params.clientId);
            projectId = parseInt($page.params.projectId);

            if (isNaN(clientId) || isNaN(projectId)) {
                throw new Error("Invalid client or project ID");
            }

            const [loadedProject, loadedClient, loadedTasks] =
                await Promise.all([
                    db.projects.get(projectId),
                    db.clients.get(clientId),
                    db.tasks.where("projectId").equals(projectId).toArray(),
                ]);

            if (!loadedClient) throw new Error(`Client not found`);
            if (!loadedProject) throw new Error(`Project not found`);

            client = loadedClient;
            project = loadedProject;
            tasks = loadedTasks;
        } catch (e) {
            console.error("Error loading data:", e);
            error =
                e instanceof Error ? e : new Error("Unknown error occurred");
        } finally {
            isLoading = false;
        }
    }

    // Function to handle task creation
    function handleTaskCreated() {
        loadData(); // Reload the tasks when a new one is created
    }

    function viewTask(taskId: number) {
        goto(`/tasks/${taskId}/details`);
    }
</script>

<br />
{#if isLoading}
    <div class="flex justify-center">
        <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
        ></div>
    </div>
{:else if error}
    <div class="text-red-500">
        <p>Error: {error.message}</p>
        <Button
            color="purple"
            class="mt-2 text-white px-4 py-2 rounded"
            on:click={loadData}
        >
            Retry
        </Button>
    </div>
{:else if client && project}
    {#if tasks.length > 0}
        <Table hoverable={true}>
            <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody>
                {#each tasks as task (task.id)}
                    <TableBodyRow>
                        <TableBodyCell>{task.name}</TableBodyCell>
                        <TableBodyCell
                            >{task.description ||
                                "No description"}</TableBodyCell
                        >
                        <TableBodyCell>
                            <span class="capitalize">{task.status}</span>
                        </TableBodyCell>
                        <TableBodyCell>
                            <Button
                                color="purple"
                                size="xs"
                                on:click={() => viewTask(task.id)}
                            >
                                View
                            </Button>
                        </TableBodyCell>
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <p class="text-gray-500 dark:text-gray-400">
            No tasks added to this project yet.
        </p>
    {/if}
    <br />

    <CreateNewTask
        projectId={project.id}
        clientId={client.id}
        on:taskCreated={handleTaskCreated}
    />
{/if}
