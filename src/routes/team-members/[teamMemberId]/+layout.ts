import { db, type TeamMember } from "$lib/db";

export async function load({ params }) {
  const teamMemberId = params.teamMemberId;
  const teamMember = await db.teamMembers.get(teamMemberId);

  if (!teamMember) {
    throw new Error("Team member not found");
  }

  return {
    teamMember,
    teamMemberId,
  };
}
