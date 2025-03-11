<script lang="ts">
    import { Button, Input, Label } from "flowbite-svelte";
    import {
        FacebookSolid,
        GoogleSolid,
        LinkedinSolid,
    } from "flowbite-svelte-icons";

    export let onCancel;
    export let onSuccess;

    let emailAddress = "";
    let password = "";
    let error = "";
    let isLoading = false;
    let ssoLoading = "";

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

    async function handleSSOSignIn(provider) {
        try {
            if (!window.Clerk) {
                throw new Error("Authentication service not available");
            }

            ssoLoading = provider;
            console.log(`Attempting sign in with ${provider}...`);

            // Start the OAuth flow with the selected provider
            await window.Clerk.openSignIn({
                afterSignInUrl: window.location.href,
                signInUrl: window.location.href,
                redirectUrl: window.location.href,
                appearance: {
                    elements: {
                        // Hide Clerk's header and footer since we're using our own UI
                        header: "hidden",
                        footer: "hidden",
                    },
                },
                // Only show the selected provider
                signIn: {
                    firstFactorUrl: null,
                    identifier: null,
                    socialProviderStrategies: [provider],
                },
            });
        } catch (err) {
            console.error(`❌ ${provider} sign in error:`, err);
            error = `Failed to sign in with ${provider}. Please try again.`;
            ssoLoading = "";
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

    <!-- SSO Options -->
    <div class="flex flex-col space-y-3">
        <Button
            type="button"
            color="alternative"
            class="flex items-center justify-center"
            disabled={ssoLoading === "google"}
            on:click={() => handleSSOSignIn("google")}
        >
            <GoogleSolid class="mr-2 w-5 h-5" />
            {ssoLoading === "google" ? "Connecting..." : "Continue with Google"}
        </Button>

        <Button
            type="button"
            color="alternative"
            class="flex items-center justify-center"
            disabled={ssoLoading === "facebook"}
            on:click={() => handleSSOSignIn("facebook")}
        >
            <FacebookSolid class="mr-2 w-5 h-5 text-blue-600" />
            {ssoLoading === "facebook"
                ? "Connecting..."
                : "Continue with Facebook"}
        </Button>

        <Button
            type="button"
            color="alternative"
            class="flex items-center justify-center"
            disabled={ssoLoading === "linkedin"}
            on:click={() => handleSSOSignIn("linkedin_oidc")}
        >
            <LinkedinSolid class="mr-2 w-5 h-5 text-blue-700" />
            {ssoLoading === "linkedin_oidc"
                ? "Connecting..."
                : "Continue with LinkedIn"}
        </Button>
    </div>

    <div class="relative flex items-center">
        <hr class="w-full border-gray-300" />
        <span
            class="absolute left-1/2 px-3 bg-white -translate-x-1/2 text-gray-500 text-sm"
            >or</span
        >
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
    <div class="text-right">
        <a
            href="https://learning-starfish-18.accounts.dev"
            target="_blank"
            class="text-sm text-blue-600 hover:underline"
        >
            Forgot password?
        </a>
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
