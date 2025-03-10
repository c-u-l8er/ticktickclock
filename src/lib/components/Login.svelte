<script lang="ts">
    import { Button, Input, Label } from "flowbite-svelte";

    export let onCancel;
    export let onSuccess;

    let emailAddress = "";
    let password = "";
    let error = "";
    let isLoading = false;

    async function handleSignIn() {
        isLoading = true;
        error = "";

        try {
            if (!window.Clerk) {
                throw new Error("Authentication service not available");
            }

            console.log("Attempting sign in...");
            // Correct way to use Clerk's sign-in method
            const signInAttempt = await window.Clerk.client.signIn.create({
                identifier: emailAddress,
                password: password,
            });

            console.log("Sign in result:", signInAttempt);

            if (signInAttempt.status === "complete") {
                await window.Clerk.setActive({
                    session: signInAttempt.createdSessionId,
                });
                console.log("✅ Sign in successful");
                isLoading = false;
                onSuccess();
            } else {
                console.log("ℹ️ Sign in status:", signInAttempt.status);
                // Show appropriate message based on status
                if (signInAttempt.status === "needs_second_factor") {
                    error = "Two-factor authentication required";
                } else if (signInAttempt.status === "needs_new_password") {
                    error = "You need to set a new password";
                } else if (signInAttempt.status === "needs_identifier") {
                    error = "Please provide your email address";
                } else {
                    error = `Sign in incomplete: ${signInAttempt.status}`;
                }
                isLoading = false;
            }
        } catch (err) {
            console.error("❌ Sign in error:", err);

            // Extract and display the specific error message from Clerk
            if (err.errors && err.errors.length > 0) {
                // Clerk often returns errors in an array format
                const errorMessages = err.errors
                    .map((e) => e.message || e.longMessage || JSON.stringify(e))
                    .join(". ");
                error = errorMessages;
            } else if (err.message) {
                // Some errors might have a direct message property
                error = err.message;
            } else {
                // Fallback for unexpected error formats
                error =
                    "Sign in failed. Please check your credentials and try again.";
            }

            isLoading = false;
        }
    }
</script>

<form class="flex flex-col space-y-4" on:submit|preventDefault={handleSignIn}>
    {#if error}
        <div
            class="p-4 text-red-500 bg-red-100 border border-red-200 rounded-md"
        >
            {error}
        </div>
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

    <Button type="submit" color="purple" disabled={isLoading}>
        {#if isLoading}
            Signing In...
        {:else}
            Sign In
        {/if}
    </Button>

    <Button type="button" color="alternative" on:click={onCancel}>
        Cancel
    </Button>
</form>
