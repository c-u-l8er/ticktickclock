<script lang="ts">
    import { Button, Input, Label } from "flowbite-svelte";
    import { clerkFrontendApi, clerkReady } from "$lib/stores/workspaceStore";
    import { get } from "svelte/store";
    import { onMount } from "svelte";

    export let onCancel;
    export let onSuccess;

    let emailAddress = "";
    let password = "";
    let error = "";
    let isLoading = false;
    let isInitialized = false;

    onMount(() => {
        // Check if Clerk is already initialized
        const clerk = get(clerkFrontendApi);
        isInitialized = clerk?.loaded ?? false;

        // Subscribe to changes in clerk readiness
        const unsubscribe = clerkReady.subscribe((ready) => {
            isInitialized = ready;
        });

        return () => {
            unsubscribe();
        };
    });

    async function waitForClerk(timeout = 5000): Promise<boolean> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const clerk = get(clerkFrontendApi);
            if (clerk?.loaded && clerk.signIn) {
                return true;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        return false;
    }

    async function handleSignIn() {
        isLoading = true;
        error = "";

        try {
            // Wait for Clerk to be ready
            const isReady = await waitForClerk();
            if (!isReady) {
                throw new Error("Authentication service failed to initialize");
            }

            const clerk = get(clerkFrontendApi);
            if (!clerk?.signIn) {
                throw new Error("Authentication service not available");
            }

            console.log("Attempting sign in...");
            const result = await clerk.signIn.create({
                identifier: emailAddress,
                password,
            });

            console.log("Sign in result:", result);

            if (result.status === "complete") {
                console.log("✅ Sign in successful");
                isLoading = false;
                onSuccess();
            } else {
                console.log("ℹ️ Sign in status:", result.status);
                throw new Error(`Sign in incomplete: ${result.status}`);
            }
        } catch (err: any) {
            console.error("❌ Sign in error:", err);
            error = err.message;
            isLoading = false;
        }
    }
</script>

<form class="flex flex-col space-y-4" on:submit|preventDefault={handleSignIn}>
    {#if error}
        <p class="text-red-500">{error}</p>
    {/if}

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

    <Button type="submit" color="purple" disabled={isLoading || !isInitialized}>
        {#if isLoading}
            Signing In...
        {:else if !isInitialized}
            Waiting for Authentication...
        {:else}
            Sign In
        {/if}
    </Button>

    <Button type="button" color="alternative" on:click={onCancel}>
        Cancel
    </Button>
</form>
