<script lang="ts">
    import { Button, Input, Label } from "flowbite-svelte";

    export let onCancel;
    export let onSuccess;

    let emailAddress = "";
    let password = "";
    let firstName = "";
    let lastName = "";
    let error = "";
    let isLoading = false;

    async function handleSignUp() {
        isLoading = true;
        error = "";

        try {
            if (!window.Clerk) {
                throw new Error("Authentication service not available");
            }

            const signUpAttempt = await window.Clerk.client.signUp.create({
                emailAddress,
                password,
                firstName,
                lastName,
            });

            if (signUpAttempt.status === "complete") {
                // If sign-up is complete, set the session active
                await window.Clerk.setActive({
                    session: signUpAttempt.createdSessionId,
                });
                console.log("Registered successfully!");
                isLoading = false;
                onSuccess();
            } else {
                console.log("SignUp Status", signUpAttempt.status);

                // Show appropriate message based on status
                if (signUpAttempt.status === "needs_email_verification") {
                    error = "Please check your email to verify your account";
                } else if (signUpAttempt.status === "abandoned") {
                    error =
                        "Your registration was abandoned. Please try again.";
                } else {
                    error = `Registration incomplete: ${signUpAttempt.status}`;
                }

                isLoading = false;
            }
        } catch (err) {
            console.error("Registration error:", err);

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
                    "Registration failed. Please check your information and try again.";
            }

            isLoading = false;
        }
    }
</script>

<form class="flex flex-col space-y-4" on:submit|preventDefault={handleSignUp}>
    {#if error}
        <div
            class="p-4 text-red-500 bg-red-100 border border-red-200 rounded-md"
        >
            {error}
        </div>
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
    <Button type="submit" color="purple" disabled={isLoading}>
        {#if isLoading}
            Registering...
        {:else}
            Register
        {/if}
    </Button>
    <Button type="button" color="alternative" on:click={onCancel}>Cancel</Button
    >
</form>
