<script lang="ts">
    import { page } from "$app/stores";
    import { db, type TeamMember } from "$lib/db";
    import { Button } from "flowbite-svelte";
    import { onMount } from "svelte";

    let teamMember: TeamMember | undefined;
    let teamMemberId: number;
    let isLoading = true;
    let error: Error | null = null;

    async function loadData() {
        try {
            isLoading = true;
            error = null;

            teamMemberId = parseInt($page.params.teamMemberId);
            teamMember = await db.teamMembers.get(teamMemberId);

            if (!teamMember) {
                throw new Error("Team member not found");
            }
        } catch (e) {
            console.error("Error loading data:", e);
            error =
                e instanceof Error ? e : new Error("Unknown error occurred");
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        loadData();
    });
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-4">
    {#if isLoading}
        <div class="flex justify-center">
            <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
            ></div>
        </div>
    {:else if error}
        <div class="text-red-500">
            <p>Error: {error.message}</p>
            <Button
                color="purple"
                class="mt-2 text-white px-4 py-2 rounded"
                on:click={loadData}
            >
                Retry
            </Button>
        </div>
    {:else if teamMember}
        <div class="grid gap-4">
            <div>
                <h3 class="text-lg font-semibold mb-2">Team Member Details</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Name</p>
                        <p class="font-medium">{teamMember.name}</p>
                    </div>
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Role</p>
                        <p class="font-medium">{teamMember.role}</p>
                    </div>
                </div>
            </div>

            <div>
                <p class="text-gray-600 dark:text-gray-400">Billable Rate</p>
                <p class="font-medium">${teamMember.billableRate}/hr</p>
            </div>

            <div>
                <p class="text-gray-600 dark:text-gray-400">Cost Rate</p>
                <p class="font-medium">${teamMember.costRate}/hr</p>
            </div>
        </div>
    {/if}
</div>
