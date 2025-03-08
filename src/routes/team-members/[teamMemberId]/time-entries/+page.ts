import { db, type TimeEntry } from "$lib/db";

export async function load({ params }) {
  const teamMemberId = parseInt(params.teamMemberId);

  const timeEntries: TimeEntry[] = await db.timeEntries
    .where("teamMemberId")
    .equals(teamMemberId)
    .toArray();

  return {
    timeEntries,
  };
}
