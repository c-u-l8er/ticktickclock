<script lang="ts">
    import { Card, Accordion, AccordionItem } from "flowbite-svelte";
</script>

<div class="mt-4">
    <Card padding="xl">
        <h3 class="text-lg font-semibold mb-4">Help & Information</h3>

        <Accordion>
            <AccordionItem>
                <span slot="header" class="font-semibold"
                    >How Cloud Sync Works</span
                >
                <div class="space-y-3 text-gray-700 p-4">
                    <p>
                        Cloud Sync allows you to connect your local workspaces
                        and team members with your Clerk organizations and
                        users, making it easier to collaborate and manage your
                        data across devices.
                    </p>
                    <h4 class="font-semibold mt-3">What gets synced:</h4>
                    <ul class="list-disc pl-5 space-y-1">
                        <li>
                            <strong>Workspaces ↔ Organizations:</strong> Your local
                            workspaces can be linked to Clerk organizations
                        </li>
                        <li>
                            <strong>Team Members ↔ Users:</strong> Your local team
                            members can be linked to Clerk users
                        </li>
                    </ul>
                    <h4 class="font-semibold mt-3">Benefits of syncing:</h4>
                    <ul class="list-disc pl-5 space-y-1">
                        <li>Access your data across multiple devices</li>
                        <li>Collaborate with team members in real-time</li>
                        <li>Keep your local data backed up in the cloud</li>
                        <li>Manage permissions and access through Clerk</li>
                    </ul>
                </div>
            </AccordionItem>

            <AccordionItem>
                <span slot="header" class="font-semibold"
                    >Sync Process Steps</span
                >
                <div class="space-y-3 text-gray-700 p-4">
                    <ol class="list-decimal pl-5 space-y-2">
                        <li>Sign in with your Clerk account</li>
                        <li>
                            Review your cloud organizations and local workspaces
                        </li>
                        <li>
                            Use the "Map Workspaces" tool to link workspaces to
                            organizations
                        </li>
                        <li>
                            Use the "Map Team Members" tool to link team members
                            to users
                        </li>
                        <li>Click "Sync Now" to synchronize your data</li>
                        <li>
                            Review the sync log to ensure everything was
                            processed correctly
                        </li>
                    </ol>
                    <p class="mt-2 font-medium">
                        Note: Sync is bidirectional - changes from both local
                        and cloud sources will be merged.
                    </p>
                </div>
            </AccordionItem>

            <AccordionItem>
                <span slot="header" class="font-semibold">Troubleshooting</span>
                <div class="space-y-3 text-gray-700 p-4">
                    <h4 class="font-semibold">Common issues:</h4>
                    <ul class="list-disc pl-5 space-y-2">
                        <li>
                            <strong>Nothing to sync:</strong> Make sure you have
                            created workspaces and team members locally, and that
                            you have organizations in Clerk.
                        </li>
                        <li>
                            <strong>Authentication errors:</strong> Try signing out
                            and signing back in to refresh your authentication token.
                        </li>
                        <li>
                            <strong>Sync conflicts:</strong> If you encounter conflicts
                            during sync, use manual mapping to resolve them.
                        </li>
                        <li>
                            <strong>Organization errors:</strong> If using Clerk's
                            free plan, you'll have limited organization functionality.
                            The app will fall back to using a personal workspace.
                        </li>
                    </ul>
                    <p class="mt-3">
                        If you continue to experience issues, check the sync log
                        for detailed error messages or contact support.
                    </p>
                </div>
            </AccordionItem>

            <AccordionItem>
                <span slot="header" class="font-semibold"
                    >Privacy & Data Security</span
                >
                <div class="space-y-3 text-gray-700 p-4">
                    <p>
                        When you use Cloud Sync, your data is securely
                        transmitted between your local device and Clerk's
                        servers. Here's what you should know about data privacy:
                    </p>
                    <ul class="list-disc pl-5 space-y-2">
                        <li>
                            Your local database remains intact - sync doesn't
                            delete your local data
                        </li>
                        <li>
                            You control what gets synced through the sync
                            options
                        </li>
                        <li>
                            All communication with Clerk is encrypted using
                            HTTPS
                        </li>
                        <li>
                            Your authentication credentials are never stored in
                            your local database
                        </li>
                    </ul>
                </div>
            </AccordionItem>
        </Accordion>
    </Card>
</div>
