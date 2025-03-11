<script lang="ts">
    import {
        Card,
        Button,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Badge,
        Checkbox,
        Select,
        Label,
    } from "flowbite-svelte";
    import {
        UsersSolid,
        CloudArrowUpOutline,
        PlusOutline,
    } from "flowbite-svelte-icons";

    export let clerkUsers = [];
    export let teamMembers = [];
    export let workspaces = [];
    export let organizations = [];
    export let db;
    export let addSyncLog;
    export let syncState;

    let selectedUserId = null;
    let selectedWorkspaceId = null;
    let syncEnabled = true;

    async function createTeamMemberFromUser() {
        if (!selectedUserId || !selectedWorkspaceId) {
            addSyncLog("Please select both a user and a workspace", "warning");
            return;
        }

        const selectedUser = clerkUsers.find(
            (user) => user.id === selectedUserId,
        );
        const selectedWorkspace = workspaces.find(
            (workspace) => workspace.id === selectedWorkspaceId,
        );

        if (!selectedUser || !selectedWorkspace) return;

        try {
            // Create new team member
            const newTeamMember = {
                workspaceId: selectedWorkspaceId,
                name: selectedUser.fullName,
                billableRate: 0,
                costRate: 0,
                role: "team manager",
            };

            const id = await db.teamMembers.add(newTeamMember);
            addSyncLog(
                `Created team member "${selectedUser.fullName}" in workspace "${selectedWorkspace.name}"`,
                "success",
            );

            // Refresh team members
            teamMembers = await db.teamMembers.toArray();

            // Reset selections
            selectedUserId = null;
        } catch (error) {
            addSyncLog(`Error creating team member: ${error.message}`, "error");
        }
    }

    function getWorkspaceName(workspaceId) {
        const workspace = workspaces.find((w) => w.id === workspaceId);
        return workspace ? workspace.name : "Unknown Workspace";
    }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
    <!-- Users List -->
    <Card padding="xl">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
            <UsersSolid class="w-5 h-5 mr-2" />
            Cloud Users
        </h3>

        {#if clerkUsers.length === 0}
            <div class="bg-gray-50 p-4 rounded-lg text-center">
                <p>No users found</p>
            </div>
        {:else}
            <div class="space-y-4">
                <div class="mb-4">
                    <Label for="selectUserToSync" class="mb-2"
                        >Create Team Member from User</Label
                    >
                    <div class="flex flex-col space-y-2">
                        <Select
                            id="selectUserToSync"
                            bind:value={selectedUserId}
                        >
                            <option value={null}>Select a user</option>
                            {#each clerkUsers as user}
                                <option value={user.id}
                                    >{user.fullName} ({user.email})</option
                                >
                            {/each}
                        </Select>

                        <Select bind:value={selectedWorkspaceId}>
                            <option value={null}>Select workspace</option>
                            {#each workspaces as workspace}
                                <option value={workspace.id}
                                    >{workspace.name}</option
                                >
                            {/each}
                        </Select>

                        <Button
                            color="purple"
                            on:click={createTeamMemberFromUser}
                            disabled={!selectedUserId || !selectedWorkspaceId}
                        >
                            <PlusOutline class="w-4 h-4 mr-1" />
                            Create Team Member
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHead>
                        <TableHeadCell>User</TableHeadCell>
                        <TableHeadCell>Email</TableHeadCell>
                    </TableHead>
                    <TableBody>
                        {#each clerkUsers as user}
                            <TableBodyRow>
                                <TableBodyCell>{user.fullName}</TableBodyCell>
                                <TableBodyCell>{user.email}</TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            </div>
        {/if}
    </Card>

    <!-- Team Members List -->
    <Card padding="xl">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
            <UsersSolid class="w-5 h-5 mr-2" />
            Local Team Members
        </h3>

        {#if teamMembers.length === 0}
            <div class="bg-gray-50 p-4 rounded-lg text-center">
                <p>No team members found</p>
            </div>
        {:else}
            <div class="mb-4">
                <Label class="inline-flex items-center mb-4">
                    <Checkbox bind:checked={syncEnabled} />
                    <span class="ml-2">Include team members in sync</span>
                </Label>
            </div>

            <Table>
                <TableHead>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell>Workspace</TableHeadCell>
                    <TableHeadCell>Role</TableHeadCell>
                </TableHead>
                <TableBody>
                    {#each teamMembers as member}
                        <TableBodyRow>
                            <TableBodyCell>{member.name}</TableBodyCell>
                            <TableBodyCell
                                >{getWorkspaceName(
                                    member.workspaceId,
                                )}</TableBodyCell
                            >
                            <TableBodyCell>{member.role}</TableBodyCell>
                        </TableBodyRow>
                    {/each}
                </TableBody>
            </Table>
        {/if}
    </Card>
</div>
