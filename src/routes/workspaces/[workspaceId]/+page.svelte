<script lang="ts">
    import { db, type Workspace } from "$lib/db";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { Button, Tabs, TabItem, Input, Label } from "flowbite-svelte";
    import { BuildingSolid } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";

    let workspace: Workspace | undefined;
    let workspaceId: number;
    let activeTab: string = "details";
    let editingWorkspace: Workspace;

    onMount(async () => {
        workspaceId = $page.params.workspaceId;
        console.log("workspaceId", workspaceId);
        workspace = await db.workspaces.get(workspaceId);
        if (workspace) {
            editingWorkspace = { ...workspace }; // Initialize editingWorkspace with the current workspace data
        }

        // Determine the active tab based on the URL
        const pathSegments = $page.url.pathname.split("/");
        if (pathSegments.length > 3) {
            activeTab = pathSegments[3]; // 'clients', 'projects', etc.
        } else {
            activeTab = "details"; // Default to 'details'
        }
    });

    // Function to handle tab changes and navigate
    function handleTabChange(tabName: string) {
        activeTab = tabName;
        goto(`/workspaces/${workspaceId}/${tabName}`);
    }

    async function saveDetails() {
        if (workspaceId && editingWorkspace) {
            await db.workspaces.update(workspaceId, editingWorkspace);
            workspace = { ...editingWorkspace }; // Update the displayed workspace
            alert("Details saved successfully!");
        }
    }
</script>

{#if workspace}
    <div class="p-4">
        <h2 class="text-2xl font-bold mb-4 flex items-center">
            <BuildingSolid class="w-6 h-6 mr-2" />
            <a href="/workspaces">Workspace Management</a>
            &nbsp;/ {workspace?.name}
        </h2>

        <Tabs tabStyle="pill">
            <TabItem
                activeClasses="bg-purple-700 rounded-lg p-3 text-white"
                open={activeTab === "details"}
                title="Details"
            >
                <div class="mb-4">
                    <Label for="name" class="block mb-2">Name</Label>
                    <Input
                        type="text"
                        id="name"
                        bind:value={editingWorkspace.name}
                        placeholder="Workspace Name"
                    />
                </div>
                <div class="mb-4">
                    <Label for="rate" class="block mb-2">Default Rate</Label>
                    <Input
                        type="number"
                        id="rate"
                        bind:value={editingWorkspace.rate}
                        placeholder="Default Rate"
                    />
                </div>
                <Button color="purple" on:click={saveDetails}
                    >Save Details</Button
                >
            </TabItem>
            <TabItem
                activeClasses="bg-purple-700 rounded-lg p-3 text-white"
                open={activeTab === "clients"}
                title="Clients"
                on:click={() => goto(`/clients`)}
            ></TabItem>
            <TabItem
                activeClasses="bg-purple-700 rounded-lg p-3 text-white"
                open={activeTab === "projects"}
                title="Projects"
                on:click={() => goto(`/projects`)}
            ></TabItem>
            <TabItem
                activeClasses="bg-purple-700 rounded-lg p-3 text-white"
                open={activeTab === "team-members"}
                title="Team Members"
                on:click={() => goto(`/team-members`)}
            ></TabItem>
            <TabItem
                activeClasses="bg-purple-700 rounded-lg p-3 text-white"
                open={activeTab === "approvals"}
                title="Approvals"
                on:click={() => goto(`/approvals`)}
            ></TabItem>
            <TabItem
                activeClasses="bg-purple-700 rounded-lg p-3 text-white"
                open={activeTab === "tasks"}
                title="Tasks"
                on:click={() => goto(`/tasks`)}
            ></TabItem>
        </Tabs>
    </div>
{:else}
    <p>Workspace not found.</p>
{/if}
