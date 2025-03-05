<script lang="ts">
    import {
        db,
        type Client,
        type TimeEntry,
        type Invoice,
        type LineItem,
    } from "./db";
    import { onMount } from "svelte";
    import {
        Button,
        Label,
        Select,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Input,
    } from "flowbite-svelte";
    import * as XLSX from "xlsx";

    let clients: Client[] = [];
    let selectedClient: number | null = null;
    let timeEntries: TimeEntry[] = [];
    let invoiceNumber: string = "";
    let invoiceDate: string = new Date().toISOString().slice(0, 10); // Today's date in YYYY-MM-DD format
    let invoice: Invoice | null = null;
    let lineItems: LineItem[] = [];

    onMount(async () => {
        clients = await db.clients.toArray();
    });

    async function generateInvoice() {
        if (!selectedClient) {
            alert("Please select a client.");
            return;
        }

        timeEntries = await db.timeEntries
            .where("clientId")
            .equals(selectedClient)
            .toArray();

        let totalAmount: number = 0;
        lineItems = [];

        for (const entry of timeEntries) {
            const client = clients.find((c) => c.id === entry.clientId);
            if (client) {
                const duration =
                    (new Date(entry.endTime).getTime() -
                        new Date(entry.startTime).getTime()) /
                    (1000 * 60 * 60); // Duration in hours
                const amount = duration * client.rate;
                totalAmount += amount;

                lineItems.push({
                    description: entry.description,
                    startTime: new Date(entry.startTime).toLocaleString(),
                    endTime: new Date(entry.endTime).toLocaleString(),
                    rate: client.rate,
                    hours: duration,
                    amount: amount,
                });
            }
        }

        invoice = {
            clientId: selectedClient,
            invoiceNumber: invoiceNumber,
            date: invoiceDate,
            totalAmount: totalAmount,
            lineItems: lineItems,
        };

        // TODO: Save the invoice to the database if needed
    }

    function downloadInvoice() {
        if (!invoice) {
            alert("Generate invoice first.");
            return;
        }

        const invoiceData = lineItems.map((item) => ({
            Description: item.description,
            "Start Time": item.startTime,
            "End Time": item.endTime,
            Rate: item.rate,
            Hours: item.hours,
            Amount: item.amount,
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(invoiceData);
        XLSX.utils.book_append_sheet(wb, ws, "Invoice");
        XLSX.writeFile(wb, `invoice_${invoiceNumber}.xlsx`);
    }

    // Removed downloadInvoiceAsHtml function
</script>

<div class="p-4">
    <h2 class="text-xl font-bold mb-4">Invoice Generator</h2>

    <div class="mb-4">
        <Label class="block mb-2">Client:</Label>
        <Select bind:value={selectedClient} class="w-full">
            <option value={null}>Select a client</option>
            {#each clients as client (client.id)}
                <option value={client.id}>{client.name}</option>
            {/each}
        </Select>
    </div>

    <div class="mb-4">
        <Label class="block mb-2">Invoice Number:</Label>
        <Input type="text" bind:value={invoiceNumber} class="w-full" />
    </div>
    <div class="mb-4">
        <Label class="block mb-2">Invoice Date:</Label>
        <Input type="date" bind:value={invoiceDate} class="w-full" />
    </div>
    <Button
        on:click={generateInvoice}
        disabled={!selectedClient || !invoiceNumber}>Generate Invoice</Button
    >

    <br />
    <br />
    {#if invoice}
        <div class="mb-4">
            <h3 class="text-lg font-semibold mb-2">Invoice Preview</h3>
            <p>
                Client: {clients.find((c) => c.id === invoice.clientId)?.name}
            </p>
            <p>Invoice Number: {invoice.invoiceNumber}</p>
            <p>Date: {invoice.date}</p>
            <Table id="invoiceTable">
                <TableHead>
                    <TableHeadCell>Description</TableHeadCell>
                    <TableHeadCell>Start Time</TableHeadCell>
                    <TableHeadCell>End Time</TableHeadCell>
                    <TableHeadCell>Rate</TableHeadCell>
                    <TableHeadCell>Hours</TableHeadCell>
                    <TableHeadCell>Amount</TableHeadCell>
                </TableHead>
                <TableBody>
                    {#each lineItems as item (item.description + item.startTime + item.endTime)}
                        <TableBodyRow>
                            <TableBodyCell>{item.description}</TableBodyCell>
                            <TableBodyCell>{item.startTime}</TableBodyCell>
                            <TableBodyCell>{item.endTime}</TableBodyCell>
                            <TableBodyCell>${item.rate}</TableBodyCell>
                            <TableBodyCell
                                >{item.hours.toFixed(2)}</TableBodyCell
                            >
                            <TableBodyCell
                                >${item.amount.toFixed(2)}</TableBodyCell
                            >
                        </TableBodyRow>
                    {/each}
                </TableBody>
            </Table>
            <p>Total: ${invoice.totalAmount.toFixed(2)}</p>

            <Button on:click={downloadInvoice}>Download Invoice (XLSX)</Button>
        </div>
    {/if}
</div>
