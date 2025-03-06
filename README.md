ticktickclock
========

### main navigation
ANALOG:
- Timesheet
- Time Tracker
- Calendar
- Schedule
- Expenses
- Time Off

GENERATE:
- AI Prompts
- Analyzations
- Invoices

MANAGE:
- Workspaces
- Clients
- Projects
- Team Members
- Approvals

### business model
hourly rate hierarchy:
- 1. projects' team member rate
- 2. task rate
- 3. project rate
- 4. team member rate
- 5. workspace rate

### data model
#### workspaces
properties for each workspace:
- rate // for time tracking hourly rate hierarchy #5

integrates with clerk.com organizations
for each workspace there are many:
- groups
- clients
- client.projects
- teamMembers
- teamMember.workSchedules // for project work assignment and payroll work-proofs for the workspace analyzations
- teamMember.timeOffSchedules // for project free-time assignment and payroll vacations for the workspace analyzations
- timeEntries // for billing the client
- invoices // for marking expenses, timeEntries, and teamMember schedules as paid
- analyzations // for reports and stats on billability, quotability, and profitability
- tasks
- calendarEvents
- expenses

#### groups
properties for each group:
- name

for each group there are many:
- teamMembers

#### clients
properties for each client:
- contactDetails
- rate // for time tracking hourly rate hierarchy #3

for each client there are many:
- projects
- timeEntries
- invoices

#### client.projects
properties for each client project:
- rate // for time tracking hourly rate hierarchy #3

for each project there are many:
- timeEntries
- teamMembers // for project access
- tasks

#### teamMembers
properties for each team member:
- billableRate // for time tracking hourly rate hierarchy #4
- costRate // for the rate at which this team member charges the workspace
- role // admin, project manager, or team manager

for each team member there is one:
- group

for each team member there are many:
- projects // for project assignments
- workSchedules // for assignment date-time trackable slots
- timeOffSchedules // for assignment date-time break slots

#### teamMember.workSchedules
for each team member work schedule there is one:
- calendarEvent

#### teamMember.timeOffSchedules
for each team member time off schedule there is one:
- calendarEvent

#### timeEntries
properties for each time entry:
- isBillable
- startTime
- endTime
- description

for each time entry there is one:
- client
- calendarEvent // for reportability
- teamMember

#### invoices
properties for each invoice:
- isPaid
- invoiceNumber
- totalAmount

for each invoice there are many:
- timeEntries
- expenses

for each invoice there is one:
- client
- project
- calendarEvent // for billability and profitability analyzation

#### analyzations
properties for each analyzation:
- kind // billability, quotability, or profitability
- startDatetime
- endDatetime

for each analyzation there is one:
- client
- project (optional)

for each analyzation there are many:
- workSchedules // for quatability
- expenses // for billability
- timeEntries // for billability
- invoices // for profitability

#### tasks
properties for each task:
- rate // for time tracking hourly rate hierarchy #2
- teamMember.rate // for time tracking hourly rate hierarchy #1

for each task there is one:
- project

for each task there are many:
- invoices
- teamMembers // for assignment

#### calendarEvents
for each calendar event there are many:
- timeEntries
- workSchedules
- timeOffSchedules
- invoices

#### expenses
properties for each expense:
- isBillable
- amount

for each expense there is one:
- client
- project
- invoice

#### approvals
properties for each approval:
- status // pending, approved, rejected, withdrawn

for each approval there is one:
- teamMemberRequester // teamMember, that is not a team manager, who looks for approval
- teamMemberGuard // teamMember, that is a team manager, who is doing the approval

for each task there are many:
- workSchedules // for approval
- timeOffSchedules // for approval
- expenses // for approval
