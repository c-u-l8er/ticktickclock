import Dexie, { type Table } from "dexie";

export interface Workspace {
  id?: number;
  name: string; // Add name to Workspace
  rate?: number; // for time tracking hourly rate hierarchy #5
  clerkOrganizationId?: string; // Assuming Clerk uses string IDs
}

export interface Client {
  id?: number;
  workspaceId: number; // Add workspaceId to Client
  name: string;
  rate: number;
  contactDetails: string;
}

export interface Project {
  id?: number;
  workspaceId: number; // Add workspaceId to Project
  name: string;
  description?: string;
  clientId: number;
  rate: number;
}

export interface TeamMember {
  id?: number;
  workspaceId: number; // Add workspaceId to TeamMember
  name: string; // Add name to TeamMember
  billableRate: number;
  costRate: number;
  role: "admin" | "project manager" | "team manager";
}

export interface TimeEntry {
  id?: number;
  workspaceId: number; // Add workspaceId to TimeEntry
  clientId: number;
  projectId?: number;
  teamMemberId: number; // Add teamMemberId to TimeEntry
  startTime: Date;
  endTime: Date;
  description: string;
}

export interface Invoice {
  id?: number;
  workspaceId: number; // Add workspaceId to Invoice
  clientId: number;
  invoiceNumber: string;
  date: string;
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
  workspaces!: Table<Workspace, number>;
  clients!: Table<Client, number>;
  projects!: Table<Project, number>;
  teamMembers!: Table<TeamMember, number>;
  timeEntries!: Table<TimeEntry, number>;
  invoices!: Table<Invoice, number>;

  constructor() {
    super("TickTickClockDB");
    this.version(4).stores({
      // Increment the version number!
      workspaces: "++id, name, rate, clerkOrganizationId",
      clients: "++id, workspaceId, name, rate, contactDetails",
      projects: "++id, workspaceId, name, description, clientId",
      teamMembers: "++id, workspaceId, name, billableRate, costRate, role",
      timeEntries:
        "++id, workspaceId, clientId, projectId, teamMemberId, startTime, endTime, description",
      invoices:
        "++id, workspaceId, clientId, invoiceNumber, date, totalAmount, lineItems",
    });
  }
}

export const db = new TickTickClockDB();
