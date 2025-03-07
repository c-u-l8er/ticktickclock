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

export interface Task {
  id?: number;
  projectId: number; // Foreign key to the Project table
  name: string;
  description?: string;
  rate?: number; // Hourly rate for the task, optional
  teamMemberId?: number; //optional team member,
  status: "open" | "in progress" | "completed" | "blocked"; //example status values
}

export interface TimeEntry {
  id?: number;
  workspaceId: number; // Add workspaceId to TimeEntry
  clientId: number;
  projectId?: number;
  taskId?: number; // NEW: Foreign key to the Task table
  teamMemberId: number; // Add teamMemberId to TimeEntry
  startTime: Date;
  endTime: Date;
  description: string;
}

export interface Invoice {
  id?: number;
  workspaceId: number; // Add workspaceId to Invoice
  clientId: number;
  projectId?: number; //Foreign key to project.
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
  tasks!: Table<Task, number>;
  invoices!: Table<Invoice, number>;

  private static instance: TickTickClockDB;
  private initializationPromise: Promise<boolean> | null = null;

  constructor() {
    super("TickTickClockDB");
    this.version(5).stores({
      //Increment version number!
      workspaces: "++id, name, rate, clerkOrganizationId",
      clients: "++id, workspaceId, name, rate, contactDetails",
      projects: "++id, workspaceId, name, description, clientId, rate",
      teamMembers: "++id, workspaceId, name, billableRate, costRate, role",
      tasks: "++id, projectId, name, description, rate, teamMemberId, status", // Define index for tasks
      timeEntries:
        "++id, workspaceId, clientId, projectId, taskId, teamMemberId, startTime, endTime, description",
      invoices:
        "++id, workspaceId, clientId, projectId, invoiceNumber, date, totalAmount, lineItems",
    });
  }

  static getInstance(): TickTickClockDB {
    if (!TickTickClockDB.instance) {
      TickTickClockDB.instance = new TickTickClockDB();
    }
    return TickTickClockDB.instance;
  }

  async initialize() {
    if (!this.initializationPromise) {
      this.initializationPromise = new Promise(async (resolve) => {
        try {
          await this.open();
          console.log("Database initialized successfully");
          resolve(true);
        } catch (error) {
          console.error("Database initialization error:", error);
          resolve(false);
        }
      });
    }
    return this.initializationPromise;
  }

  async waitForReady(maxAttempts = 3, delayMs = 1000): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const isReady = await this.initialize();
      if (isReady) return true;

      if (attempt < maxAttempts) {
        console.log(
          `Retrying database initialization (attempt ${attempt + 1}/${maxAttempts})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    return false;
  }
}
// Only create the database instance in the browser
const db = typeof window !== "undefined" ? new TickTickClockDB() : null;

export { db };
