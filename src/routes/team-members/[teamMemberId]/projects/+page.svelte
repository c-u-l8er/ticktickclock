<script lang="ts">
    import { goto } from "$app/navigation";
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Button,
    } from "flowbite-svelte";
    export let data;

    function viewProject(clientId: number, projectId: number) {
        goto(`/clients/${clientId}/projects/${projectId}/details`);
    }
</script>

<div class="p-4">
    {#if data.projects.length > 0}
        <Table hoverable={true}>
            <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody>
                {#each data.projects as project (project.id)}
                    <TableBodyRow>
                        <TableBodyCell>{project.name}</TableBodyCell>
                        <TableBodyCell>{project.description}</TableBodyCell>
                        <TableBodyCell>
                            <Button
                                size="xs"
                                on:click={() =>
                                    viewProject(project.clientId, project.id)}
                                >View</Button
                            >
                        </TableBodyCell>
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <p>No projects assigned to this team member yet.</p>
    {/if}
</div>
