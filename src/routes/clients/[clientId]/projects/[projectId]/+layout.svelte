<script lang="ts">
    import { page } from "$app/stores";
    import { Tabs, TabItem, Button } from "flowbite-svelte";
    import { BuildingSolid, ArrowRightOutline } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";
    import { db } from "$lib/db";
    import { onMount } from "svelte";
    import type { Project, Client } from "$lib/db";

    let client: Client | null = null;
    let project: Project | null = null;
    let isLoading = true;
    let error: Error | null = null;
    let clientId: number;
    let projectId: number;

    // Set the active tab based on the URL
    $: activeTab = $page.url.pathname.split("/").pop();
    $: clientId = $page.params.clientId;
    $: projectId = $page.params.projectId;

    async function loadData() {
        try {
            isLoading = true;
            error = null;

            clientId = parseInt($page.params.clientId);
            projectId = parseInt($page.params.projectId);

            if (isNaN(clientId) || isNaN(projectId)) {
                throw new Error("Invalid client or project ID");
            }

            // Load client and project data
            const [loadedClient, loadedProject] = await Promise.all([
                db.clients.get(clientId),
                db.projects.get(projectId),
            ]);

            if (!loadedClient) {
                throw new Error(`Client with ID ${clientId} not found`);
            }

            if (!loadedProject) {
                throw new Error(`Project with ID ${projectId} not found`);
            }

            client = loadedClient;
            project = loadedProject;
            console.log("load data", client);
        } catch (e) {
            console.error("Error loading data:", e);
            error =
                e instanceof Error ? e : new Error("Unknown error occurred");
        } finally {
            isLoading = false;
        }
    }

    function handleTabChange(tabName: string) {
        goto(`/clients/${clientId}/projects/${projectId}/${tabName}`);
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
{:else if client && project}
    <div class="p-4">
        <h2 class="text-2xl font-bold mb-4 flex items-center">
            <BuildingSolid class="w-6 h-6 mr-2" />
            <a href="/clients">Client Management</a>
            &nbsp;/&nbsp;<a href="/clients/{clientId}">{client.name}</a>
        </h2>
        <h2 class="text-2xl font-bold mb-4 flex items-center">
            <ArrowRightOutline class="w-6 h-6 mr-2" />
            <a href="/projects">Project Management</a>
            &nbsp;/&nbsp;{project.name}
        </h2>

        <Tabs tabStyle="pill" contentClass="displayNone">
            <TabItem
                open={activeTab === "details" ||
                    $page.url.pathname ===
                        `/clients/${clientId}/projects/${projectId}`}
                title="Details"
                on:click={() => handleTabChange("details")}
            />
            <TabItem
                open={activeTab === "team-members"}
                title="Team Members"
                on:click={() => handleTabChange("team-members")}
            />
            <TabItem
                open={activeTab === "tasks"}
                title="Tasks"
                on:click={() => handleTabChange("tasks")}
            />
            <TabItem
                open={activeTab === "time-entries"}
                title="Time Entries"
                on:click={() => handleTabChange("time-entries")}
            />
            <TabItem
                open={activeTab === "invoices"}
                title="Invoices"
                on:click={() => handleTabChange("invoices")}
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
