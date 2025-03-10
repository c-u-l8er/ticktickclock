<script lang="ts">
    import { page } from "$app/stores";
    import { Tabs, TabItem } from "flowbite-svelte";
    import { UsersSolid } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";

    export let data;

    $: activeTab = $page.url.pathname.split("/").pop();
    $: teamMember = data.teamMember;

    function handleTabChange(tabName: string) {
        goto(`/team-members/${data.teamMemberId}/${tabName}`);
    }
</script>

{#if teamMember}
    <div class="p-4">
        <h2 class="text-2xl font-bold mb-4 flex items-center">
            <UsersSolid class="w-6 h-6 mr-2" />
            <a href="/team-members">Team Member Management</a>
            &nbsp;/ {teamMember.name}
        </h2>

        <Tabs tabStyle="pill" contentClass="displayNone">
            <TabItem
                activeClasses="bg-purple-700 rounded-lg p-3 text-white"
                open={activeTab === "details" ||
                    $page.url.pathname ===
                        `/team-members/${$page.params.teamMemberId}`}
                title="Details"
                on:click={() => handleTabChange("details")}
            ></TabItem>
            <TabItem
                activeClasses="bg-purple-700 rounded-lg p-3 text-white"
                open={activeTab === "projects"}
                title="Projects"
                on:click={() => handleTabChange("projects")}
            ></TabItem>
            <TabItem
                activeClasses="bg-purple-700 rounded-lg p-3 text-white"
                open={activeTab === "tasks"}
                title="Tasks"
                on:click={() => handleTabChange("tasks")}
            ></TabItem>
            <TabItem
                activeClasses="bg-purple-700 rounded-lg p-3 text-white"
                open={activeTab === "time-entries"}
                title="Time Entries"
                on:click={() => handleTabChange("time-entries")}
            ></TabItem>
        </Tabs>

        <slot />
    </div>
{:else}
    <p>Team member not found.</p>
{/if}

<style>
    :gloabl(.displayNone) {
        display: none;
    }
</style>
