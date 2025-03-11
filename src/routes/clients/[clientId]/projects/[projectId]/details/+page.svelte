<script lang="ts">
    import { page } from "$app/stores";
    import { db, type Client, type Project } from "$lib/db";
    import { Button } from "flowbite-svelte";
    import { onMount } from "svelte";

    let client: Client | null = null;
    let project: Project | null = null;
    let isLoading = true;
    let error: Error | null = null;

    async function loadData() {
        try {
            isLoading = true;
            error = null;

            const clientId = $page.params.clientId;
            const projectId = $page.params.projectId;

            const [loadedClient, loadedProject] = await Promise.all([
                db.clients.get(clientId),
                db.projects.get(projectId),
            ]);

            if (!loadedClient) throw new Error(`Client not found`);
            if (!loadedProject) throw new Error(`Project not found`);

            client = loadedClient;
            project = loadedProject;
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
    {:else if project && client}
        <div class="grid gap-4">
            <div>
                <h3 class="text-lg font-semibold mb-2">Project Details</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">
                            Project Name
                        </p>
                        <p class="font-medium">{project.name}</p>
                    </div>
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Rate</p>
                        <p class="font-medium">${project.rate}/hr</p>
                    </div>
                </div>
            </div>

            <div>
                <p class="text-gray-600 dark:text-gray-400">Description</p>
                <p class="font-medium">
                    {project.description || "No description provided"}
                </p>
            </div>

            <div>
                <h3 class="text-lg font-semibold mb-2">Client Information</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">
                            Client Name
                        </p>
                        <p class="font-medium">{client.name}</p>
                    </div>
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">
                            Client Rate
                        </p>
                        <p class="font-medium">${client.rate}/hr</p>
                    </div>
                </div>
            </div>

            <div>
                <p class="text-gray-600 dark:text-gray-400">Contact Details</p>
                <p class="font-medium">
                    {client.contactDetails || "No contact details provided"}
                </p>
            </div>
        </div>
    {/if}
</div>
