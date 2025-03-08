<script lang="ts">
    import { db, type Client } from "$lib/db";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { Tabs, TabItem } from "flowbite-svelte";
    import { ProfileCardSolid } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";

    let client: Client | undefined;
    let clientId: number;
    let activeTab: string = "details"; // Keep track of the active tab

    onMount(async () => {
        clientId = parseInt($page.params.clientId);
        client = await db.clients.get(clientId);

        // Determine the active tab based on the URL
        const pathSegments = $page.url.pathname.split("/");
        if (pathSegments.length > 3) {
            activeTab = pathSegments[3]; // 'projects' or 'invoices'
        } else {
            activeTab = "details"; // Default to 'details'
        }
    });

    // Function to handle tab changes and navigate
    function handleTabChange(tabName: string) {
        activeTab = tabName;
        goto(`/clients/${clientId}/${tabName}`);
    }
</script>

{#if client}
    <div class="p-4">
        <h2 class="text-2xl font-bold mb-4 flex items-center">
            <ProfileCardSolid class="w-6 h-6 mr-2" />
            <a href="/clients">Client Management</a>
            &nbsp;/ {client?.name}
        </h2>

        <Tabs tabStyle="pill">
            <TabItem open title="Details">
                <div class="grid gap-4">
                    <div>
                        <h3 class="text-lg font-semibold mb-2">
                            Client Details
                        </h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-gray-600 dark:text-gray-400">
                                    Name
                                </p>
                                <p class="font-medium">{client.name}</p>
                            </div>
                            <div>
                                <p class="text-gray-600 dark:text-gray-400">
                                    Rate
                                </p>
                                <p class="font-medium">${client.rate}/hr</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">
                            Contact Details
                        </p>
                        <p class="font-medium">{client.contactDetails}</p>
                    </div>
                </div>
            </TabItem>
            <TabItem
                open={activeTab === "projects"}
                title="Projects"
                on:click={() => handleTabChange("projects")}
            ></TabItem>
            <TabItem
                open={activeTab === "invoices"}
                title="Invoices"
                on:click={() => handleTabChange("invoices")}
            ></TabItem>
        </Tabs>
    </div>
{:else}
    <p>Client not found.</p>
{/if}
