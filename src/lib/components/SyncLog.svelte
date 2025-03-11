<script lang="ts">
    import {
        Card,
        Button,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Badge,
    } from "flowbite-svelte";

    export let logs = [];
    export let clearLogs;
</script>

<div class="mt-4">
    <Card padding="xl">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Sync Activity Log</h3>
            <Button color="alternative" size="xs" on:click={clearLogs}
                >Clear Log</Button
            >
        </div>

        {#if logs.length === 0}
            <div class="bg-gray-50 p-4 rounded-lg text-center">
                <p class="text-gray-500">No sync activity recorded yet</p>
            </div>
        {:else}
            <div class="max-h-[400px] overflow-y-auto border rounded-lg">
                <Table>
                    <TableHead>
                        <TableHeadCell>Time</TableHeadCell>
                        <TableHeadCell>Message</TableHeadCell>
                        <TableHeadCell>Type</TableHeadCell>
                    </TableHead>
                    <TableBody>
                        {#each logs as log}
                            <TableBodyRow>
                                <TableBodyCell
                                    >{log.timestamp.toLocaleTimeString()}</TableBodyCell
                                >
                                <TableBodyCell>{log.message}</TableBodyCell>
                                <TableBodyCell>
                                    {#if log.type === "success"}
                                        <Badge color="green">Success</Badge>
                                    {:else if log.type === "error"}
                                        <Badge color="red">Error</Badge>
                                    {:else if log.type === "warning"}
                                        <Badge color="yellow">Warning</Badge>
                                    {:else}
                                        <Badge color="blue">Info</Badge>
                                    {/if}
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            </div>
        {/if}
    </Card>
</div>
