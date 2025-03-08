import { db, type Project } from "$lib/db";

export async function load({ params }) {
  const teamMemberId = parseInt(params.teamMemberId);

  const projectTeamMembers = await db.projectTeamMembers
    .where("teamMemberId")
    .equals(teamMemberId)
    .toArray();

  const projectIds = projectTeamMembers.map((ptm) => ptm.projectId);

  const projects: Project[] = await db.projects
    .where("id")
    .anyOf(projectIds)
    .toArray();

  return {
    projects,
  };
}
