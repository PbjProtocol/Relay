import { vi } from "vitest";
export const wallet = "11111111111111111111111111111111";
export function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}
export function fetchMock(...responses: Response[]): typeof fetch {
  const mock = vi.fn();
  responses.forEach((response) => mock.mockResolvedValueOnce(response));
  return mock as unknown as typeof fetch;
}
