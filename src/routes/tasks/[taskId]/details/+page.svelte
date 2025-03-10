<script lang="ts">
    import { page } from "$app/stores";
    import { db, type Task, type Project } from "$lib/db";
    import { Button } from "flowbite-svelte";
    import { onMount } from "svelte";

    let task: Task | null = null;
    let project: Project | null = null;
    let isLoading = true;
    let error: Error | null = null;

    async function loadData() {
        try {
            isLoading = true;
            error = null;

            const taskId = parseInt($page.params.taskId);

            if (isNaN(taskId)) {
                throw new Error("Invalid task ID");
            }

            task = await db.tasks.get(taskId);

            if (!task) throw new Error(`Task not found`);

            if (task.projectId) {
                project = await db.projects.get(task.projectId);
            }
        } catch (e) {
            console.error("Error loading data:", e);
            error =
                e instanceof Error ? e : new Error("Unknown error occurred");
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        loadData();
    });
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-4">
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
    {:else if task}
        <div class="grid gap-4">
            <div>
                <h3 class="text-lg font-semibold mb-2">Task Details</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Name</p>
                        <p class="font-medium">{task.name}</p>
                    </div>
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Status</p>
                        <p class="font-medium">{task.status}</p>
                    </div>
                </div>
            </div>

            <div>
                <p class="text-gray-600 dark:text-gray-400">Description</p>
                <p class="font-medium">
                    {task.description || "No description provided"}
                </p>
            </div>

            {#if project}
                <div>
                    <h3 class="text-lg font-semibold mb-2">
                        Project Information
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-gray-600 dark:text-gray-400">
                                Project Name
                            </p>
                            <p class="font-medium">{project.name}</p>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {:else}
        Task not found.
    {/if}
</div>
