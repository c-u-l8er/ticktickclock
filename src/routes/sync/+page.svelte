<script lang="ts">
    import { dev } from "$app/environment";

    // Set base URLs according to environment
    const clerkBaseUrl = dev
        ? "https://learning-starfish-18.accounts.dev"
        : "https://accounts.ticktickclock.com";

    import { onMount } from "svelte";
    import { clerkReady } from "$lib/stores/workspaceStore";
    import { workspaces as workspacesStore } from "$lib/stores/workspaceStore";
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
        UserSettingsSolid,
    } from "flowbite-svelte-icons";

    // States
    let isClerkLoaded = false;
    let isAuthenticated = false;
    let user: any = null;
    let isLoading = true;
    let errorMessage = "";
    let syncState = {
        inProgress: false,
    };

    // Data
    let clerkOrganizations: any[] = [];
    let clerkMemberships: any[] = [];
    let localWorkspaces: Workspace[] = [];
    let localTeamMembers: TeamMember[] = [];
    let clerkUsers: any[] = [];

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

            // Get organization memberships instead of just organizations
            try {
                if (clerk.user) {
                    // Get the user's organization memberships
                    clerkMemberships =
                        await clerk.user.getOrganizationMemberships();

                    if (clerkMemberships && clerkMemberships.length > 0) {
                        // Extract organizations from memberships
                        clerkOrganizations = clerkMemberships.map(
                            (membership) => ({
                                id: membership.organization.id,
                                name: membership.organization.name,
                                slug: membership.organization.slug,
                                createdAt: membership.organization.createdAt,
                                role: membership.role, // Include the user's role in each organization
                            }),
                        );

                        addLog(
                            `Found ${clerkOrganizations.length} organizations you're a member of`,
                            "success",
                        );
                    } else {
                        // Fallback for when the user isn't a member of any organizations
                        clerkOrganizations = [
                            {
                                id: "personal",
                                name: "Personal Workspace",
                                slug: "personal",
                                createdAt: new Date().toISOString(),
                                role: "admin",
                            },
                        ];
                        addLog(
                            "Using personal workspace (no organizations found)",
                            "info",
                        );
                    }
                }

                // If available, get all users from the first organization the user is a member of
                if (clerkMemberships && clerkMemberships.length > 0) {
                    const firstOrg = clerkMemberships[0].organization;
                    try {
                        const members = await firstOrg.getMemberships();
                        clerkUsers = members.map((membership) => ({
                            id: membership.publicUserData.userId,
                            firstName: membership.publicUserData.firstName,
                            lastName: membership.publicUserData.lastName,
                            fullName:
                                `${membership.publicUserData.firstName || ""} ${membership.publicUserData.lastName || ""}`.trim(),
                            email: membership.publicUserData.identifier,
                            role: membership.role,
                        }));
                        addLog(
                            `Found ${clerkUsers.length} members in organization "${firstOrg.name}"`,
                            "success",
                        );
                    } catch (error) {
                        console.warn(
                            "Error fetching organization members:",
                            error,
                        );
                        clerkUsers = []; // Empty array if we can't get members
                    }
                }
            } catch (error) {
                console.warn("Error getting organization memberships:", error);
                // Fallback for errors or free plans
                clerkOrganizations = [
                    {
                        id: "personal",
                        name: "Personal Workspace",
                        slug: "personal",
                        createdAt: new Date().toISOString(),
                        role: "admin",
                    },
                ];
                clerkUsers = []; // Empty array if we can't get users
                addLog(
                    "Using personal workspace mode (could not fetch organizations)",
                    "info",
                );
            }

            // Load local data
            localWorkspaces = await db.workspaces.toArray();
            localTeamMembers = await db.teamMembers.toArray();

            // After loading data, update the workspaces store
            if (localWorkspaces.length > 0) {
                workspacesStore.set(localWorkspaces);
            }

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

            // Explicitly update the workspaces store
            const updatedWorkspaces = await db.workspaces.toArray();
            workspacesStore.set(updatedWorkspaces);
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
            const updatedWorkspaces = await db.workspaces.toArray();
            workspacesStore.set(updatedWorkspaces);
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
            const updatedWorkspaces = await db.workspaces.toArray();
            workspacesStore.set(updatedWorkspaces);
        } catch (error) {
            console.error("Error unlinking workspace:", error);
            addLog(`Failed to unlink workspace: ${error.message}`, "error");
        }
    }

    // Function to create team members from Clerk users
    async function createTeamMembersFromUsers(workspaceId) {
        try {
            if (!workspaceId) {
                addLog(
                    "No workspace selected for team member import",
                    "warning",
                );
                return;
            }

            const workspace = getWorkspaceById(workspaceId);
            if (!workspace) {
                addLog("Could not find selected workspace", "error");
                return;
            }

            addLog(
                `Importing team members for workspace "${workspace.name}"...`,
                "info",
            );

            // Get existing team member names for this workspace
            const existingNames = getTeamMembersForWorkspace(workspaceId).map(
                (m) => m.name.toLowerCase(),
            );

            // Filter users that don't already exist as team members
            const usersToImport = clerkUsers.filter(
                (user) => !existingNames.includes(user.fullName.toLowerCase()),
            );

            if (usersToImport.length === 0) {
                addLog("No new users to import as team members", "info");
                return;
            }

            // Create team members for each user
            for (const user of usersToImport) {
                await db.teamMembers.add({
                    workspaceId,
                    name: user.fullName,
                    billableRate: 0,
                    costRate: 0,
                    role: user.role === "admin" ? "admin" : "team manager", // Map Clerk roles to our roles
                });
            }

            addLog(
                `Imported ${usersToImport.length} team members successfully`,
                "success",
            );

            // Reload data
            await loadData();
        } catch (error) {
            console.error("Error creating team members:", error);
            addLog(`Failed to create team members: ${error.message}`, "error");
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
            syncState.inProgress = true;
            addLog("Starting full sync...", "info");

            // Try to perform a cloud sync
            if (db && db.cloud) {
                try {
                    const syncResult = await db.safeSync();
                    if (syncResult && syncResult.error) {
                        addLog(
                            `Sync encountered an error: ${syncResult.error.message || "Unknown error"}`,
                            "warning",
                        );
                    } else {
                        addLog(
                            "Database sync completed successfully",
                            "success",
                        );
                    }
                } catch (error) {
                    addLog(
                        `Cloud sync failed: ${error.message || "Unknown error"}`,
                        "error",
                    );
                }
            } else {
                addLog("Cloud sync is not available", "warning");
            }

            // Create workspaces for unlinked organizations
            const unlinkedOrgs = getUnlinkedOrganizations();
            for (const org of unlinkedOrgs) {
                try {
                    await createWorkspaceFromOrg(org);
                } catch (error) {
                    addLog(
                        `Failed to create workspace for org ${org.name}: ${error.message}`,
                        "error",
                    );
                }
            }

            // After creating workspaces, try to import team members
            // for each workspace that's linked to an organization
            for (const workspace of localWorkspaces) {
                if (workspace.clerkOrganizationId) {
                    try {
                        await createTeamMembersFromUsers(workspace.id);
                    } catch (error) {
                        addLog(
                            `Failed to import team members for workspace ${workspace.name}: ${error.message}`,
                            "error",
                        );
                    }
                }
            }

            // Try to update the workspaces store
            try {
                const updatedWorkspaces = await db.workspaces.toArray();
                workspacesStore.set(updatedWorkspaces);
            } catch (error) {
                addLog(
                    `Failed to refresh workspace list: ${error.message}`,
                    "warning",
                );
            }

            addLog("Full sync process completed", "success");
        } catch (error) {
            console.error("Error during full sync:", error);
            addLog(`Full sync failed: ${error.message}`, "error");
        } finally {
            syncState.inProgress = false;
        }
    }

    // Update the functions that open Clerk UI to use dynamic URLs
    function openClerkOrgManager() {
        // Redirect to the Clerk organizations page based on environment
        window.location.href = `${clerkBaseUrl}/organization`;
    }

    function openClerkUserManager() {
        // Redirect to the Clerk organization members page based on environment
        window.location.href = `${clerkBaseUrl}/organization/organization-members`;
    }

    // New function to create organization with dynamic URL
    function createClerkOrganization() {
        window.location.href = `${clerkBaseUrl}/create-organization`;
    }
