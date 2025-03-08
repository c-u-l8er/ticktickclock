<script lang="ts">
    import { page } from "$app/stores";
    import { db, type TeamMember, type Project, type Client } from "$lib/db";
    import { onMount } from "svelte";
    import AssignTeamMemberToProject from "$lib/components/AssignTeamMemberToProject.svelte";

    let teamMembers: TeamMember[] = [];
    let isLoading = true;
    let error: Error | null = null;
    let project: Project | null = null;
    let client: Client | null = null;

    async function loadData() {
        try {
            isLoading = true;
            error = null;

            const clientId = parseInt($page.params.clientId);
            const projectId = parseInt($page.params.projectId);

            if (isNaN(clientId) || isNaN(projectId)) {
                throw new Error("Invalid client or project ID");
            }

            //Load client, project, and team member data from the db
            const [loadedProject, loadedClient, loadedTeamMembers] =
                await Promise.all([
                    db.projects.get(projectId),
                    db.clients.get(clientId),
                    db.teamMembers.toArray(),
                ]);

            if (!loadedClient) throw new Error(`Client not found`);
            if (!loadedProject) throw new Error(`Project not found`);

            client = loadedClient;
            project = loadedProject;

            //filter all team members, only show team members associated with the project.
            teamMembers = loadedTeamMembers.filter(
                (tm) => /* Logic to check if tm is assigned to project */ true,
            );

            //  **Highly Recommended:** Add a `projectTeamMembers` table (many-to-many relationship).
            //teamMembers = await db.projectTeamMembers.where({ projectId }).toArray();
        } catch (e) {
            console.error("Error loading data:", e);
            error =
                e instanceof Error ? e : new Error("Unknown error occurred");
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        loadData();
    });
</script>

{#if project}
    <!-- Add AssignTeamMemberToProject component here -->
    <AssignTeamMemberToProject projectId={project.id} />
{/if}
