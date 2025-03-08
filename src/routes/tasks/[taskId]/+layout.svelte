<script lang="ts">
    import { page } from "$app/stores";
    import { Tabs, TabItem } from "flowbite-svelte";
    import { ListOutline } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";
    import { db } from "$lib/db";
    import { onMount } from "svelte";
    import type { Task } from "$lib/db";

    let task: Task | null = null;
    let isLoading = true;
    let error: Error | null = null;
    let taskId: number;

    // Set the active tab based on the URL
    $: activeTab = $page.url.pathname.split("/").pop();
    $: taskId = $page.params.taskId;

    async function loadData() {
        try {
            isLoading = true;
            error = null;

            taskId = parseInt($page.params.taskId);

            if (isNaN(taskId)) {
                throw new Error("Invalid task ID");
            }

            // Load task data
            const loadedTask = await db.tasks.get(taskId);

            if (!loadedTask) {
                throw new Error(`Task with ID ${taskId} not found`);
            }

            task = loadedTask;
        } catch (e) {
            console.error("Error loading data:", e);
            error =
                e instanceof Error ? e : new Error("Unknown error occurred");
        } finally {
            isLoading = false;
        }
    }

    function handleTabChange(tabName: string) {
        goto(`/tasks/${taskId}/${tabName}`);
    }

    onMount(() => {
        loadData();
    });
</script>

{#if isLoading}
    <div class="p-4 flex justify-center items-center">
        <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
        ></div>
    </div>
{:else if error}
    <div class="p-4 text-red-500">
        <p>Error: {error.message}</p>
        <button
            class="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            on:click={() => loadData()}
        >
            Retry
        </button>
    </div>
{:else if task}
    <div class="p-4">
        <h2 class="text-2xl font-bold mb-4 flex items-center">
            <ListOutline class="w-6 h-6 mr-2" />
            <a href="/tasks">Task Management</a>
            &nbsp;/&nbsp;{task.name}
        </h2>

        <Tabs tabStyle="pill" contentClass="displayNone">
            <TabItem
                open={activeTab === "details" ||
                    $page.url.pathname === `/tasks/${$page.params.taskId}`}
                title="Details"
                on:click={() => handleTabChange("details")}
            />
            <TabItem
                open={activeTab === "project"}
                title="Project"
                on:click={() =>
                    goto(
                        `/clients/${task.clientId}/projects/${task.projectId}/details`,
                    )}
            />
            <TabItem
                open={activeTab === "team-members"}
                title="Team Members"
                on:click={() => handleTabChange("team-members")}
            />
            <TabItem
                open={activeTab === "time-entries"}
                title="Time Entries"
                on:click={() => handleTabChange("time-entries")}
            />
        </Tabs>

        <slot />
    </div>
{:else}
    <div class="p-4 text-red-500">
        <p>No data available</p>
        <button
            class="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            on:click={() => loadData()}
        >
            Retry
        </button>
    </div>
{/if}

<style>
    :gloabl(.displayNone) {
        display: none;
    }
</style>
