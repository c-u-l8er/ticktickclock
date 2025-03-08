<script lang="ts">
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";
    export let data;
</script>

<div class="p-4">
    {#if data.projects.length > 0}
        <Table hoverable={true}>
            <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
            </TableHead>
            <TableBody>
                {#each data.projects as project (project.id)}
                    <TableBodyRow>
                        <TableBodyCell>{project.name}</TableBodyCell>
                        <TableBodyCell>{project.description}</TableBodyCell>
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <p>No projects assigned to this team member yet.</p>
    {/if}
</div>
