<script lang="ts">
    import {
        db,
        type Task,
        type TeamMember,
        type TaskTeamMember,
    } from "$lib/db";
    import { onMount } from "svelte";
    import {
        Button,
        Label,
        Select,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";
    import { selectedWorkspaceId } from "$lib/stores/workspaceStore";
    import { get } from "svelte/store";
    import { goto } from "$app/navigation";

    export let taskId: number; // Input task ID

    let teamMembers: TeamMember[] = [];
    let assignedTeamMemberIds: number[] = []; // Array of team member IDs assigned to the task
    let unassignedTeamMembers: TeamMember[] = []; // Team members not assigned to the task
    let selectedTeamMember: number | null = null;

    onMount(async () => {
        await fetchTeamMembers();
        await fetchAssignedTeamMembers();
        updateUnassignedTeamMembers();
    });

    // Reactive statement to re-run fetchTeamMembers and more when selectedWorkspaceId changes
    $: $selectedWorkspaceId, fetchTeamMembers(), fetchAssignedTeamMembers();

    async function fetchTeamMembers() {
        const workspaceId = get(selectedWorkspaceId);
        if (!workspaceId) {
            teamMembers = [];
            unassignedTeamMembers = [];
            return;
        }
        teamMembers = await db.teamMembers
            .where("workspaceId")
            .equals(workspaceId)
            .toArray();
        updateUnassignedTeamMembers();
    }

    async function fetchAssignedTeamMembers() {
        const assigned = await db.taskTeamMembers
            .where("taskId")
            .equals(taskId)
            .toArray();
        assignedTeamMemberIds = assigned.map((item) => item.teamMemberId);
        updateUnassignedTeamMembers();
    }

    $: updateUnassignedTeamMembers(teamMembers, assignedTeamMemberIds, taskId);

    async function updateUnassignedTeamMembers() {
        // Ensure teamMembers and assignedTeamMemberIds have been populated
        if (teamMembers && assignedTeamMemberIds) {
            unassignedTeamMembers = teamMembers.filter(
                (tm) => !assignedTeamMemberIds.includes(tm.id!),
            );
        }
    }

    async function assignTeamMemberToTask() {
        if (selectedTeamMember) {
            try {
                await db.taskTeamMembers.add({
                    taskId: taskId,
                    teamMemberId: selectedTeamMember,
                });
                selectedTeamMember = null; // Reset selection
                await fetchAssignedTeamMembers(); // Refresh list of assigned team members
                updateUnassignedTeamMembers();
            } catch (error) {
                console.error("Error assigning team member to task:", error);
                alert(
                    "Failed to assign team member to task. Check the console for details.",
                );
            }
        } else {
            alert("Please select a team member to assign.");
        }
    }

    async function removeTeamMemberFromTask(teamMemberId: number) {
        if (
            confirm(
                "Are you sure you want to remove this team member from the task?",
            )
        ) {
            try {
                const taskTeamMember = await db.taskTeamMembers
                    .where({ taskId: taskId, teamMemberId: teamMemberId })
                    .first();

                if (taskTeamMember) {
                    await db.taskTeamMembers.delete(
                        taskTeamMember.id as number,
                    );
                    await fetchAssignedTeamMembers();
                    updateUnassignedTeamMembers();
                } else {
                    console.warn(
                        "No entry found for taskId:",
                        taskId,
                        "and teamMemberId:",
                        teamMemberId,
                    );
                    alert("No entry found to delete.");
                }
            } catch (error) {
                console.error("Error removing team member from task:", error);
                alert(
                    "Failed to remove team member from task. Check the console for details.",
                );
            }
        }
    }

    function getTeamMemberName(teamMemberId: number) {
        const member = teamMembers.find((m) => m.id === teamMemberId);
        return member ? member.name : "Unknown";
    }

    function viewTeamMember(teamMemberId: number) {
        goto(`/team-members/${teamMemberId}/details`);
    }
</script>

<div class="p-4">
    {#if assignedTeamMemberIds.length > 0}
        <Table>
            <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody>
                {#each assignedTeamMemberIds as teamMemberId (teamMemberId)}
                    <TableBodyRow>
                        <TableBodyCell
                            >{getTeamMemberName(teamMemberId)}</TableBodyCell
                        >
                        <TableBodyCell>
                            <Button
                                color="purple"
                                size="xs"
                                on:click={() => viewTeamMember(teamMemberId)}
                                >View</Button
                            >
                            <Button
                                color="red"
                                size="xs"
                                on:click={() =>
                                    removeTeamMemberFromTask(teamMemberId)}
                                >Remove</Button
                            >
                        </TableBodyCell>
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <p>No team members assigned to this task yet.</p>
    {/if}
    <br />

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-2">Assign Team Member to Task</h3>
        <div class="grid gap-4 mb-4">
            <div>
                <Label for="teamMemberSelect" class="block mb-2"
                    >Select Team Member:</Label
                >
                <Select
                    id="teamMemberSelect"
                    bind:value={selectedTeamMember}
                    class="w-full"
                    disabled={unassignedTeamMembers.length === 0}
                >
                    <option value={null}>
                        {#if unassignedTeamMembers.length === 0}
                            No team members available to assign.
                        {:else}
                            Select a team member
                        {/if}
                    </option>
                    {#each unassignedTeamMembers as teamMember (teamMember.id)}
                        <option value={teamMember.id}>{teamMember.name}</option>
                    {/each}
                </Select>
            </div>
        </div>
        <Button
            color="purple"
            on:click={assignTeamMemberToTask}
            class="mt-2"
            disabled={!selectedTeamMember}>Assign Team Member</Button
        >
    </div>
</div>
