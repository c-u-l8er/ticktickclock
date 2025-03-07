<script lang="ts">
    import { db, type TeamMember } from "$lib/db";
    import { onMount } from "svelte";
    import {
        Button,
        Label,
        Input,
        Select,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";
    import { UsersSolid } from "flowbite-svelte-icons";
    import { selectedWorkspaceId } from "$lib/stores/workspaceStore";
    import { get } from "svelte/store";

    let teamMembers: TeamMember[] = [];
    let newTeamMember: Omit<TeamMember, "id"> = {
        workspaceId: 0,
        name: "",
        billableRate: 0,
        costRate: 0,
        role: "team manager", // Default role
    };
    let editingTeamMemberId: number | null = null;
    let editingTeamMember: Omit<TeamMember, "id"> = {
        workspaceId: 0,
        name: "",
        billableRate: 0,
        costRate: 0,
        role: "team manager",
    };

    onMount(async () => {
        await fetchTeamMembers();
    });

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

    async function addTeamMember() {
        const workspaceId = get(selectedWorkspaceId);
        if (!workspaceId) {
            alert("Please select a workspace first.");
            return;
        }

        const teamMemberToAdd = {
            ...newTeamMember,
            workspaceId: workspaceId,
        };

        await db.teamMembers.add(teamMemberToAdd);
        newTeamMember = {
            workspaceId: workspaceId,
            name: "",
            billableRate: 0,
            costRate: 0,
            role: "team manager",
        };
        await fetchTeamMembers();
    }

    async function saveEdit() {
        if (editingTeamMemberId) {
            const workspaceId = get(selectedWorkspaceId);
            if (!workspaceId) {
                alert("Please select a workspace first.");
                return;
            }
            await db.teamMembers.update(editingTeamMemberId, {
                ...editingTeamMember,
                workspaceId: workspaceId,
            });
            editingTeamMemberId = null;
            await fetchTeamMembers();
        }
    }

    async function deleteTeamMember(id: number) {
        await db.teamMembers.delete(id);
        await fetchTeamMembers();
    }

    async function startEdit(teamMember: TeamMember) {
        editingTeamMemberId = teamMember.id;
        editingTeamMember = {
            ...teamMember,
        };
    }

    async function cancelEdit() {
        editingTeamMemberId = null;
    }
</script>

<div class="p-4">
    <h2 class="text-2xl font-bold mb-4 flex items-center">
        <UsersSolid class="w-6 h-6 mr-2" />
        Team Member Management
    </h2>

    <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="grid gap-4 mb-4">
            <div>
                <Label class="block mb-2">Name:</Label>
                <Input
                    type="text"
                    bind:value={newTeamMember.name}
                    class="w-full"
                />
            </div>
            <div>
                <Label class="block mb-2">Billable Rate:</Label>
                <Input
                    type="number"
                    bind:value={newTeamMember.billableRate}
                    class="w-full"
                />
            </div>
            <div>
                <Label class="block mb-2">Cost Rate:</Label>
                <Input
                    type="number"
                    bind:value={newTeamMember.costRate}
                    class="w-full"
                />
            </div>
            <div>
                <Label class="block mb-2">Role:</Label>
                <Select bind:value={newTeamMember.role} class="w-full">
                    <option value="admin">Admin</option>
                    <option value="project manager">Project Manager</option>
                    <option value="team manager">Team Manager</option>
                </Select>
            </div>
        </div>
        <Button on:click={addTeamMember} class="mt-2">Add Team Member</Button>
    </div>

    <br />
    <br />

    <!-- Team Member List -->
    <h3 class="text-lg font-semibold mb-2">All Team Members</h3>
    {#if teamMembers.length > 0}
        <Table>
            <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Billable Rate</TableHeadCell>
                <TableHeadCell>Cost Rate</TableHeadCell>
                <TableHeadCell>Role</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody>
                {#each teamMembers as teamMember (teamMember.id)}
                    <TableBodyRow>
                        {#if editingTeamMemberId === teamMember.id}
                            <TableBodyCell
                                ><Input
                                    type="text"
                                    bind:value={editingTeamMember.name}
                                /></TableBodyCell
                            >
                            <TableBodyCell
                                ><Input
                                    type="number"
                                    bind:value={editingTeamMember.billableRate}
                                /></TableBodyCell
                            >
                            <TableBodyCell
                                ><Input
                                    type="number"
                                    bind:value={editingTeamMember.costRate}
                                /></TableBodyCell
                            >
                            <TableBodyCell>
                                <Select
                                    bind:value={editingTeamMember.role}
                                    class="w-full"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="project manager"
                                        >Project Manager</option
                                    >
                                    <option value="team manager"
                                        >Team Manager</option
                                    >
                                </Select>
                            </TableBodyCell>
                            <TableBodyCell>
                                <Button color="green" on:click={saveEdit}
                                    >Save</Button
                                >
                                <Button
                                    color="alternative"
                                    on:click={cancelEdit}>Cancel</Button
                                >
                            </TableBodyCell>
                        {:else}
                            <TableBodyCell>{teamMember.name}</TableBodyCell>
                            <TableBodyCell
                                >${teamMember.billableRate}</TableBodyCell
                            >
                            <TableBodyCell>${teamMember.costRate}</TableBodyCell
                            >
                            <TableBodyCell>{teamMember.role}</TableBodyCell>
                            <TableBodyCell>
                                <Button on:click={() => startEdit(teamMember)}
                                    >Edit</Button
                                >
                                <Button
                                    color="red"
                                    on:click={() =>
                                        deleteTeamMember(teamMember.id)}
                                    >Delete</Button
                                >
                            </TableBodyCell>
                        {/if}
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <p>No team members yet.</p>
    {/if}
</div>
