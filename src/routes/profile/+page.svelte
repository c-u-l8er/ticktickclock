<script lang="ts">
    import { onMount } from "svelte";
    import { clerkReady } from "$lib/stores/workspaceStore";
    import { goto } from "$app/navigation";
    import { Button, Heading, Card, Avatar } from "flowbite-svelte";
    import {
        GoogleSolid,
        FacebookSolid,
        LinkedinSolid,
    } from "flowbite-svelte-icons";

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

    // Open Clerk's user profile management UI
    function openClerkUserProfile(initialTab = "account") {
        if (window.Clerk) {
            window.Clerk.openUserProfile({
                appearance: {
                    elements: {
                        userProfilePage: {
                            activeTab: initialTab,
                        },
                    },
                },
            });
        }
    }

    // Helper function to get a nice provider display name
    function getProviderDisplayName(provider) {
        const map = {
            google: "Google",
            facebook: "Facebook",
            linkedin_oidc: "LinkedIn",
            github: "GitHub",
            apple: "Apple",
        };

        return (
            map[provider] ||
            provider.charAt(0).toUpperCase() +
                provider.slice(1).replace("_oidc", "")
        );
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
                                    class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded"
                                >
                                    <!-- Display provider icon -->
                                    {#if account.provider === "google"}
                                        <GoogleSolid
                                            class="w-5 h-5 mr-3 text-red-600"
                                        />
                                    {:else if account.provider === "facebook"}
                                        <FacebookSolid
                                            class="w-5 h-5 mr-3 text-blue-600"
                                        />
                                    {:else if account.provider === "linkedin_oidc"}
                                        <LinkedinSolid
                                            class="w-5 h-5 mr-3 text-blue-700"
                                        />
                                    {:else}
                                        <span
                                            class="w-5 h-5 mr-3 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-bold"
                                        >
                                            {account.provider
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    {/if}

                                    <span class="font-medium"
                                        >{getProviderDisplayName(
                                            account.provider,
                                        )}</span
                                    >
                                    <span class="ml-auto text-sm text-gray-500"
                                        >{account.emailAddress}</span
                                    >
                                </li>
                            {/each}
                        </ul>

                        <!-- Manage connections button -->
                        <div class="mt-4">
                            <Button
                                color="alternative"
                                class="w-full"
                                on:click={() =>
                                    openClerkUserProfile("account-connections")}
                            >
                                Manage Connections
                            </Button>
                        </div>
                    {:else}
                        <p class="text-gray-500 mb-4">No connected accounts</p>

                        <!-- Add connection button -->
                        <Button
                            color="alternative"
                            class="w-full"
                            on:click={() =>
                                openClerkUserProfile("account-connections")}
                        >
                            Add Social Connection
                        </Button>
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
                        color="alternative"
                        on:click={() => openClerkUserProfile("account")}
                    >
                        Manage Account Settings
                    </Button>
                    <Button
                        color="alternative"
                        on:click={() => openClerkUserProfile("security")}
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
