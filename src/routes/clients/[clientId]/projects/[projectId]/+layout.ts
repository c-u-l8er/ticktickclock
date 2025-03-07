export const ssr = false;

export async function load({ params }) {
  return {
    clientId: parseInt(params.clientId),
    projectId: parseInt(params.projectId),
  };
}
