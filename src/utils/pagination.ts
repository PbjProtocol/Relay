import type { PaginatedResponse } from "../types/common";
/** Iterates through all pages returned by a loader. */
export async function* paginate<T>(
  loader: (page: number) => Promise<PaginatedResponse<T>>,
  startPage = 1,
): AsyncGenerator<T, void, void> {
  let page = startPage;
  for (;;) {
    const response = await loader(page);
    for (const item of response.data) yield item;
    if (!response.hasMore || response.data.length === 0) return;
    page += 1;
  }
}
