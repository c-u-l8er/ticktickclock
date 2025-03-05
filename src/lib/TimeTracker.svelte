<script lang="ts">
    import { db, type Client, type TimeEntry, type Project } from "./db";
    import { onMount } from "svelte";
    import {
        Button,
        Label,
        Select,
        Textarea,
        Input,
        Listgroup,
        ListgroupItem,
    } from "flowbite-svelte";

    let clients: Client[] = [];
    let projects: Project[] = []; // Add projects

    let selectedClient: number | null = null;
    let selectedProject: number | null = null; // Add selectedProject

    let startTime: string | null = null;
    let endTime: string | null = null;
    let description: string = "";
    let isTracking: boolean = false;
    let timeEntries: TimeEntry[] = [];

    onMount(async () => {
        clients = await db.clients.toArray();
    });

    $: if (selectedClient) {
        // Reactively update projects
        fetchProjects(selectedClient);
    }

    async function fetchProjects(clientId: number) {
        projects = await db.projects
            .where("clientId")
            .equals(clientId)
            .toArray();
        selectedProject = null; // Reset project selection when client changes
    }

    async function fetchTimeEntries() {
        timeEntries = await db.timeEntries.toArray();
    }

    async function startTracking() {
        if (!selectedClient) {
            alert("Please select a client.");
            return;
        }
        isTracking = true;
        startTime = new Date().toISOString();
    }

    async function stopTracking() {
        isTracking = false;
        endTime = new Date().toISOString();
        if (selectedClient && startTime && endTime) {
            const newEntry: Omit<TimeEntry, "id"> = {
                clientId: selectedClient,
                projectId: selectedProject || undefined, // Use selectedProject, or undefined if null
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                description: description,
            };
            await db.timeEntries.add(newEntry);
            startTime = null;
            endTime = null;
            description = "";
            selectedClient = null;
            selectedProject = null;
            await fetchTimeEntries();
        }
    }

    async function addManualEntry() {
        if (!selectedClient || !startTime || !endTime) {
            alert("Please fill in all fields.");
            return;
        }

        if (selectedClient && startTime && endTime) {
            const newEntry: Omit<TimeEntry, "id"> = {
                clientId: selectedClient,
                projectId: selectedProject || undefined, // Use selectedProject, or undefined if null
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                description: description,
            };

            await db.timeEntries.add(newEntry);
            startTime = null;
            endTime = null;
            description = "";
            selectedClient = null;
            selectedProject = null;
            await fetchTimeEntries();
        }
    }

    function formatDate(date: Date | string) {
        return new Date(date).toLocaleString();
    }
</script>

<div class="p-4">
    <h2 class="text-xl font-bold mb-4">Time Tracking</h2>

    <div class="mb-4">
        <div class="mb-4">
            <Label class="block mb-2">Client:</Label>
            <Select bind:value={selectedClient} class="w-full">
                <option value={null}>Select a client</option>
                {#each clients as client (client.id)}
                    <option value={client.id}>{client.name}</option>
                {/each}
            </Select>
        </div>

        <!-- Project Selection -->
        {#if selectedClient}
            <div class="mb-4">
                <Label class="block mb-2">Project:</Label>
                <Select bind:value={selectedProject} class="w-full">
                    <option value={null}>Select a project (optional)</option>
                    {#each projects as project (project.id)}
                        <option value={project.id}>{project.name}</option>
                    {/each}
                </Select>
            </div>
        {/if}

        <div class="mb-4">
            <Label class="block mb-2">Description:</Label>
            <Textarea bind:value={description} class="w-full" rows="3" />
        </div>

        {#if !isTracking}
            <Button on:click={startTracking} disabled={!selectedClient}
                >Start Tracking</Button
            >
        {:else}
            <Button color="red" on:click={stopTracking}>Stop Tracking</Button>
        {/if}
    </div>

    <div class="mb-4">
        <div class="mb-4">
            <h3 class="text-lg font-semibold mb-2">Manual Entry</h3>
            <Label class="block mb-2">Start Time:</Label>
            <Input
                type="datetime-local"
                bind:value={startTime}
                class="w-full"
            />
        </div>

        <div class="mb-4">
            <Label class="block mb-2">End Time:</Label>
            <Input type="datetime-local" bind:value={endTime} class="w-full" />
        </div>
        <Button
            on:click={addManualEntry}
            disabled={!selectedClient || !startTime || !endTime}
            >Add Manual Entry</Button
        >
    </div>

    <div>
        <h3 class="text-lg font-semibold mb-2">Time Entries</h3>
        {#if timeEntries.length > 0}
            <Listgroup>
                {#each timeEntries as entry (entry.id)}
                    <ListgroupItem>
                        {clients.find((c) => c.id === entry.clientId)?.name}:
                        {#if entry.projectId}
                            {projects.find((p) => p.id === entry.projectId)
                                ?.name}:
                        {:else}
                            No Project:
                        {/if}
                        {formatDate(entry.startTime)} - {formatDate(
                            entry.endTime,
                        )} - {entry.description}
                    </ListgroupItem>
                {/each}
            </Listgroup>
        {:else}
            <p>No time entries yet.</p>
        {/if}
    </div>
</div>
