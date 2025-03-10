<script lang="ts">
    import {
        db,
        type Client,
        type TimeEntry,
        type Project,
        type TeamMember,
        type Task, // Import Task type
    } from "./db";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";

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
    let teamMembers: TeamMember[] = [];
    let tasks: Task[] = []; // Add tasks array

    let selectedClient: number | null = null;
    let selectedProject: number | null = null;
    let selectedTask: number | null = null; // Add selectedTask
    let selectedTeamMember: number | null = null;

    let startTime: string | null = null;
    let endTime: string | null = null;
    let description: string = "";
    let isTracking: boolean = false;
    let timeEntries: TimeEntry[] = [];

    let dbReady = false;
    let workspaceIdReady = false; // NEW: Flag to indicate workspaceId readiness

    // Function to fetch all necessary data
    async function fetchData() {
        if (dbReady && workspaceIdReady) {
            await fetchClients();
            await fetchProjects();
            await fetchTeamMembers();
            await fetchTimeEntries();
        }
    }

    onMount(async () => {
        if (browser) {
            dbReady = await db.waitForReady();

            // Subscribe to the store and set the workspaceIdReady flag
            const unsubscribe = selectedWorkspaceId.subscribe((value) => {
                if (value !== null) {
                    workspaceIdReady = true;
                    fetchData(); // Call fetchData when workspace changes
                } else {
                    workspaceIdReady = false;
                }
            });

            if (dbReady && get(selectedWorkspaceId) !== null) {
                // Fetch initial data after DB is ready and workspace is selected
                fetchData();
            }
        }
    });

    // Reactive statement to re-run fetchTasks and more when BOTH dbReady and workspaceIdReady are true
    $: if (selectedProject) {
        fetchTasksForProject(); // Fetch tasks whenever selectedProject changes
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

    async function fetchTasksForProject() {
        if (!selectedProject) {
            tasks = [];
            return;
        }

        tasks = await db.tasks
            .where("projectId")
            .equals(selectedProject)
            .toArray();
        selectedTask = null; // Reset selected task when project changes
    }

    async function fetchTimeEntries() {
        const workspaceId = get(selectedWorkspaceId);
        if (!workspaceId) {
            console.warn(
                "No workspace ID selected. Cannot fetch time entries.",
            );
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
                taskId: selectedTask || undefined, // Include the selected task
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                description: description,
                teamMemberId: selectedTeamMember ?? 1,
            };
            await db.timeEntries.add(newEntry);
            startTime = null;
            endTime = null;
            description = "";
            selectedClient = null;
            selectedProject = null;
            selectedTask = null; // Reset selected task
            selectedTeamMember = null;
            await fetchTimeEntries();
        }
    }

    async function addManualEntry() {
        const workspaceId = get(selectedWorkspaceId);
        if (!selectedClient || !startTime || !endTime || !workspaceId) {
            alert("Please fill in all fields.");
            return;
        }

        if (selectedClient && startTime && endTime) {
            const newEntry: Omit<TimeEntry, "id"> = {
                workspaceId: workspaceId,
                clientId: selectedClient,
                projectId: selectedProject || undefined,
                taskId: selectedTask || undefined, // Include the selected task
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                description: description,
                teamMemberId: selectedTeamMember ?? 1,
            };

            await db.timeEntries.add(newEntry);
            startTime = null;
            endTime = null;
            description = "";
            selectedClient = null;
            selectedProject = null;
            selectedTask = null; // Reset selected task
            selectedTeamMember = null;
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

    function getTaskName(taskId: number) {
        const task = tasks.find((t) => t.id === taskId);
        return task ? task.name : "Unknown Task";
    }
</script>

{#if !dbReady}
    <p>Loading...</p>
{:else}
    <div class="p-4">
        <h2 class="text-2xl font-bold mb-4 flex items-center">
            <BuildingSolid class="w-6 h-6 mr-2" />
            Time Tracking Management
        </h2>

        <Tabs tabStyle="pill" color="purple">
            <TabItem open title="Auto Entry">
                <div class="p-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div class="grid gap-4 mb-4">
                        <div>
                            <Label class="block mb-2">Team Member:</Label>
                            <Select
                                bind:value={selectedTeamMember}
                                class="w-full"
                            >
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
                                    <option value={client.id}
                                        >{client.name}</option
                                    >
                                {/each}
                            </Select>
                        </div>
                        {#if selectedClient}
                            <div>
                                <Label class="block mb-2">Project:</Label>
                                <Select
                                    bind:value={selectedProject}
                                    class="w-full"
                                    on:change={fetchTasksForProject}
                                >
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

                        {#if selectedProject}
                            <div>
                                <Label class="block mb-2">Task:</Label>
                                <Select
                                    bind:value={selectedTask}
                                    class="w-full"
                                >
                                    <option value={null}
                                        >Select a task (optional)</option
                                    >
                                    {#each tasks as task (task.id)}
                                        <option value={task.id}
                                            >{task.name}</option
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
                        <Button
                            color="purple"
                            on:click={startTracking}
                            disabled={!selectedClient}>Start Tracking</Button
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
                        color="purple"
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
                            {#if entry.taskId}
                                {getTaskName(entry.taskId)}:
                            {:else}
                                No Task:
                            {/if}
                            {getTeamMemberName(entry.teamMemberId)}:
                            {clients.find((c) => c.id === entry.clientId)
                                ?.name}:

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
{/if}
