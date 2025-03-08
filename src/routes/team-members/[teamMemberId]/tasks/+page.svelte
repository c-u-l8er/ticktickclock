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
    {#if data.tasks.length > 0}
        <Table hoverable={true}>
            <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
            </TableHead>
            <TableBody>
                {#each data.tasks as task (task.id)}
                    <TableBodyRow>
                        <TableBodyCell>{task.name}</TableBodyCell>
                        <TableBodyCell>{task.description}</TableBodyCell>
                        <TableBodyCell>{task.status}</TableBodyCell>
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <p>No tasks assigned to this team member yet.</p>
    {/if}
</div>
