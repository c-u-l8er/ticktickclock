export const ssr = false;

export async function load({ params }) {
  return {
    clientId: params.clientId,
    projectId: params.projectId,
  };
}
