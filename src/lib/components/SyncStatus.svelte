<script lang="ts">
    import { Card, Button, Spinner } from "flowbite-svelte";
    import {
        CloudArrowUpOutline,
        ArrowUpDownOutline,
    } from "flowbite-svelte-icons";

    export let syncState;
    export let userCount;
    export let orgCount;
    export let workspaceCount;
    export let teamMemberCount;

    function startSync() {
        syncState.inProgress = true;
        syncState.message = "Sync started...";
        syncState.type = "info";

        // Add to log
        syncState.log = [
            ...syncState.log,
            {
                timestamp: new Date(),
                message: "Starting sync process...",
                type: "info",
            },
        ];

        // Simulate sync for demo
        setTimeout(() => {
            syncState.inProgress = false;
            syncState.message = "Sync completed successfully";
            syncState.type = "success";

            // Add to log
            syncState.log = [
                ...syncState.log,
                {
                    timestamp: new Date(),
                    message: "Sync completed successfully",
                    type: "success",
                },
            ];
        }, 2000);
    }
</script>

<Card padding="xl">
    <div class="flex flex-col md:flex-row items-center justify-between">
        <div class="flex items-center mb-4 md:mb-0">
            <div class="p-2 bg-purple-100 rounded-full mr-4">
                <CloudArrowUpOutline class="text-purple-700 w-8 h-8" />
            </div>
            <div>
                <h3 class="text-lg font-semibold">Cloud Sync Status</h3>
                <p class="text-gray-600">
                    {#if syncState.inProgress}
                        Syncing data, please wait...
                    {:else if syncState.message}
                        {syncState.message}
                    {:else}
                        Ready to sync your data with the cloud
                    {/if}
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                    <span class="text-xs bg-gray-100 px-2 py-1 rounded">
                        {orgCount} Organizations
                    </span>
                    <span class="text-xs bg-gray-100 px-2 py-1 rounded">
                        {userCount} Users
                    </span>
                    <span class="text-xs bg-gray-100 px-2 py-1 rounded">
                        {workspaceCount} Workspaces
                    </span>
                    <span class="text-xs bg-gray-100 px-2 py-1 rounded">
                        {teamMemberCount} Team Members
                    </span>
                </div>
            </div>
        </div>
        <div>
            <Button
                color="purple"
                disabled={syncState.inProgress}
                on:click={startSync}
            >
                {#if syncState.inProgress}
                    <Spinner size="4" class="mr-2" />
                    Syncing...
                {:else}
                    <ArrowUpDownOutline class="w-5 h-5 mr-2" />
                    Sync Now
                {/if}
            </Button>
        </div>
    </div>
</Card>
