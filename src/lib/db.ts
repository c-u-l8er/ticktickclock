import Dexie, { type Table } from "dexie";

export interface Client {
  id?: number;
  name: string;
  rate: number;
  contactDetails: string;
}

export interface Project {
  id?: number;
  name: string;
  description?: string;
  clientId: number; // Add clientId to Project
}

export interface TimeEntry {
  id?: number;
  clientId: number;
  projectId?: number; // Add projectId (optional, could be null)
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
  projects!: Table<Project, number>; // Add projects table
  timeEntries!: Table<TimeEntry, number>;
  invoices!: Table<Invoice, number>;

  constructor() {
    super("TickTickClockDB");
    this.version(3).stores({
      // Increment the version number!
      clients: "++id, name, rate, contactDetails",
      projects: "++id, name, description, clientId", // Define projects table
      timeEntries: "++id, clientId, projectId, startTime, endTime, description", // Include projectId in index
      invoices: "++id, clientId, invoiceNumber, date, totalAmount, lineItems",
    });
  }
}

export const db = new TickTickClockDB();
