<script lang="ts">
    import { page } from "$app/stores";
    import { db, type TeamMember, type Task } from "$lib/db";
    import { onMount } from "svelte";
    import AssignTeamMemberToTask from "$lib/components/AssignTeamMemberToTask.svelte";

    let teamMembers: TeamMember[] = [];
    let isLoading = true;
    let error: Error | null = null;
    let task: Task | null = null;

    async function loadData() {
        try {
            isLoading = true;
            error = null;

            const taskId = $page.params.taskId;

            const [loadedTask, loadedTeamMembers] = await Promise.all([
                db.tasks.get(taskId),
                db.teamMembers.toArray(),
            ]);

            if (!loadedTask) throw new Error(`Task not found`);

            task = loadedTask;

            //filter all team members, only show team members associated with the task.
            teamMembers = loadedTeamMembers.filter(
                (tm) => /* Logic to check if tm is assigned to task */ true,
            );
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

{#if task}
    <!-- Add AssignTeamMemberToTask component here -->
    <AssignTeamMemberToTask taskId={task.id} />
{/if}
