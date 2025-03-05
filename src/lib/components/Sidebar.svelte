<script>
    import { page } from "$app/stores";
    import {
        Sidebar,
        SidebarGroup,
        SidebarItem,
        SidebarWrapper,
    } from "flowbite-svelte";
    import {
        ChartPieSolid,
        UserSolid,
        ClockSolid,
        EnvelopeSolid,
        FileDocSolid,
    } from "flowbite-svelte-icons"; // Replace with your desired icons
    let spanClass = "flex-1 ms-3 whitespace-nowrap";
    $: activeUrl = $page.url.pathname;
</script>

<Sidebar {activeUrl}>
    <SidebarWrapper>
        <SidebarGroup>
            <SidebarItem href="/" label="Dashboard" active={activeUrl === "/"}>
                <svelte:fragment slot="icon">
                    <ChartPieSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem
                href="/clients"
                label="Clients"
                active={activeUrl === "/clients"}
            >
                <svelte:fragment slot="icon">
                    <UserSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem
                href="/time-tracker"
                label="Time Tracker"
                active={activeUrl === "/time-tracker"}
            >
                <svelte:fragment slot="icon">
                    <ClockSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem
                href="/invoices"
                label="Invoices"
                active={activeUrl === "/invoices"}
            >
                <svelte:fragment slot="icon">
                    <EnvelopeSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
        </SidebarGroup>
    </SidebarWrapper>
</Sidebar>
