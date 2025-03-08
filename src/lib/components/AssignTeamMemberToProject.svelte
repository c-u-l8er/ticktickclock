<script lang="ts">
    import {
        db,
        type Project,
        type TeamMember,
        type ProjectTeamMember,
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

    export let projectId: number; // Input project ID

    let teamMembers: TeamMember[] = [];
    let assignedTeamMemberIds: number[] = []; // Array of team member IDs assigned to the project
    let unassignedTeamMembers: TeamMember[] = []; // Team members not assigned to the project
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
            unassignedTeamMembers = []; // Clear the array
            return;
        }
        teamMembers = await db.teamMembers
            .where("workspaceId")
            .equals(workspaceId)
            .toArray();
        updateUnassignedTeamMembers();
    }

    async function fetchAssignedTeamMembers() {
        const assigned = await db.projectTeamMembers
            .where("projectId")
            .equals(projectId)
            .toArray();
        assignedTeamMemberIds = assigned.map((item) => item.teamMemberId);
        updateUnassignedTeamMembers();
    }

    $: updateUnassignedTeamMembers(
        teamMembers,
        assignedTeamMemberIds,
        projectId,
    );

    async function updateUnassignedTeamMembers() {
        // Ensure teamMembers and assignedTeamMemberIds have been populated
        if (teamMembers && assignedTeamMemberIds) {
            unassignedTeamMembers = teamMembers.filter(
                (tm) => !assignedTeamMemberIds.includes(tm.id!),
            );
        }
    }

    async function assignTeamMemberToProject() {
        if (selectedTeamMember) {
            try {
                await db.projectTeamMembers.add({
                    projectId: projectId,
                    teamMemberId: selectedTeamMember,
                });
                selectedTeamMember = null; // Reset selection
                await fetchAssignedTeamMembers(); // Refresh list of assigned team members
                updateUnassignedTeamMembers(); //Update the list of unassigned team members.
            } catch (error) {
                console.error("Error assigning team member to project:", error);
                alert(
                    "Failed to assign team member to project. Check the console for details.",
                );
            }
        } else {
            alert("Please select a team member to assign.");
        }
    }

    async function removeTeamMemberFromProject(teamMemberId: number) {
        if (
            confirm(
                "Are you sure you want to remove this team member from the project?",
            )
        ) {
            try {
                // Query to find the ProjectTeamMember entry based on projectId and teamMemberId
                const projectTeamMember = await db.projectTeamMembers
                    .where({ projectId: projectId, teamMemberId: teamMemberId })
                    .first();

                if (projectTeamMember) {
                    await db.projectTeamMembers.delete(
                        projectTeamMember.id as number,
                    );
                    await fetchAssignedTeamMembers(); // Refresh list of assigned team members
                    updateUnassignedTeamMembers(); //Update the list of unassigned team members.
                } else {
                    console.warn(
                        "No entry found for projectId:",
                        projectId,
                        "and teamMemberId:",
                        teamMemberId,
                    );
                    alert("No entry found to delete.");
                }
            } catch (error) {
                console.error(
                    "Error removing team member from project:",
                    error,
                );
                alert(
                    "Failed to remove team member from project. Check the console for details.",
                );
            }
        }
    }

    function getTeamMemberName(teamMemberId: number) {
        const member = teamMembers.find((m) => m.id === teamMemberId);
        return member ? member.name : "Unknown";
    }
</script>

<br />
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
                            size="xs"
                            on:click={() =>
                                removeTeamMemberFromProject(teamMemberId)}
                            >Remove</Button
                        >
                    </TableBodyCell>
                </TableBodyRow>
            {/each}
        </TableBody>
    </Table>
{:else}
    <p>No team members assigned to this project yet.</p>
{/if}
<br />
<h3 class="text-lg font-semibold mb-4">Assign Team Member to Project</h3>

<div class="mb-4">
    <Label for="teamMemberSelect" class="block mb-2">Select Team Member:</Label>
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
    <Button
        on:click={assignTeamMemberToProject}
        class="mt-2"
        disabled={!selectedTeamMember}>Assign Team Member</Button
    >
</div>
