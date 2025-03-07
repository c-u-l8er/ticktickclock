export const ssr = false;

export function load({ parent }) {
  return parent();
}
