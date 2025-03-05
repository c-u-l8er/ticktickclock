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
    import { ClockOutline } from "flowbite-svelte-icons"; // Import the Clock icon

    let hidden = true;
    $: activeUrl = $page.url.pathname;
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
            <!-- <DropdownDivider />
            <DropdownItem href="/">Sign out</DropdownItem> -->
        </Dropdown>
        <NavLi href="/help">Help</NavLi>
        <NavLi href="/pricing">Pricing</NavLi>
        <NavLi href="/developer-api">Developer API</NavLi>
    </NavUl>
</Navbar>
