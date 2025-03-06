<script lang="ts">
    import { page } from "$app/stores";
    import {
        Navbar,
        NavBrand,
        NavLi,
        NavUl,
        NavHamburger,
        Dropdown,
        DropdownItem,
        DropdownDivider,
    } from "flowbite-svelte";
    import { ChevronDownOutline } from "flowbite-svelte-icons";
    import { ClockOutline } from "flowbite-svelte-icons";
    import { db } from "$lib/db";
    import { onMount } from "svelte";
    import {
        selectedWorkspaceId,
        workspaces,
    } from "$lib/stores/workspaceStore";
    import { goto } from "$app/navigation"; // Import goto

    let hidden = true;
    $: activeUrl = $page.url.pathname;
    let localSelectedWorkspaceId: number | null = null;

    onMount(async () => {
        await fetchWorkspaces();
    });

    async function fetchWorkspaces() {
        const workspacesList = await db.workspaces.toArray();
        workspaces.set(workspacesList);
        if (workspacesList.length > 0 && !$selectedWorkspaceId) {
            localSelectedWorkspaceId = workspacesList[0].id || null;
            selectedWorkspaceId.set(localSelectedWorkspaceId);
        }
    }

    $: {
        selectedWorkspaceId.set(localSelectedWorkspaceId);
    }

    // Function to handle workspace selection change
    function handleWorkspaceChange() {
        selectedWorkspaceId.set(localSelectedWorkspaceId);
        // Optionally, you might want to redirect the user to the home page or a suitable dashboard
        // after changing the workspace.  Example:
        // goto('/');
    }
</script>

<Navbar rounded={true}>
    <NavBrand href="/">
        <ClockOutline
            class="w-6 h-6 mr-2 text-gray-800 dark:text-white inline"
        />
        <span
            class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
            >TickTickClock</span
        >
    </NavBrand>

    <!-- Workspace Dropdown -->
    {#if $workspaces.length > 0}
        <div class="mr-4">
            <select
                style="min-width: 150px;"
                bind:value={localSelectedWorkspaceId}
                on:change={handleWorkspaceChange}
            >
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm
                rounded-lg focus:ring-blue-500 focus:border-blue-500 block
                w-full p-2.5 dark:bg-gray-700 dark:border-gray-600
                dark:placeholder-gray-400 dark:text-white
                dark:focus:ring-blue-500 dark:focus:border-blue-500" >
                {#each $workspaces as workspace (workspace.id)}
                    <option value={workspace.id}>{workspace.name}</option>
                {/each}
            </select>
        </div>
    {/if}

    <NavHamburger />

    <NavUl {activeUrl}>
        <NavLi href="/">Home</NavLi>
        <NavLi class="cursor-pointer">
            Apps<ChevronDownOutline
                class="w-6 h-6 ms-2 text-primary-800 dark:text-white inline"
            />
        </NavLi>
        <Dropdown class="w-44 z-20">
            <DropdownItem href="/apps/android">Android</DropdownItem>
            <DropdownItem href="/apps/iphone">iPhone</DropdownItem>
            <DropdownItem href="/apps/browser-plugins"
                >Browser Plugins</DropdownItem
            >
            <DropdownItem href="/apps/desktop">Desktop</DropdownItem>
            <DropdownItem href="/apps/desktop">Watch</DropdownItem>
        </Dropdown>
        <NavLi href="/help">Help</NavLi>
        <NavLi href="/pricing">Pricing</NavLi>
        <NavLi href="/developer-api">Developer API</NavLi>
    </NavUl>
</Navbar>
