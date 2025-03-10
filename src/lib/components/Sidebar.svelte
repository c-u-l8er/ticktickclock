<script lang="ts">
    import { page } from "$app/stores";
    import {
        Sidebar,
        SidebarGroup,
        SidebarItem,
        SidebarWrapper,
        Button,
        Modal,
        Spinner,
    } from "flowbite-svelte";
    import {
        BadgeCheckSolid,
        ProfileCardSolid,
        ClockSolid,
        FileImportSolid,
        BuildingSolid,
        UsersSolid,
        CloudArrowUpOutline,
        ChartPieSolid,
        LightbulbSolid,
        ArrowRightOutline,
        CalendarMonthSolid,
        FileSolid,
        ListOutline,
        DollarOutline,
        SunSolid,
        ClipboardListSolid,
    } from "flowbite-svelte-icons";
    import Login from "$lib/components/Login.svelte";
    import Register from "$lib/components/Register.svelte";
    import { onMount } from "svelte";
    import { clerkReady } from "$lib/stores/workspaceStore";
    import { writable } from "svelte/store";

    let spanClass = "flex-1 ms-3 whitespace-nowrap";
    $: activeUrl = `/${$page.url.pathname.split("/")[1]}`;
    $: activeUrl2 = `/${$page.url.pathname.split("/")[3]}`;

    let isSignedIn = false;
    let showAuthModal = writable(false); // Combined auth modal
    let showLogin = writable(true); // Toggle between login and register
    let clerkLoaded = false;

    onMount(() => {
        // Check if Clerk is already in the window object
        checkClerkStatus();

        // Set up a listener to check Clerk's status when clerkReady changes
        const unsubscribe = clerkReady.subscribe((ready) => {
            if (ready) {
                checkClerkStatus();
            }
        });

        return unsubscribe;
    });

    function checkClerkStatus() {
        const clerk = window.Clerk;
        clerkLoaded = !!clerk;

        // Use the proper method to check if user is signed in
        if (clerk && clerk.user) {
            isSignedIn = true;
        } else {
            isSignedIn = false;
        }
    }

    function handleSuccessfulAuth() {
        $showAuthModal = false;
        isSignedIn = true;
    }

    function toggleAuthView() {
        $showLogin = !$showLogin;
    }
</script>

<Sidebar {activeUrl} class="bg-gray-50">
    <SidebarWrapper>
        {#if !$clerkReady}
            <div class="flex justify-center p-4">
                <Spinner size="8" />
                <p class="ml-2">Loading authentication...</p>
            </div>
        {:else if clerkLoaded}
            <SidebarGroup>
                <SidebarItem
                    href="#"
                    label="Sync With Cloud"
                    class="bg-gray-800 text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    on:click={() => ($showAuthModal = true)}
                >
                    <svelte:fragment slot="icon">
                        <CloudArrowUpOutline class="w-6 h-6 text-white" />
                    </svelte:fragment>
                </SidebarItem>
            </SidebarGroup>

            <Modal
                bind:open={$showAuthModal}
                title={$showLogin ? "Login" : "Register"}
            >
                <div class="flex flex-col">
                    {#if $showLogin}
                        <Login
                            onCancel={() => ($showAuthModal = false)}
                            onSuccess={handleSuccessfulAuth}
                        />
                        <p class="text-center mt-2">
                            Don't have an account?
                            <button
                                class="text-blue-500"
                                on:click={toggleAuthView}>Register</button
                            >
                        </p>
                    {:else}
                        <Register
                            onCancel={() => ($showAuthModal = false)}
                            onSuccess={handleSuccessfulAuth}
                        />
                        <p class="text-center mt-2">
                            Already have an account?
                            <button
                                class="text-blue-500"
                                on:click={toggleAuthView}>Login</button
                            >
                        </p>
                    {/if}
                </div>
            </Modal>
        {:else}
            <p class="p-3">Authentication service unavailable</p>
        {/if}
        <br />
        <div class="title">ANALOG</div>
        <SidebarGroup>
            <SidebarItem href="/timesheet" label="Timesheet">
                <svelte:fragment slot="icon">
                    <FileSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem href="/time-tracker" label="Time Tracker">
                <svelte:fragment slot="icon">
                    <ClockSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem href="/calendar" label="Calendar">
                <svelte:fragment slot="icon">
                    <CalendarMonthSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem href="/schedule" label="Schedule">
                <svelte:fragment slot="icon">
                    <ListOutline
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem href="/expenses" label="Expenses">
                <svelte:fragment slot="icon">
                    <DollarOutline
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem href="/time-off" label="Time Off">
                <svelte:fragment slot="icon">
                    <SunSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-white"
                    />
                </svelte:fragment>
            </SidebarItem>
        </SidebarGroup>
        <br />
        <div class="title">GENERATE</div>
        <SidebarGroup>
            <SidebarItem href="/invoices" label="Invoices">
                <svelte:fragment slot="icon">
                    <FileImportSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem href="/analyzations" label="Analyzations">
                <svelte:fragment slot="icon">
                    <ChartPieSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem href="/ai-prompts" label="AI Prompts">
                <svelte:fragment slot="icon">
                    <LightbulbSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-white"
                    />
                </svelte:fragment>
            </SidebarItem>
        </SidebarGroup>
        <br />
        <div class="title">MANAGE</div>
        <SidebarGroup>
            <SidebarItem href="/workspaces" label="Workspaces">
                <svelte:fragment slot="icon">
                    <BuildingSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem href="/clients" label="Clients">
                <svelte:fragment slot="icon">
                    <ProfileCardSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem href="/projects" label="Projects">
                <svelte:fragment slot="icon">
                    <ArrowRightOutline
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem href="/team-members" label="Team Members">
                <svelte:fragment slot="icon">
                    <UsersSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem href="/approvals" label="Approvals">
                <svelte:fragment slot="icon">
                    <BadgeCheckSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem href="/tasks" label="Tasks">
                <svelte:fragment slot="icon">
                    <ClipboardListSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-white"
                    />
                </svelte:fragment>
            </SidebarItem>
        </SidebarGroup>
    </SidebarWrapper>
</Sidebar>

<style>
    .title {
        color: #222;
        font-weight: bold;
    }
</style>
