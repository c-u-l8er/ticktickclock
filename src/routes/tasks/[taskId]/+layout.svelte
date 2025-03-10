<script lang="ts">
    import { page } from "$app/stores";
    import { Tabs, TabItem, Button } from "flowbite-svelte";
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
        <Button
            color="purple"
            class="mt-2 text-white px-4 py-2 rounded"
            on:click={() => loadData()}
        >
            Retry
        </Button>
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
                activeClasses="bg-purple-700 rounded-lg p-3 text-white"
                open={activeTab === "details" ||
                    $page.url.pathname === `/tasks/${$page.params.taskId}`}
                title="Details"
                on:click={() => handleTabChange("details")}
            />
            <TabItem
                activeClasses="bg-purple-700 rounded-lg p-3 text-white"
                open={activeTab === "project"}
                title="Project"
                on:click={() =>
                    goto(
                        `/clients/${task.clientId}/projects/${task.projectId}/details`,
                    )}
            />
            <TabItem
                activeClasses="bg-purple-700 rounded-lg p-3 text-white"
                open={activeTab === "team-members"}
                title="Team Members"
                on:click={() => handleTabChange("team-members")}
            />
            <TabItem
                activeClasses="bg-purple-700 rounded-lg p-3 text-white"
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
        <Button
            color="purple"
            class="mt-2 text-white px-4 py-2 rounded"
            on:click={() => loadData()}
        >
            Retry
        </Button>
    </div>
{/if}

<style>
    :gloabl(.displayNone) {
        display: none;
    }
</style>
