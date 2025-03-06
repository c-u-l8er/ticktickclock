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

<div class="container mx-auto py-8">
    <h1 class="text-2xl font-bold mb-4">Free Invoice Template</h1>
    <p class="mb-4">Make beautiful Invoices with one click!</p>

    <p class="mb-4">
        Welcome to the simple yet eligant Invoice Generator, trusted by millions
        of people. TickTickClock lets you instantly generate invoices with our
        attractive invoice template straight from your web browser. The invoices
        you create can be easily sent and paid online, or downloaded as a
        convenient XLSX file.
    </p>

    <p class="mb-4">
        Did we also mention that TickTickClock lets you generate an unlimited
        number of Invoices?
    </p>

    <a href="/workspaces" class="mt-2">
        <Button class="mt-2">Let's Go!</Button>
    </a>

    <p class="copyright">
        Made by <a href="https://wrand.cc">WRANDTEL</a><br />
        &copy; {new Date().getFullYear()} TickTickClock. All rights reserved.
    </p>
</div>

<style>
    .copyright {
        font-size: 0.8em;
        color: gray;
        margin-top: 20px;
    }
</style>
