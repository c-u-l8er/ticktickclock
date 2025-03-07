<script lang="ts">
    import {
        db,
        type Client,
        type TimeEntry,
        type Project,
        type TeamMember,
    } from "./db"; // Import TeamMember
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
    import { Tabs, TabItem } from "flowbite-svelte";
    import {
        BuildingSolid,
        TrashBinSolid,
        PenSolid,
    } from "flowbite-svelte-icons";
    import { selectedWorkspaceId } from "$lib/stores/workspaceStore";
    import { get } from "svelte/store";
    import { tick } from "svelte";

    let clients: Client[] = [];
    let projects: Project[] = [];
    let teamMembers: TeamMember[] = []; // Add teamMembers array

    let selectedClient: number | null = null;
    let selectedProject: number | null = null;
    let selectedTeamMember: number | null = null; // Add selectedTeamMember

    let startTime: string | null = null;
    let endTime: string | null = null;
    let description: string = "";
    let isTracking: boolean = false;
    let timeEntries: TimeEntry[] = [];

    $: {
        tick().then(() => {
            fetchProjects();
            fetchTeamMembers(); // Fetch team members
        });
        fetchTimeEntries();
        fetchClients();
    }

    $: if (selectedClient) {
        fetchProjects();
    }

    async function fetchTeamMembers() {
        const workspaceId = get(selectedWorkspaceId);
        if (!workspaceId) {
            teamMembers = [];
            return;
        }
        teamMembers = await db.teamMembers
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

        try {
            let projectQuery = db.projects
                .where("workspaceId")
                .equals(workspaceId);

            if (selectedClient) {
                projects = await projectQuery
                    .filter((project) => project.clientId === selectedClient)
                    .toArray();
            } else {
                projects = await projectQuery.toArray();
            }

            selectedProject = null;
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    }

    async function fetchTimeEntries() {
        const workspaceId = get(selectedWorkspaceId);
        if (!workspaceId) {
            timeEntries = [];
            return;
        }
        timeEntries = await db.timeEntries
            .where("workspaceId")
            .equals(workspaceId)
            .toArray();
    }

    async function fetchClients() {
        const workspaceId = get(selectedWorkspaceId);
        if (!workspaceId) {
            clients = [];
            return;
        }
        try {
            clients = await db.clients
                .where("workspaceId")
                .equals(workspaceId)
                .toArray();
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    }

    async function startTracking() {
        if (!selectedClient) {
            alert("Please select a client.");
            return;
        }
        // Remove team member check here, it is optional
        isTracking = true;
        startTime = new Date().toISOString();
    }

    async function stopTracking() {
        isTracking = false;
        endTime = new Date().toISOString();
        const workspaceId = get(selectedWorkspaceId);

        if (selectedClient && startTime && endTime && workspaceId) {
            const newEntry: Omit<TimeEntry, "id"> = {
                workspaceId: workspaceId,
                clientId: selectedClient,
                projectId: selectedProject || undefined,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                description: description,
                teamMemberId: selectedTeamMember ?? 1, // Use selected team member, default to 1 if none selected
            };
            await db.timeEntries.add(newEntry);
            startTime = null;
            endTime = null;
            description = "";
            selectedClient = null;
            selectedProject = null;
            selectedTeamMember = null; // Reset selected team member
            await fetchTimeEntries();
        }
    }

    async function addManualEntry() {
        const workspaceId = get(selectedWorkspaceId);
        if (!selectedClient || !startTime || !endTime || !workspaceId) {
            alert("Please fill in all fields.");
            return;
        }

        // No need to check selectedTeamMember here, it can be optional
        if (selectedClient && startTime && endTime) {
            const newEntry: Omit<TimeEntry, "id"> = {
                workspaceId: workspaceId,
                clientId: selectedClient,
                projectId: selectedProject || undefined,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                description: description,
                teamMemberId: selectedTeamMember ?? 1, // Use selected team member, default to 1 if none selected
            };

            await db.timeEntries.add(newEntry);
            startTime = null;
            endTime = null;
            description = "";
            selectedClient = null;
            selectedProject = null;
            selectedTeamMember = null; // Reset selected team member
            await fetchTimeEntries();
        }
    }

    function formatDate(date: Date | string) {
        return new Date(date).toLocaleString();
    }

    function getTeamMemberName(teamMemberId: number) {
        const member = teamMembers.find((m) => m.id === teamMemberId);
        return member ? member.name : "Unknown";
    }
</script>

<div class="p-4">
    <h2 class="text-2xl font-bold mb-4 flex items-center">
        <BuildingSolid class="w-6 h-6 mr-2" />
        Time Tracking Management
    </h2>

    <Tabs tabStyle="pill">
        <TabItem open title="Auto Entry">
            <!-- Add Workspace Form -->
            <div class="p-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="grid gap-4 mb-4">
                    <!-- Team Member Selection -->
                    <div>
                        <Label class="block mb-2">Team Member:</Label>
                        <Select bind:value={selectedTeamMember} class="w-full">
                            <option value={null}
                                >Select a team member (optional)</option
                            >
                            {#each teamMembers as teamMember (teamMember.id)}
                                <option value={teamMember.id}
                                    >{teamMember.name}</option
                                >
                            {/each}
                        </Select>
                    </div>
                    <div>
                        <Label class="block mb-2">Client:</Label>
                        <Select bind:value={selectedClient} class="w-full">
                            <option value={null}>Select a client</option>
                            {#each clients as client (client.id)}
                                <option value={client.id}>{client.name}</option>
                            {/each}
                        </Select>
                    </div>
                    {#if selectedClient}
                        <div>
                            <Label class="block mb-2">Project:</Label>
                            <Select bind:value={selectedProject} class="w-full">
                                <option value={null}
                                    >Select a project (optional)</option
                                >
                                {#each projects as project (project.id)}
                                    <option value={project.id}
                                        >{project.name}</option
                                    >
                                {/each}
                            </Select>
                        </div>
                    {/if}
                    <div>
                        <Label class="block mb-2">Description:</Label>
                        <Textarea
                            bind:value={description}
                            class="w-full"
                            rows="3"
                        />
                    </div>
                </div>
                {#if !isTracking}
                    <Button on:click={startTracking} disabled={!selectedClient}
                        >Start Tracking</Button
                    >
                {:else}
                    <Button color="red" on:click={stopTracking}
                        >Stop Tracking</Button
                    >
                {/if}
            </div>
        </TabItem>
        <TabItem title="Manual Entry">
            <div class="p-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="grid gap-4 mb-4">
                    <div>
                        <Label class="block mb-2">Start Time:</Label>
                        <Input
                            type="datetime-local"
                            bind:value={startTime}
                            class="w-full"
                        />
                    </div>

                    <div>
                        <Label class="block mb-2">End Time:</Label>
                        <Input
                            type="datetime-local"
                            bind:value={endTime}
                            class="w-full"
                        />
                    </div>
                </div>
                <Button
                    on:click={addManualEntry}
                    disabled={!selectedClient || !startTime || !endTime}
                    >Add Manual Entry</Button
                >
            </div>
        </TabItem>
    </Tabs>

    <br />
    <br />
    <div>
        <h3 class="text-xl font-semibold mb-4">Time Entries</h3>
        {#if timeEntries.length > 0}
            <Listgroup>
                {#each timeEntries as entry (entry.id)}
                    <ListgroupItem>
                        {#if entry.projectId}
                            {projects.find((p) => p.id === entry.projectId)
                                ?.name}:
                        {:else}
                            No Project:
                        {/if}
                        {getTeamMemberName(entry.teamMemberId)}:
                        {clients.find((c) => c.id === entry.clientId)?.name}:

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
