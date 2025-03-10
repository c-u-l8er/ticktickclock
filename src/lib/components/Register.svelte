<script lang="ts">
    import { Button, Input, Label } from "flowbite-svelte";
    import { clerkFrontendApi } from "$lib/stores/workspaceStore";
    import { get } from "svelte/store";
    import { onMount } from "svelte";

    export let onCancel;
    export let onSuccess;

    let emailAddress = "";
    let password = "";
    let firstName = "";
    let lastName = "";
    let error = "";
    let isLoading = false;

    let clerkReady = false;

    // Use onMount to check if clerk is initialized
    onMount(() => {
        const clerk = get(clerkFrontendApi);
        clerkReady = !!clerk && !!clerk.signUp;
        if (!clerkReady) {
            error = "Clerk not fully ready yet.  Trying again soon.";
            // Use a setTimeout to retry after a delay
            setTimeout(() => {
                const clerkNow = get(clerkFrontendApi);
                clerkReady = !!clerkNow && !!clerkNow.signUp;
                if (!clerkReady) {
                    error = "Clerk still not ready.";
                }
            }, 1000); // Adjust delay if necessary
        }
    });

    async function handleSignUp() {
        isLoading = true;
        error = "";

        const clerk = get(clerkFrontendApi);
        if (!clerk || !clerk.signUp) {
            error = "Clerk not initialized properly.";
            isLoading = false;
            return;
        }

        try {
            const result = await clerk.signUp.create({
                emailAddress,
                password,
                firstName,
                lastName,
            });

            if (result.status === "complete") {
                console.log("Registered!");
                isLoading = false;
                onSuccess(); // Call the callback
            } else {
                console.log("SignUp Status", result.status);
                error = "Registration failed";
                isLoading = false;
            }
        } catch (err: any) {
            error = err.message;
            isLoading = false;
        }
    }
</script>

<form class="flex flex-col space-y-4" on:submit|preventDefault={handleSignUp}>
    {#if error}
        <p class="text-red-500">{error}</p>
    {/if}
    <div>
        <Label for="firstName">First Name:</Label>
        <Input
            type="text"
            id="firstName"
            placeholder="First Name"
            required
            bind:value={firstName}
        />
    </div>
    <div>
        <Label for="lastName">Last Name:</Label>
        <Input
            type="text"
            id="lastName"
            placeholder="Last Name"
            required
            bind:value={lastName}
        />
    </div>
    <div>
        <Label for="email">Email:</Label>
        <Input
            type="email"
            id="email"
            placeholder="Your email"
            required
            bind:value={emailAddress}
        />
    </div>
    <div>
        <Label for="password">Password:</Label>
        <Input
            type="password"
            id="password"
            placeholder="Your password"
            required
            bind:value={password}
        />
    </div>
    <Button type="submit" color="purple" disabled={isLoading || !clerkReady}>
        {#if isLoading}
            Registering...
        {:else if !clerkReady}
            Loading Clerk...
        {:else}
            Register
        {/if}
    </Button>
    <Button type="button" color="alternative" on:click={onCancel}>Cancel</Button
    >
</form>
