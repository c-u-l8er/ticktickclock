<script lang="ts">
    import { db, type Invoice, type Client } from "$lib/db";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Tabs,
        TabItem,
    } from "flowbite-svelte";
    import { ProfileCardSolid } from "flowbite-svelte-icons";

    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";

    export let data: PageData; // Add this line
    export const component = data.component;

    let invoices: Invoice[] = [];
    let clientId: number;
    let client: Client | null = null;

    onMount(async () => {
        clientId = $page.params.clientId;
        client = await db.clients.get(clientId);
        await fetchInvoices();
    });

    async function fetchInvoices() {
        invoices = await db.invoices
            .where("clientId")
            .equals(clientId)
            .toArray();
    }
</script>

<div class="p-4">
    <h2 class="text-2xl font-bold mb-4 flex items-center">
        <ProfileCardSolid class="w-6 h-6 mr-2" />
        <a href="/clients">Client Management</a>
        &nbsp;/ {client?.name}
    </h2>
    <Tabs tabStyle="pill">
        <TabItem
            activeClasses="bg-purple-700 rounded-lg p-3 text-white"
            title="Details"
            on:click={() => goto(`/clients/${clientId}`)}
        ></TabItem>
        <TabItem
            activeClasses="bg-purple-700 rounded-lg p-3 text-white"
            title="Projects"
            on:click={() => goto(`/clients/${clientId}/projects`)}
        ></TabItem>
        <TabItem
            activeClasses="bg-purple-700 rounded-lg p-3 text-white"
            open
            title="Invoices"
        >
            {#if invoices.length > 0}
                <Table>
                    <TableHead>
                        <TableHeadCell>Invoice Number</TableHeadCell>
                        <TableHeadCell>Date</TableHeadCell>
                        <TableHeadCell>Total Amount</TableHeadCell>
                        <TableHeadCell>Actions</TableHeadCell>
                    </TableHead>
                    <TableBody>
                        {#each invoices as invoice (invoice.id)}
                            <TableBodyRow>
                                <TableBodyCell
                                    >{invoice.invoiceNumber}</TableBodyCell
                                >
                                <TableBodyCell>{invoice.date}</TableBodyCell>
                                <TableBodyCell
                                    >${invoice.totalAmount.toFixed(
                                        2,
                                    )}</TableBodyCell
                                >
                                <TableBodyCell></TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            {:else}
                <p>No invoices found for this client.</p>
            {/if}
        </TabItem>
    </Tabs>
    <br />
    <br />
</div>
