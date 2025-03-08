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
    {#if data.timeEntries.length > 0}
        <Table hoverable={true}>
            <TableHead>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Start Time</TableHeadCell>
                <TableHeadCell>End Time</TableHeadCell>
            </TableHead>
            <TableBody>
                {#each data.timeEntries as entry (entry.id)}
                    <TableBodyRow>
                        <TableBodyCell>{entry.description}</TableBodyCell>
                        <TableBodyCell
                            >{new Date(
                                entry.startTime,
                            ).toLocaleString()}</TableBodyCell
                        >
                        <TableBodyCell
                            >{new Date(
                                entry.endTime,
                            ).toLocaleString()}</TableBodyCell
                        >
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <p>No time entries recorded for this team member yet.</p>
    {/if}
</div>
