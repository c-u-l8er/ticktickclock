<script>
    import { page } from "$app/stores";
    import {
        Sidebar,
        SidebarGroup,
        SidebarItem,
        SidebarWrapper,
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
        CalendarMonthSolid, // Calendar icon
        FileSolid, // Document for Timesheet
        ListOutline, // List for Schedule
        DollarOutline, // Wallet for Expenses
        SunSolid, // Sun for Time Off
    } from "flowbite-svelte-icons"; // Replace with your desired icons
    let spanClass = "flex-1 ms-3 whitespace-nowrap";
    $: activeUrl = $page.url.pathname;
</script>

<Sidebar {activeUrl} class="bg-gray-50">
    <SidebarWrapper>
        <SidebarGroup>
            <SidebarItem
                href="/auth"
                label="Sync With Cloud"
                active={activeUrl === "/auth"}
                class="bg-gray-800 text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
                <svelte:fragment slot="icon">
                    <CloudArrowUpOutline class="w-6 h-6 text-white" />
                </svelte:fragment>
            </SidebarItem>
        </SidebarGroup>
        <br />
        <div class="title">ANALOG</div>
        <SidebarGroup>
            <SidebarItem
                href="/timesheet"
                label="Timesheet"
                active={activeUrl === "/timesheet"}
            >
                <svelte:fragment slot="icon">
                    <FileSolid
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
                href="/calendar"
                label="Calendar"
                active={activeUrl === "/calendar"}
            >
                <svelte:fragment slot="icon">
                    <CalendarMonthSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem
                href="/schedule"
                label="Schedule"
                active={activeUrl === "/schedule"}
            >
                <svelte:fragment slot="icon">
                    <ListOutline
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem
                href="/expenses"
                label="Expenses"
                active={activeUrl === "/expenses"}
            >
                <svelte:fragment slot="icon">
                    <DollarOutline
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem
                href="/time-off"
                label="Time Off"
                active={activeUrl === "/time-off"}
            >
                <svelte:fragment slot="icon">
                    <SunSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
        </SidebarGroup>
        <br />
        <div class="title">GENERATE</div>
        <SidebarGroup>
            <SidebarItem
                href="/invoices"
                label="Invoices"
                active={activeUrl === "/invoices"}
            >
                <svelte:fragment slot="icon">
                    <FileImportSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem
                href="/analyzations"
                label="Analyzations"
                active={activeUrl === "/analyzations"}
            >
                <svelte:fragment slot="icon">
                    <ChartPieSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem
                href="/ai-prompts"
                label="AI Prompts"
                active={activeUrl === "/ai-prompts"}
            >
                <svelte:fragment slot="icon">
                    <LightbulbSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
        </SidebarGroup>
        <br />
        <div class="title">MANAGE</div>
        <SidebarGroup>
            <SidebarItem
                href="/workspaces"
                label="Workspaces"
                active={activeUrl === "/workspaces"}
            >
                <svelte:fragment slot="icon">
                    <BuildingSolid
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
                    <ProfileCardSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem
                href="/projects"
                label="Projects"
                active={activeUrl === "/projects"}
            >
                <svelte:fragment slot="icon">
                    <ArrowRightOutline
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem
                href="/team-members"
                label="Team Members"
                active={activeUrl === "/team-members"}
            >
                <svelte:fragment slot="icon">
                    <UsersSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem
                href="/approvals"
                label="Approvals"
                active={activeUrl === "/approvals"}
            >
                <svelte:fragment slot="icon">
                    <BadgeCheckSolid
                        class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
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
