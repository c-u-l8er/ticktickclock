import Dexie, { type Table } from "dexie";

export interface Client {
  id?: number;
  name: string;
  rate: number;
  contactDetails: string;
}

export interface TimeEntry {
  id?: number;
  clientId: number;
  startTime: Date;
  endTime: Date;
  description: string;
}

export interface Invoice {
  id?: number;
  clientId: number;
  invoiceNumber: string;
  date: string; // or Date if you prefer to store as Date object
  totalAmount: number;
  lineItems: LineItem[];
}

export interface LineItem {
  description: string;
  startTime: string;
  endTime: string;
  rate: number;
  hours: number;
  amount: number;
}

export class TickTickClockDB extends Dexie {
  clients!: Table<Client, number>;
  timeEntries!: Table<TimeEntry, number>;
  invoices!: Table<Invoice, number>;

  constructor() {
    super("TickTickClockDB");
    this.version(2).stores({
      clients: "++id, name, rate, contactDetails",
      timeEntries: "++id, clientId, startTime, endTime, description",
      invoices: "++id, clientId, invoiceNumber, date, totalAmount, lineItems",
    });
  }
}

export const db = new TickTickClockDB();
