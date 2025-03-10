<script lang="ts">
    import { onMount } from "svelte";
    import { clerkReady } from "$lib/stores/workspaceStore";
    import { goto } from "$app/navigation";
    import { Button, Heading, Card, Avatar } from "flowbite-svelte";

    let user: any = null;
    let isLoading = true;

    onMount(() => {
        // Check if Clerk is already in the window object
        checkClerkStatus();

        // Set up a listener to check Clerk's status when clerkReady changes
        const unsubscribe = clerkReady.subscribe((ready) => {
            if (ready) {
                checkClerkStatus();
            }
        });

        return unsubscribe;
    });

    function checkClerkStatus() {
        isLoading = true;
        const clerk = window.Clerk;

        if (clerk && clerk.user) {
            user = clerk.user;
            isLoading = false;
        } else {
            // Redirect to home page if user is not signed in
            goto("/");
        }
    }

    function signOut() {
        if (window.Clerk) {
            window.Clerk.signOut().then(() => {
                goto("/");
            });
        }
    }
</script>

<div class="max-w-4xl mx-auto my-8 px-4">
    <Heading tag="h1" class="mb-6">Your Profile</Heading>

    {#if isLoading}
        <p>Loading user profile...</p>
    {:else if user}
        <div class="flex flex-col md:flex-row gap-8 w-full">
            <!-- Main Content - Force to take remaining width -->
            <div class="w-full">
                <Heading tag="h3" class="mb-4">Account Information</Heading>

                <div class="grid md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                        <h4 class="text-sm font-semibold text-gray-500">
                            Email
                        </h4>
                        <p>{user.primaryEmailAddress?.emailAddress}</p>
                    </div>

                    <div>
                        <h4 class="text-sm font-semibold text-gray-500">
                            First Name
                        </h4>
                        <p>{user.firstName || "Not set"}</p>
                    </div>

                    <div>
                        <h4 class="text-sm font-semibold text-gray-500">
                            Last Name
                        </h4>
                        <p>{user.lastName || "Not set"}</p>
                    </div>

                    <div>
                        <h4 class="text-sm font-semibold text-gray-500">
                            Created
                        </h4>
                        <p>
                            {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div>
                        <h4 class="text-sm font-semibold text-gray-500">
                            Last Active
                        </h4>
                        <p>
                            {new Date(user.lastActiveAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div>
                        <h4 class="text-sm font-semibold text-gray-500">
                            User ID
                        </h4>
                        <p class="text-xs font-mono">{user.id}</p>
                    </div>
                </div>

                <hr class="my-6 border-gray-200 dark:border-gray-700" />

                <Heading tag="h3" class="mb-4">Connected Accounts</Heading>

                <div class="mb-6">
                    {#if user.externalAccounts && user.externalAccounts.length > 0}
                        <ul class="space-y-2">
                            {#each user.externalAccounts as account}
                                <li
                                    class="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
                                >
                                    <span class="font-medium"
                                        >{account.provider}</span
                                    >
                                    <span class="ml-auto text-sm text-gray-500"
                                        >{account.emailAddress}</span
                                    >
                                </li>
                            {/each}
                        </ul>
                    {:else}
                        <p class="text-gray-500">No connected accounts</p>
                    {/if}
                </div>

                <Heading tag="h3" class="mb-4">Security</Heading>

                <div class="space-y-4 mb-6">
                    <div>
                        <h4 class="text-sm font-semibold text-gray-500">
                            Two-Factor Authentication
                        </h4>
                        <p>
                            {user.twoFactorEnabled ? "Enabled" : "Not enabled"}
                        </p>
                    </div>
                </div>

                <div class="flex flex-wrap gap-4 mt-8">
                    <Button
                        href="https://learning-starfish-18.accounts.dev/user"
                        target="_blank"
                    >
                        Manage Account Settings
                    </Button>
                    <Button
                        color="alternative"
                        href="https://learning-starfish-18.accounts.dev/user/security"
                        target="_blank"
                    >
                        Security Settings
                    </Button>
                </div>
            </div>

            <!-- Sidebar-like Card -->
            <div class="md:w-64 flex-shrink-0">
                <Card padding="xl" class="sticky top-4 w-full">
                    <div class="flex flex-col items-center text-center">
                        <Avatar src={user.imageUrl} size="xl" class="mb-4" />
                        <Heading tag="h3" class="mb-1"
                            >{user.fullName || "User"}</Heading
                        >
                        <p class="text-gray-500 mb-4">
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                        <Button color="red" class="w-full" on:click={signOut}
                            >Sign Out</Button
                        >
                    </div>
                </Card>
            </div>
        </div>
    {:else}
        <p>Not signed in. Please sign in to view your profile.</p>
    {/if}
</div>
