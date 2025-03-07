<script lang="ts">
    import { page } from "$app/stores";
    import { db, type Invoice, type Client, type Project } from "$lib/db";
    import { onMount } from "svelte";
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";

    let invoices: Invoice[] = [];
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

            //Load client and project data from the db
            const [loadedProject, loadedClient, loadedInvoices] =
                await Promise.all([
                    db.projects.get(projectId),
                    db.clients.get(clientId),
                    db.invoices.where("projectId").equals(projectId).toArray(),
                ]);

            if (!loadedClient) throw new Error(`Client not found`);
            if (!loadedProject) throw new Error(`Project not found`);

            client = loadedClient;
            project = loadedProject;
            invoices = loadedInvoices;
            console.log(invoices);
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

<br />
{#if isLoading}
    <div class="flex justify-center">
        <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
        ></div>
    </div>
{:else if error}
    <div class="text-red-500">
        <p>Error: {error.message}</p>
        <button
            class="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            on:click={loadData}
        >
            Retry
        </button>
    </div>
{:else if client && project}
    {#if invoices.length > 0}
        <Table hoverable={true}>
            <TableHead>
                <TableHeadCell>Invoice Number</TableHeadCell>
                <TableHeadCell>Date</TableHeadCell>
                <TableHeadCell>Total Amount</TableHeadCell>
            </TableHead>
            <TableBody>
                {#each invoices as invoice (invoice.id)}
                    <TableBodyRow>
                        <TableBodyCell>{invoice.invoiceNumber}</TableBodyCell>
                        <TableBodyCell>{invoice.date}</TableBodyCell>
                        <TableBodyCell
                            >${invoice.totalAmount.toFixed(2)}</TableBodyCell
                        >
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <p>No invoices generated for this project yet.</p>
    {/if}
{/if}
