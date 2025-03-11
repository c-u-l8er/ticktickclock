import { db, type Task } from "$lib/db";

export async function load({ params }) {
  const teamMemberId = params.teamMemberId;

  const taskTeamMembers = await db.taskTeamMembers
    .where("teamMemberId")
    .equals(teamMemberId)
    .toArray();

  const taskIds = taskTeamMembers.map((ttm) => ttm.taskId);

  const tasks: Task[] = await db.tasks.where("id").anyOf(taskIds).toArray();

  return {
    tasks,
  };
}
