<script lang="ts">
    import { onMount } from "svelte";
    import { clerkReady } from "$lib/stores/workspaceStore";
    import { db, type Workspace, type TeamMember } from "$lib/db";
    import {
        Spinner,
        Button,
        Card,
        Heading,
        Alert,
        Badge,
        Accordion,
        AccordionItem,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";
    import {
        ArrowUpDownOutline,
        CloudArrowUpOutline,
        ArrowDownOutline,
        BuildingSolid,
        UsersSolid,
        TrashBinSolid,
        PlusOutline,
        InfoCircleSolid,
        ExclamationCircleSolid,
        CheckCircleSolid,
        CloudArrowUpSolid,
    } from "flowbite-svelte-icons";

    // States
    let isClerkLoaded = false;
    let isAuthenticated = false;
    let user: any = null;
    let isLoading = true;
    let errorMessage = "";

    // Data
    let clerkOrganizations: any[] = [];
    let localWorkspaces: Workspace[] = [];
    let localTeamMembers: TeamMember[] = [];

    // Activity log
    let syncLogs: { message: string; timestamp: Date; type: string }[] = [];

    onMount(async () => {
        const unsubscribe = clerkReady.subscribe(async (ready) => {
            if (ready) {
                await checkClerkStatus();
                if (isAuthenticated) {
                    await loadData();
                }
            }
        });

        if (window.Clerk) {
            await checkClerkStatus();
            if (isAuthenticated) {
                await loadData();
            }
        }

        return unsubscribe;
    });

    async function checkClerkStatus() {
        try {
            const clerk = window.Clerk;
            isClerkLoaded = !!clerk;

            if (clerk) {
                isAuthenticated = !!clerk.user;
                if (isAuthenticated) {
                    user = clerk.user;
                }
            }
        } catch (error) {
            console.error("Error checking Clerk status:", error);
            errorMessage = "Failed to check authentication status";
            isClerkLoaded = false;
            isAuthenticated = false;
        }
    }

    async function loadData() {
        try {
            isLoading = true;
            errorMessage = "";
            addLog("Loading data...", "info");

            // Load Clerk organizations
            const clerk = window.Clerk;

            // Handle both free and team plans
            if (clerk.organization) {
                console.log("co", clerk.organization);
                try {
                    clerkOrganizations =
                        await clerk.organization.getOrganizationList();
                } catch (error) {
                    console.warn(
                        "Error getting organizations list, likely using free plan:",
                        error,
                    );
                    // Create a personal organization for free plans
                    clerkOrganizations = [
                        {
                            id: "personal",
                            name: "Personal Workspace",
                            slug: "personal",
                            createdAt: new Date().toISOString(),
                        },
                    ];
                    addLog(
                        "Using personal workspace mode (Clerk Free plan)",
                        "info",
                    );
                }
            } else {
                console.log("co", clerk);
                // Fallback for free plans
                clerkOrganizations = [
                    {
                        id: "personal",
                        name: "Personal Workspace",
                        slug: "personal",
                        createdAt: new Date().toISOString(),
                    },
                ];
                addLog(
                    "Using personal workspace mode (Clerk Free plan)",
                    "info",
                );
            }

            // Load local data
            localWorkspaces = await db.workspaces.toArray();
            localTeamMembers = await db.teamMembers.toArray();

            addLog("Data loaded successfully", "success");
        } catch (error) {
            console.error("Error loading data:", error);
            errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown error loading data";
            addLog(`Error loading data: ${errorMessage}`, "error");
        } finally {
            isLoading = false;
        }
    }

    // Helper function to get workspace info by ID
    function getWorkspaceById(id) {
        return localWorkspaces.find((w) => w.id === id);
    }

    // Helper function to get team members for a workspace
    function getTeamMembersForWorkspace(workspaceId) {
        return localTeamMembers.filter((m) => m.workspaceId === workspaceId);
    }

    // Helper function to check if a workspace is synced with Clerk
    function isWorkspaceSynced(workspace) {
        return !!workspace.clerkOrganizationId;
    }

    // Helper function to get the Clerk organization for a workspace
    function getLinkedOrganization(workspace) {
        if (!workspace.clerkOrganizationId) return null;
        return clerkOrganizations.find(
            (org) => org.id === workspace.clerkOrganizationId,
        );
    }

    // Helper function to get workspaces that are not yet synced with any organization
    function getUnsyncedWorkspaces() {
        return localWorkspaces.filter((w) => !w.clerkOrganizationId);
    }

    // Helper function to get organizations that are not linked to any workspace
    function getUnlinkedOrganizations() {
        const linkedOrgIds = localWorkspaces
            .filter((w) => w.clerkOrganizationId)
            .map((w) => w.clerkOrganizationId);
        return clerkOrganizations.filter(
            (org) => !linkedOrgIds.includes(org.id),
        );
    }

    // Actions
    async function createWorkspaceFromOrg(org) {
        try {
            addLog(
                `Creating workspace from organization "${org.name}"...`,
                "info",
            );

            const newWorkspace = {
                name: org.name,
                rate: 0,
                clerkOrganizationId: org.id,
            };

            const id = await db.workspaces.add(newWorkspace);
            addLog(`Created workspace "${org.name}" successfully`, "success");

            // Reload data
            await loadData();
        } catch (error) {
            console.error("Error creating workspace:", error);
            addLog(`Failed to create workspace: ${error.message}`, "error");
        }
    }

    async function linkWorkspaceToOrg(workspace, org) {
        try {
            addLog(
                `Linking workspace "${workspace.name}" to organization "${org.name}"...`,
                "info",
            );

            await db.workspaces.update(workspace.id, {
                clerkOrganizationId: org.id,
            });

            addLog(
                `Linked workspace "${workspace.name}" to organization "${org.name}" successfully`,
                "success",
            );

            // Reload data
            await loadData();
        } catch (error) {
            console.error("Error linking workspace:", error);
            addLog(`Failed to link workspace: ${error.message}`, "error");
        }
    }

    async function unlinkWorkspace(workspace) {
        try {
            addLog(
                `Unlinking workspace "${workspace.name}" from cloud...`,
                "info",
            );

            await db.workspaces.update(workspace.id, {
                clerkOrganizationId: null,
            });

            addLog(
                `Unlinked workspace "${workspace.name}" successfully`,
                "success",
            );

            // Reload data
            await loadData();
        } catch (error) {
            console.error("Error unlinking workspace:", error);
            addLog(`Failed to unlink workspace: ${error.message}`, "error");
        }
    }

    // Activity log
    function addLog(message, type = "info") {
        syncLogs = [
            { message, timestamp: new Date(), type },
            ...syncLogs,
        ].slice(0, 50); // Keep only the last 50 logs
    }

    function clearLogs() {
        syncLogs = [];
    }

    // Full sync function
    async function syncAll() {
        try {
            addLog("Starting full sync...", "info");

            // Create workspaces for unlinked organizations
            const unlinkedOrgs = getUnlinkedOrganizations();
            for (const org of unlinkedOrgs) {
                await createWorkspaceFromOrg(org);
            }

            addLog("Full sync completed successfully", "success");
        } catch (error) {
            console.error("Error during full sync:", error);
            addLog(`Full sync failed: ${error.message}`, "error");
        }
    }
</script>

<div class="p-4" style="width: 1000px; margin: 0 auto;">
    <Heading tag="h1" class="flex items-center mb-6">
        <ArrowUpDownOutline class="w-6 h-6 mr-2" />
        Cloud Sync
    </Heading>

    {#if !isClerkLoaded}
        <Alert color="info">
            <div class="flex items-center">
                <InfoCircleSolid class="w-5 h-5 mr-2" />
                Loading authentication service...
            </div>
        </Alert>
    {:else if !isAuthenticated}
        <Alert color="warning">
            <div class="flex items-center">
                <ExclamationCircleSolid class="w-5 h-5 mr-2" />
                You need to be signed in to sync data with the cloud.
            </div>
        </Alert>
    {:else if isLoading}
        <div class="flex justify-center p-8">
            <Spinner size="8" />
            <p class="ml-3">Loading your data...</p>
        </div>
    {:else if errorMessage}
        <Alert color="error">
            <div class="flex items-center">
                <ExclamationCircleSolid class="w-5 h-5 mr-2" />
                {errorMessage}
            </div>
            <Button class="mt-2" on:click={loadData}>Try Again</Button>
        </Alert>
    {:else}
        <!-- Sync status card -->
        <Card padding="xl" class="mb-6" size="xl">
            <div class="flex flex-col md:flex-row items-center justify-between">
                <div class="flex items-center mb-4 md:mb-0">
                    <div class="p-2 bg-purple-100 rounded-full mr-4">
                        <CloudArrowUpOutline class="text-purple-700 w-8 h-8" />
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold">Cloud Sync Status</h3>
                        <p class="text-gray-600">
                            {localWorkspaces.filter(
                                (w) => w.clerkOrganizationId,
                            ).length} of {localWorkspaces.length} workspaces synced
                            with cloud
                        </p>
                    </div>
                </div>
                <div>
                    <Button color="purple" on:click={syncAll}>
                        <CloudArrowUpSolid class="w-5 h-5 mr-2" />
                        Sync All
                    </Button>
                </div>
            </div>
        </Card>

        <!-- Cloud Organizations -->
        <Card padding="xl" class="mb-6" size="xl">
            <h3 class="text-lg font-semibold mb-4 flex items-center">
                <BuildingSolid class="w-5 h-5 mr-2" />
                Cloud Organizations
            </h3>

            {#if clerkOrganizations.length === 0}
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                    <p>No organizations found in your Clerk account</p>
                </div>
            {:else}
                <Table hoverable={true}>
                    <TableHead>
                        <TableHeadCell>Organization</TableHeadCell>
                        <TableHeadCell>Status</TableHeadCell>
                        <TableHeadCell>Actions</TableHeadCell>
                    </TableHead>
                    <TableBody>
                        {#each clerkOrganizations as org}
                            <TableBodyRow>
                                <TableBodyCell>
                                    <div>
                                        <p class="font-medium">{org.name}</p>
                                        <p class="text-xs text-gray-500">
                                            ID: {org.id}
                                        </p>
                                    </div>
                                </TableBodyCell>
                                <TableBodyCell>
                                    {#if localWorkspaces.some((w) => w.clerkOrganizationId === org.id)}
                                        <Badge color="green">Synced</Badge>
                                    {:else}
                                        <Badge color="gray">Not Synced</Badge>
                                    {/if}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {#if !localWorkspaces.some((w) => w.clerkOrganizationId === org.id)}
                                        <Button
                                            size="xs"
                                            color="purple"
                                            on:click={() =>
                                                createWorkspaceFromOrg(org)}
                                        >
                                            <ArrowDownOutline
                                                class="w-3 h-3 mr-1"
                                            />
                                            Import
                                        </Button>
                                    {:else}
                                        <Button
                                            size="xs"
                                            color="alternative"
                                            disabled
                                        >
                                            <CheckCircleSolid
                                                class="w-3 h-3 mr-1"
                                            />
                                            Imported
                                        </Button>
                                    {/if}
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            {/if}
        </Card>

        <!-- Local Workspaces -->
        <Card padding="xl" class="mb-6" size="xl">
            <h3 class="text-lg font-semibold mb-4 flex items-center">
                <BuildingSolid class="w-5 h-5 mr-2" />
                Local Workspaces
            </h3>

            {#if localWorkspaces.length === 0}
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                    <p>No workspaces found in your local database</p>
                </div>
            {:else}
                <Table hoverable={true}>
                    <TableHead>
                        <TableHeadCell>Workspace</TableHeadCell>
                        <TableHeadCell>Status</TableHeadCell>
                        <TableHeadCell>Actions</TableHeadCell>
                    </TableHead>
                    <TableBody>
                        {#each localWorkspaces as workspace}
                            <TableBodyRow>
                                <TableBodyCell>
                                    <div>
                                        <p class="font-medium">
                                            {workspace.name}
                                        </p>
                                        <p class="text-xs text-gray-500">
                                            {getTeamMembersForWorkspace(
                                                workspace.id,
                                            ).length} team members
                                        </p>
                                    </div>
                                </TableBodyCell>
                                <TableBodyCell>
                                    {#if isWorkspaceSynced(workspace)}
                                        <Badge color="green">
                                            Synced with "{getLinkedOrganization(
                                                workspace,
                                            )?.name || "Unknown"}"
                                        </Badge>
                                    {:else}
                                        <Badge color="gray">Not Synced</Badge>
                                    {/if}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {#if isWorkspaceSynced(workspace)}
                                        <Button
                                            size="xs"
                                            color="red"
                                            on:click={() =>
                                                unlinkWorkspace(workspace)}
                                        >
                                            <TrashBinSolid
                                                class="w-3 h-3 mr-1"
                                            />
                                            Unlink
                                        </Button>
                                    {:else if getUnlinkedOrganizations().length > 0}
                                        <div class="flex space-x-1">
                                            {#each getUnlinkedOrganizations() as org}
                                                <Button
                                                    size="xs"
                                                    color="purple"
                                                    on:click={() =>
                                                        linkWorkspaceToOrg(
                                                            workspace,
                                                            org,
                                                        )}
                                                >
                                                    <CloudArrowUpOutline
                                                        class="w-3 h-3 mr-1"
                                                    />
                                                    Link to {org.name}
                                                </Button>
                                            {/each}
                                        </div>
                                    {:else}
                                        <span class="text-sm text-gray-500"
                                            >No available organizations</span
                                        >
                                    {/if}
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            {/if}
        </Card>

        <!-- Activity Log -->
        <Card padding="xl" size="xl">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Sync Activity</h3>
                <Button color="alternative" size="xs" on:click={clearLogs}
                    >Clear</Button
                >
            </div>

            {#if syncLogs.length === 0}
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                    <p class="text-gray-500">No activity recorded yet</p>
                </div>
            {:else}
                <div class="max-h-[200px] overflow-y-auto">
                    <Table>
                        <TableHead>
                            <TableHeadCell>Time</TableHeadCell>
                            <TableHeadCell>Message</TableHeadCell>
                            <TableHeadCell>Type</TableHeadCell>
                        </TableHead>
                        <TableBody>
                            {#each syncLogs as log}
                                <TableBodyRow>
                                    <TableBodyCell
                                        >{log.timestamp.toLocaleTimeString()}</TableBodyCell
                                    >
                                    <TableBodyCell>{log.message}</TableBodyCell>
                                    <TableBodyCell>
                                        {#if log.type === "success"}
                                            <Badge color="green">Success</Badge>
                                        {:else if log.type === "error"}
                                            <Badge color="red">Error</Badge>
                                        {:else if log.type === "warning"}
                                            <Badge color="yellow">Warning</Badge
                                            >
                                        {:else}
                                            <Badge color="blue">Info</Badge>
                                        {/if}
                                    </TableBodyCell>
                                </TableBodyRow>
                            {/each}
                        </TableBody>
                    </Table>
                </div>
            {/if}
        </Card>

        <!-- Help Section (Collapsed by default) -->
        <Accordion class="mt-6">
            <AccordionItem>
                <span slot="header" class="font-semibold"
                    >Help & Information</span
                >
                <div class="space-y-4 p-4">
                    <h4 class="font-medium">How Cloud Sync Works</h4>
                    <p>
                        Cloud Sync connects your local workspaces with your
                        Clerk organizations, allowing you to:
                    </p>
                    <ul class="list-disc pl-5 space-y-1">
                        <li>
                            Import organizations from Clerk to create local
                            workspaces
                        </li>
                        <li>
                            Link existing local workspaces to Clerk
                            organizations
                        </li>
                        <li>
                            Unlink workspaces when you no longer want them
                            connected
                        </li>
                    </ul>

                    <h4 class="font-medium mt-4">Sync Actions</h4>
                    <ul class="list-disc pl-5 space-y-1">
                        <li>
                            <strong>Import:</strong> Create a new local workspace
                            from a Clerk organization
                        </li>
                        <li>
                            <strong>Link:</strong> Connect an existing local workspace
                            to a Clerk organization
                        </li>
                        <li>
                            <strong>Unlink:</strong> Disconnect a workspace from
                            its Clerk organization
                        </li>
                        <li>
                            <strong>Sync All:</strong> Automatically import all unlinked
                            organizations
                        </li>
                    </ul>
                </div>
            </AccordionItem>
        </Accordion>
    {/if}
</div>