</script>

<div class="p-4 w-full">
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
        <!-- Two-column layout with main content and help sidebar -->
        <div class="flex flex-col lg:flex-row gap-6">
            <!-- Main content column (left) -->
            <div class="w-full lg:w-2/3">
                <!-- Sync status card -->
                <Card padding="xl" class="mb-6" size="none">
                    <div
                        class="flex flex-col md:flex-row items-center justify-between"
                    >
                        <div class="flex items-center mb-4 md:mb-0">
                            <div class="p-2 bg-purple-100 rounded-full mr-4">
                                <CloudArrowUpOutline
                                    class="text-purple-700 w-8 h-8"
                                />
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold">
                                    Cloud Sync Status
                                </h3>
                                <p class="text-gray-600">
                                    {localWorkspaces.filter(
                                        (w) => w.clerkOrganizationId,
                                    ).length} of {localWorkspaces.length} workspaces
                                    synced with cloud
                                </p>
                                <p class="text-gray-600 text-sm mt-1">
                                    {localTeamMembers.length} team members available
                                    locally
                                </p>
                            </div>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-2">
                            <Button color="purple" on:click={syncAll}>
                                <CloudArrowUpSolid class="w-5 h-5 mr-2" />
                                Sync All
                            </Button>
                            <Button
                                color="alternative"
                                on:click={openClerkOrgManager}
                            >
                                <UserSettingsSolid class="w-5 h-5 mr-2" />
                                Organizations Portal
                            </Button>
                        </div>
                    </div>
                </Card>

                <!-- Cloud Organizations -->
                <Card padding="xl" class="mb-6" size="none">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold flex items-center">
                            <BuildingSolid class="w-5 h-5 mr-2" />
                            Cloud Organizations
                        </h3>
                        <div class="flex gap-2">
                            <Button
                                size="sm"
                                color="alternative"
                                on:click={openClerkOrgManager}
                            >
                                Manage Organizations
                            </Button>
                            <Button
                                size="sm"
                                color="purple"
                                on:click={createClerkOrganization}
                            >
                                Create Organization
                            </Button>
                        </div>
                    </div>

                    {#if clerkOrganizations.length === 0}
                        <div class="bg-gray-50 p-4 rounded-lg text-center">
                            <p>No organizations found in your Clerk account</p>
                        </div>
                    {:else}
                        <Table hoverable={true}>
                            <TableHead>
                                <TableHeadCell>Organization</TableHeadCell>
                                <TableHeadCell>Role</TableHeadCell>
                                <TableHeadCell>Status</TableHeadCell>
                                <TableHeadCell>Actions</TableHeadCell>
                            </TableHead>
                            <TableBody>
                                {#each clerkOrganizations as org}
                                    <TableBodyRow>
                                        <TableBodyCell>
                                            <div>
                                                <p class="font-medium">
                                                    {org.name}
                                                </p>
                                                <p
                                                    class="text-xs text-gray-500"
                                                >
                                                    ID: {org.id}
                                                </p>
                                            </div>
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            <Badge color="purple"
                                                >{org.role || "member"}</Badge
                                            >
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            {#if localWorkspaces.some((w) => w.clerkOrganizationId === org.id)}
                                                <Badge color="green"
                                                    >Synced</Badge
                                                >
                                            {:else}
                                                <Badge color="gray"
                                                    >Not Synced</Badge
                                                >
                                            {/if}
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            {#if !localWorkspaces.some((w) => w.clerkOrganizationId === org.id)}
                                                <Button
                                                    size="xs"
                                                    color="purple"
                                                    on:click={() =>
                                                        createWorkspaceFromOrg(
                                                            org,
                                                        )}
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
                <Card padding="xl" class="mb-6" size="none">
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
                                <TableHeadCell>Team Members</TableHeadCell>
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
                                                <Badge color="gray"
                                                    >Not Synced</Badge
                                                >
                                            {/if}
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            {getTeamMembersForWorkspace(
                                                workspace.id,
                                            ).length} members
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            {#if isWorkspaceSynced(workspace)}
                                                <div class="flex space-x-1">
                                                    <Button
                                                        size="xs"
                                                        color="purple"
                                                        on:click={() =>
                                                            createTeamMembersFromUsers(
                                                                workspace.id,
                                                            )}
                                                    >
                                                        <UsersSolid
                                                            class="w-3 h-3 mr-1"
                                                        />
                                                        Import Members
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        color="red"
                                                        on:click={() =>
                                                            unlinkWorkspace(
                                                                workspace,
                                                            )}
                                                    >
                                                        <TrashBinSolid
                                                            class="w-3 h-3 mr-1"
                                                        />
                                                        Unlink
                                                    </Button>
                                                </div>
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
                                                <span
                                                    class="text-sm text-gray-500"
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

                <!-- Team Members Section -->
                <Card padding="xl" class="mb-6" size="none">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold flex items-center">
                            <UsersSolid class="w-5 h-5 mr-2" />
                            Team Members
                        </h3>
                        <Button
                            size="sm"
                            color="alternative"
                            on:click={openClerkUserManager}
                        >
                            Manage Organization Members
                        </Button>
                    </div>

                    <!-- Section for Clerk users -->
                    <Accordion class="mb-4">
                        <AccordionItem>
                            <span slot="header" class="font-semibold">
                                Clerk Users ({clerkUsers.length})
                            </span>
                            {#if clerkUsers.length === 0}
                                <div
                                    class="bg-gray-50 p-4 rounded-lg text-center"
                                >
                                    <p>No Clerk users found</p>
                                </div>
                            {:else}
                                <Table>
                                    <TableHead>
                                        <TableHeadCell>Name</TableHeadCell>
                                        <TableHeadCell>Email</TableHeadCell>
                                        <TableHeadCell>Role</TableHeadCell>
                                    </TableHead>
                                    <TableBody>
                                        {#each clerkUsers as user}
                                            <TableBodyRow>
                                                <TableBodyCell
                                                    >{user.fullName}</TableBodyCell
                                                >
                                                <TableBodyCell
                                                    >{user.email}</TableBodyCell
                                                >
                                                <TableBodyCell>
                                                    <Badge color="purple"
                                                        >{user.role}</Badge
                                                    >
                                                </TableBodyCell>
                                            </TableBodyRow>
                                        {/each}
                                    </TableBody>
                                </Table>
                            {/if}
                        </AccordionItem>
                    </Accordion>

                    <!-- Section for local team members -->
                    <h4 class="font-medium mb-2">Local Team Members</h4>
                    {#if localTeamMembers.length === 0}
                        <div class="bg-gray-50 p-4 rounded-lg text-center">
                            <p>No team members found locally</p>
                        </div>
                    {:else}
                        <Table>
                            <TableHead>
                                <TableHeadCell>Name</TableHeadCell>
                                <TableHeadCell>Workspace</TableHeadCell>
                                <TableHeadCell>Role</TableHeadCell>
                            </TableHead>
                            <TableBody>
                                {#each localTeamMembers as member}
                                    <TableBodyRow>
                                        <TableBodyCell
                                            >{member.name}</TableBodyCell
                                        >
                                        <TableBodyCell>
                                            {getWorkspaceById(
                                                member.workspaceId,
                                            )?.name || "Unknown"}
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            <Badge
                                                color={member.role === "admin"
                                                    ? "red"
                                                    : "blue"}
                                            >
                                                {member.role}
                                            </Badge>
                                        </TableBodyCell>
                                    </TableBodyRow>
                                {/each}
                            </TableBody>
                        </Table>
                    {/if}
                </Card>

                <!-- Activity Log -->
                <Card padding="xl" size="none">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Sync Activity</h3>
                        <Button
                            color="alternative"
                            size="xs"
                            on:click={clearLogs}>Clear</Button
                        >
                    </div>

                    {#if syncLogs.length === 0}
                        <div class="bg-gray-50 p-4 rounded-lg text-center">
                            <p class="text-gray-500">
                                No activity recorded yet
                            </p>
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
                                            <TableBodyCell>
                                                {log.timestamp.toLocaleTimeString()}
                                            </TableBodyCell>
                                            <TableBodyCell
                                                >{log.message}</TableBodyCell
                                            >
                                            <TableBodyCell>
                                                {#if log.type === "success"}
                                                    <Badge color="green"
                                                        >Success</Badge
                                                    >
                                                {:else if log.type === "error"}
                                                    <Badge color="red"
                                                        >Error</Badge
                                                    >
                                                {:else if log.type === "warning"}
                                                    <Badge color="yellow"
                                                        >Warning</Badge
                                                    >
                                                {:else}
                                                    <Badge color="blue"
                                                        >Info</Badge
                                                    >
                                                {/if}
                                            </TableBodyCell>
                                        </TableBodyRow>
                                    {/each}
                                </TableBody>
                            </Table>
                        </div>
                    {/if}
                </Card>
            </div>

            <!-- Help & Information sidebar (right) -->
            <div class="w-full lg:w-1/3">
                <div class="sticky top-4">
                    <Card padding="xl" size="none">
                        <h3 class="text-lg font-semibold mb-4">
                            Help & Information
                        </h3>

                        <div class="space-y-4">
                            <div>
                                <h4 class="font-medium text-gray-900">
                                    How Cloud Sync Works
                                </h4>
                                <p class="mt-2 text-gray-700">
                                    Cloud Sync connects your local workspaces
                                    with your Clerk organizations, allowing you
                                    to:
                                </p>
                                <ul
                                    class="list-disc pl-5 space-y-1 mt-2 text-gray-700"
                                >
                                    <li>
                                        Import organizations from Clerk to
                                        create local workspaces
                                    </li>
                                    <li>
                                        Link existing local workspaces to Clerk
                                        organizations
                                    </li>
                                    <li>
                                        Import organization members as team
                                        members
                                    </li>
                                    <li>
                                        Unlink workspaces when you no longer
                                        want them connected
                                    </li>
                                </ul>
                            </div>

                            <div class="border-t pt-4">
                                <h4 class="font-medium text-gray-900">
                                    Clerk Integration Features
                                </h4>
                                <ul
                                    class="list-disc pl-5 space-y-1 mt-2 text-gray-700"
                                >
                                    <li>
                                        <strong>Organizations:</strong> Each Clerk
                                        organization can be imported as a workspace
                                    </li>
                                    <li>
                                        <strong>Members:</strong> Organization members
                                        can be imported as team members
                                    </li>
                                    <li>
                                        <strong>Roles:</strong> Administrative roles
                                        in Clerk map to roles in TickTickClock
                                    </li>
                                    <li>
                                        <strong>Management:</strong> Use the management
                                        buttons to access Clerk's organization tools
                                    </li>
                                </ul>
                            </div>

                            <div class="border-t pt-4">
                                <h4 class="font-medium text-gray-900">
                                    Sync Process
                                </h4>
                                <ol
                                    class="list-decimal pl-5 space-y-1 mt-2 text-gray-700"
                                >
                                    <li>
                                        Create or select a Clerk organization
                                    </li>
                                    <li>
                                        Import the organization as a workspace
                                    </li>
                                    <li>
                                        Import organization members as team
                                        members
                                    </li>
                                    <li>
                                        Use the "Sync All" button for automated
                                        syncing
                                    </li>
                                </ol>
                            </div>

                            <div class="border-t pt-4">
                                <h4 class="font-medium text-gray-900">
                                    Troubleshooting
                                </h4>
                                <ul
                                    class="list-disc pl-5 space-y-1 mt-2 text-gray-700"
                                >
                                    <li>
                                        <strong
                                            >Not seeing organizations?</strong
                                        > Make sure you've created them in the Clerk
                                        dashboard first
                                    </li>
                                    <li>
                                        <strong>Sync issues?</strong> Check the Activity
                                        Log for specific error messages
                                    </li>
                                    <li>
                                        <strong>Need more help?</strong> Contact
                                        support at wrand.cc
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    {/if}
</div>
