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
        BuildingSolid,
        CloudArrowUpOutline,
        PlusOutline,
    } from "flowbite-svelte-icons";

    export let organizations = [];
    export let workspaces = [];
    export let db;
    export let addSyncLog;
    export let syncState;

    let selectedOrgId = null;
    let newWorkspaceName = "";
    let syncEnabled = true;

    async function createWorkspaceFromOrg() {
        if (!selectedOrgId) {
            addSyncLog("Please select an organization", "warning");
            return;
        }

        const selectedOrg = organizations.find(
            (org) => org.id === selectedOrgId,
        );
        if (!selectedOrg) return;

        try {
            // Create new workspace linked to the org
            const newWorkspace = {
                name: selectedOrg.name,
                rate: 0,
                clerkOrganizationId: selectedOrgId,
            };

            const id = await db.workspaces.add(newWorkspace);
            addSyncLog(
                `Created new workspace "${selectedOrg.name}" from organization`,
                "success",
            );

            // Refresh workspaces
            workspaces = await db.workspaces.toArray();

            // Reset selection
            selectedOrgId = null;
        } catch (error) {
            addSyncLog(`Error creating workspace: ${error.message}`, "error");
        }
    }

    async function createOrgFromWorkspace(workspaceId) {
        try {
            // For demo, we'll just update the workspace with a mock org ID
            const workspace = workspaces.find((w) => w.id === workspaceId);
            if (workspace) {
                // Create a mock org ID (in a real app, you'd create an actual org in Clerk)
                const mockOrgId = `org-${Date.now()}`;

                await db.workspaces.update(workspaceId, {
                    clerkOrganizationId: mockOrgId,
                });

                addSyncLog(
                    `Linked workspace "${workspace.name}" to a new organization`,
                    "success",
                );

                // Refresh workspaces
                workspaces = await db.workspaces.toArray();
            }
        } catch (error) {
            addSyncLog(
                `Error creating organization: ${error.message}`,
                "error",
            );
        }
    }

    function isWorkspaceLinked(workspace) {
        return !!workspace.clerkOrganizationId;
    }

    function getLinkedOrgName(workspace) {
        if (!workspace.clerkOrganizationId) return null;
        const org = organizations.find(
            (o) => o.id === workspace.clerkOrganizationId,
        );
        return org ? org.name : "Unknown Organization";
    }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
    <!-- Organizations List -->
    <Card padding="xl">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
            <BuildingSolid class="w-5 h-5 mr-2" />
            Cloud Organizations
        </h3>

        {#if organizations.length === 0}
            <div class="bg-gray-50 p-4 rounded-lg text-center">
                <p>No organizations found</p>
            </div>
        {:else}
            <div class="space-y-4">
                <div class="mb-4">
                    <Label for="selectOrgToSync" class="mb-2"
                        >Create Workspace from Organization</Label
                    >
                    <div class="flex items-center space-x-2">
                        <Select
                            id="selectOrgToSync"
                            bind:value={selectedOrgId}
                            class="flex-1"
                        >
                            <option value={null}>Select an organization</option>
                            {#each organizations as org}
                                <option value={org.id}>{org.name}</option>
                            {/each}
                        </Select>
                        <Button
                            color="purple"
                            on:click={createWorkspaceFromOrg}
                            disabled={!selectedOrgId}
                        >
                            <PlusOutline class="w-4 h-4 mr-1" />
                            Create
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHead>
                        <TableHeadCell>Organization</TableHeadCell>
                        <TableHeadCell>Status</TableHeadCell>
                    </TableHead>
                    <TableBody>
                        {#each organizations as org}
                            <TableBodyRow>
                                <TableBodyCell>{org.name}</TableBodyCell>
                                <TableBodyCell>
                                    {#if workspaces.some((w) => w.clerkOrganizationId === org.id)}
                                        <Badge color="green">Linked</Badge>
                                    {:else}
                                        <Badge color="gray">Not Linked</Badge>
                                    {/if}
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            </div>
        {/if}
    </Card>

    <!-- Workspaces List -->
    <Card padding="xl">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
            <BuildingSolid class="w-5 h-5 mr-2" />
            Local Workspaces
        </h3>

        {#if workspaces.length === 0}
            <div class="bg-gray-50 p-4 rounded-lg text-center">
                <p>No workspaces found</p>
            </div>
        {:else}
            <div class="mb-4">
                <Label class="inline-flex items-center mb-4">
                    <Checkbox bind:checked={syncEnabled} />
                    <span class="ml-2">Include workspaces in sync</span>
                </Label>
            </div>

            <Table>
                <TableHead>
                    <TableHeadCell>Workspace</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell>
                    <TableHeadCell>Actions</TableHeadCell>
                </TableHead>
                <TableBody>
                    {#each workspaces as workspace}
                        <TableBodyRow>
                            <TableBodyCell>{workspace.name}</TableBodyCell>
                            <TableBodyCell>
                                {#if isWorkspaceLinked(workspace)}
                                    <Badge color="green"
                                        >Linked to {getLinkedOrgName(
                                            workspace,
                                        )}</Badge
                                    >
                                {:else}
                                    <Badge color="gray">Not Linked</Badge>
                                {/if}
                            </TableBodyCell>
                            <TableBodyCell>
                                {#if !isWorkspaceLinked(workspace)}
                                    <Button
                                        size="xs"
                                        color="purple"
                                        on:click={() =>
                                            createOrgFromWorkspace(
                                                workspace.id,
                                            )}
                                    >
                                        <CloudArrowUpOutline
                                            class="w-3 h-3 mr-1"
                                        />
                                        Create Org
                                    </Button>
                                {/if}
                            </TableBodyCell>
                        </TableBodyRow>
                    {/each}
                </TableBody>
            </Table>
        {/if}
    </Card>
</div>
