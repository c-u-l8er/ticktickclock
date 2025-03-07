<script lang="ts">
    import { onMount } from "svelte";
    import { Button } from "flowbite-svelte";

    onMount(() => {
        document.title = "TickTickClock - Free Invoice Generator";
    });
</script>

<svelte:head>
    <title>TickTickClock - Free Invoice Generator</title>
    <meta
        name="description"
        content="Generate beautiful invoices instantly with TickTickClock's free invoice template. Trusted by millions, send and download invoices with ease."
    />
</svelte:head>

<div class="flex items-center justify-center min-h-screen">
    <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-2xl"
    >
        <h1 class="text-2xl font-bold mb-4">Free Invoice Template</h1>
        <p class="mb-4">Make beautiful Invoices with one click!</p>

        <p class="mb-4">
            Welcome to the simple and sophisticated Invoice Generator, trusted
            by those who care. TickTickClock lets you instantly generate
            invoices, analyzations, and AI prompts with our attractive analog
            controls straight from your web browser.
            <br />
            <br />
            The invoices that you create can be easily sent and paid online, or downloaded
            as a convenient XLSX file. The AI prompts that you create can be run
            anywhere and the analyzations that you create will transform your business.
        </p>

        <p class="mb-4">
            Did we also mention that TickTickClock lets you generate an
            unlimited number of Invoices?
        </p>

        <a href="/workspaces" class="mt-2">
            <Button class="mt-2">Let's Go!</Button>
        </a>

        <p class="copyright mt-6 text-sm text-gray-500 dark:text-gray-400">
            Made by <a href="https://wrand.cc" class="hover:underline"
                >WRANDTEL</a
            ><br />
            &copy; {new Date().getFullYear()} TickTickClock. All rights reserved.
        </p>
    </div>
</div>
