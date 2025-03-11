<script lang="ts">
    import { page } from "$app/stores";
    import { db, type TimeEntry, type Client, type Project } from "$lib/db";
    import { onMount } from "svelte";
    import {
        Button,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";

    let timeEntries: TimeEntry[] = [];
    let isLoading = true;
    let error: Error | null = null;
    let project: Project | null = null;
    let client: Client | null = null;

    async function loadData() {
        try {
            isLoading = true;
            error = null;

            const clientId = $page.params.clientId;
            const projectId = $page.params.projectId;

            //Load client and project data from the db
            const [loadedProject, loadedClient, loadedTimeEntries] =
                await Promise.all([
                    db.projects.get(projectId),
                    db.clients.get(clientId),
                    db.timeEntries
                        .where("projectId")
                        .equals(projectId)
                        .toArray(),
                ]);

            if (!loadedClient) throw new Error(`Client not found`);
            if (!loadedProject) throw new Error(`Project not found`);

            client = loadedClient;
            project = loadedProject;
            timeEntries = loadedTimeEntries;
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
    {#if timeEntries.length > 0}
        <Table>
            <TableHead>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Start Time</TableHeadCell>
                <TableHeadCell>End Time</TableHeadCell>
            </TableHead>
            <TableBody>
                {#each timeEntries as entry (entry.id)}
                    <TableBodyRow>
                        <TableBodyCell>{entry.description}</TableBodyCell>
                        <TableBodyCell>
                            {new Date(entry.startTime).toLocaleString()}
                        </TableBodyCell>
                        <TableBodyCell>
                            {new Date(entry.endTime).toLocaleString()}
                        </TableBodyCell>
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <p>No time entries recorded for this project yet.</p>
    {/if}
{/if}
