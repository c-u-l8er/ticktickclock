<script lang="ts">
    import { page } from "$app/stores";
    import {
        Button,
        Navbar,
        NavBrand,
        NavLi,
        NavUl,
        Dropdown,
        DropdownItem,
        DropdownDivider,
    } from "flowbite-svelte";
    import { ChevronDownOutline } from "flowbite-svelte-icons";
    import { FileImportSolid } from "flowbite-svelte-icons";
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

    function goToSelectedWorkspace() {
        if (localSelectedWorkspaceId) {
            window.location.href = `/workspaces/${localSelectedWorkspaceId}`; // Hard refresh
        }
    }
</script>

<Navbar rounded={true} navContainerClass="nav-contain">
    <div style="display: flex; flex-direction: row;">
        <NavBrand href="/">
            <div class="file-pdf-outline-icon">
                <FileImportSolid
                    class="w-10 h-10 mr-2 text-gray-800 dark:text-white inline"
                />
            </div>
            <span
                class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
                ><span style="font-weight: normal;">TickTick</span>Clock</span
            >
        </NavBrand>

        <!-- Workspace Dropdown -->
        {#if $workspaces.length > 0}
            <div class="mr-4" style="margin-left: 1em;">
                <select
                    style="min-width: 175px;"
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
            <!-- Go to Workspace Button -->
            <Button size="sm" on:click={goToSelectedWorkspace}>!!</Button>
        {/if}
    </div>

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

<style>
    :global(.nav-contain) {
        width: 100%;
        max-width: 100% !important;
    }

    .file-pdf-outline-icon {
        /* You might need to adjust this selector based on the actual classes or structure of the icon */
        font-size: 0 !important; /* Hide the text by making font-size zero */
        /* or */
        /* font-size: 0.1px !important;  Make it extremely tiny but not fully hidden (sometimes better for accessibility than display: none) */
        fill: transparent !important; /* Make the text color transparent as well, just in case */
    }
</style>
