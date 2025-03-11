<script lang="ts">
    import {
        Card,
        Button,
        Select,
        Label,
        Accordion,
        AccordionItem,
    } from "flowbite-svelte";
    import { writable } from "svelte/store";

    export let organizations = [];
    export let workspaces = [];
    export let teamMembers = [];
    export let clerkUsers = [];
    export let db;
    export let addSyncLog;
    export let syncState;

    // For workspace mapping
    let selectedWorkspaceId = null;
    let selectedOrgId = null;
    let workspaceMapping = new Map();

    // For team member mapping
    let selectedTeamMemberId = null;
    let selectedUserId = null;
    let teamMemberMapping = new Map();

    async function mapWorkspaceToOrg() {
        if (!selectedWorkspaceId || !selectedOrgId) {
            addSyncLog(
                "Please select both a workspace and an organization",
                "warning",
            );
            return;
        }

        try {
            // Update workspace with organization ID
            await db.workspaces.update(selectedWorkspaceId, {
                clerkOrganizationId: selectedOrgId,
            });

            // Store the mapping for UI
            workspaceMapping.set(selectedWorkspaceId, selectedOrgId);
            workspaceMapping = new Map(workspaceMapping); // Force reactivity

            // Log success
            const workspace = workspaces.find(
                (w) => w.id === selectedWorkspaceId,
            );
            const org = organizations.find((o) => o.id === selectedOrgId);
            addSyncLog(
                `Mapped workspace "${workspace?.name}" to organization "${org?.name}"`,
                "success",
            );

            // Reset selections
            selectedWorkspaceId = null;
            selectedOrgId = null;

            // Refresh workspaces list
            const updatedWorkspaces = await db.workspaces.toArray();
            workspaces = updatedWorkspaces;
        } catch (error) {
            addSyncLog(`Error mapping workspace: ${error.message}`, "error");
        }
    }

    function mapTeamMemberToUser() {
        if (!selectedTeamMemberId || !selectedUserId) {
            addSyncLog(
                "Please select both a team member and a user",
                "warning",
            );
            return;
        }

        // In a real app, you would store this mapping in the DB
        // For this demo, we'll just store it in memory
        teamMemberMapping.set(selectedTeamMemberId, selectedUserId);
        teamMemberMapping = new Map(teamMemberMapping); // Force reactivity

        // Log success
        const member = teamMembers.find((m) => m.id === selectedTeamMemberId);
        const user = clerkUsers.find((u) => u.id === selectedUserId);
        addSyncLog(
            `Mapped team member "${member?.name}" to user "${user?.fullName}"`,
            "success",
        );

        // Reset selections
        selectedTeamMemberId = null;
        selectedUserId = null;
    }

    function getWorkspaceName(workspaceId) {
        const workspace = workspaces.find((w) => w.id === workspaceId);
        return workspace ? workspace.name : "Unknown";
    }

    function getOrgName(orgId) {
        const org = organizations.find((o) => o.id === orgId);
        return org ? org.name : "Unknown";
    }

    function getUserName(userId) {
        const user = clerkUsers.find((u) => u.id === userId);
        return user ? user.fullName : "Unknown";
    }
</script>

<div class="mt-4">
    <Card padding="xl">
        <h3 class="text-lg font-semibold mb-4">Manual Mapping Tools</h3>

        <Accordion>
            <AccordionItem>
                <span slot="header" class="font-semibold"
                    >Map Workspaces to Organizations</span
                >
                <div class="space-y-4 p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label for="selectWorkspace" class="mb-2"
                                >Local Workspace</Label
                            >
                            <Select
                                id="selectWorkspace"
                                bind:value={selectedWorkspaceId}
                            >
                                <option value={null}>Select workspace</option>
                                {#each workspaces as workspace}
                                    <option value={workspace.id}
                                        >{workspace.name}</option
                                    >
                                {/each}
                            </Select>
                        </div>

                        <div>
                            <Label for="selectOrg" class="mb-2"
                                >Clerk Organization</Label
                            >
                            <Select id="selectOrg" bind:value={selectedOrgId}>
                                <option value={null}>Select organization</option
                                >
                                {#each organizations as org}
                                    <option value={org.id}>{org.name}</option>
                                {/each}
                            </Select>
                        </div>
                    </div>

                    <Button
                        color="purple"
                        on:click={mapWorkspaceToOrg}
                        disabled={!selectedWorkspaceId || !selectedOrgId}
                    >
                        Map Workspace to Organization
                    </Button>

                    {#if workspaceMapping.size > 0}
                        <div class="mt-4">
                            <h4 class="font-medium mb-2">Current Mappings</h4>
                            <ul class="space-y-2">
                                {#each Array.from(workspaceMapping.entries()) as [workspaceId, orgId]}
                                    <li class="text-sm bg-gray-50 p-2 rounded">
                                        "{getWorkspaceName(workspaceId)}" → "{getOrgName(
                                            orgId,
                                        )}"
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                </div>
            </AccordionItem>

            <AccordionItem>
                <span slot="header" class="font-semibold"
                    >Map Team Members to Users</span
                >
                <div class="space-y-4 p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label for="selectTeamMember" class="mb-2"
                                >Local Team Member</Label
                            >
                            <Select
                                id="selectTeamMember"
                                bind:value={selectedTeamMemberId}
                            >
                                <option value={null}>Select team member</option>
                                {#each teamMembers as member}
                                    <option value={member.id}
                                        >{member.name} ({getWorkspaceName(
                                            member.workspaceId,
                                        )})</option
                                    >
                                {/each}
                            </Select>
                        </div>

                        <div>
                            <Label for="selectUser" class="mb-2"
                                >Clerk User</Label
                            >
                            <Select id="selectUser" bind:value={selectedUserId}>
                                <option value={null}>Select user</option>
                                {#each clerkUsers as user}
                                    <option value={user.id}
                                        >{user.fullName} ({user.email})</option
                                    >
                                {/each}
                            </Select>
                        </div>
                    </div>

                    <Button
                        color="purple"
                        on:click={mapTeamMemberToUser}
                        disabled={!selectedTeamMemberId || !selectedUserId}
                    >
                        Map Team Member to User
                    </Button>

                    {#if teamMemberMapping.size > 0}
                        <div class="mt-4">
                            <h4 class="font-medium mb-2">Current Mappings</h4>
                            <ul class="space-y-2">
                                {#each Array.from(teamMemberMapping.entries()) as [teamMemberId, userId]}
                                    <li class="text-sm bg-gray-50 p-2 rounded">
                                        "{teamMembers.find(
                                            (m) => m.id === teamMemberId,
                                        )?.name}" → "{getUserName(userId)}"
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                </div>
            </AccordionItem>
        </Accordion>
    </Card>
</div>
