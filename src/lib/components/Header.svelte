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
    import { onMount, onDestroy } from "svelte";
    import {
        selectedWorkspaceId,
        workspaces,
    } from "$lib/stores/workspaceStore";
    import { goto } from "$app/navigation";

    let hidden = true;
    $: activeUrl = $page.url.pathname;
    let localSelectedWorkspaceId: number | null = null;

    onMount(async () => {
        await fetchWorkspaces();
    });

    const unsubscribe = selectedWorkspaceId.subscribe((value) => {
        if (value !== localSelectedWorkspaceId && value !== null) {
            localSelectedWorkspaceId = value;
        }
    });

    onDestroy(unsubscribe);

    async function fetchWorkspaces() {
        const workspacesList = await db.workspaces.toArray();
        workspaces.set(workspacesList);

        // Load selectedWorkspaceId from localStorage
        const storedWorkspaceId = localStorage.getItem("selectedWorkspaceId");

        if (storedWorkspaceId) {
            localSelectedWorkspaceId = Number(storedWorkspaceId);
            // Check if the stored ID is in the list of workspaces
            const workspaceExists = workspacesList.some(
                (workspace) => workspace.id === localSelectedWorkspaceId,
            );
            if (workspaceExists) {
                selectedWorkspaceId.set(localSelectedWorkspaceId);
            } else {
                // Handle cases where stored workspace doesn't exist
                localSelectedWorkspaceId =
                    workspacesList.length > 0 ? workspacesList[0].id : null;
                handleWorkspaceChange();
            }
        } else if (workspacesList.length > 0) {
            // If no stored ID, but workspaces exist, select the first one
            localSelectedWorkspaceId = workspacesList[0].id;
            handleWorkspaceChange(); // this saves it.
        }
    }

    function handleWorkspaceChange() {
        if (localSelectedWorkspaceId !== null) {
            selectedWorkspaceId.set(localSelectedWorkspaceId); // Sync with the store
            // Save to localStorage
            localStorage.setItem(
                "selectedWorkspaceId",
                String(localSelectedWorkspaceId),
            );
        }
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
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm
				rounded-lg focus:ring-blue-500 focus:border-blue-500 block
				w-full p-2.5 dark:bg-gray-700 dark:border-gray-600
				dark:placeholder-gray-400 dark:text-white
				dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
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
