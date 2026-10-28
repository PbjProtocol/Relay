import { describe, expect, it } from "vitest";
import { paginate } from "../src/utils/pagination";
describe("paginate", () => {
  it("iterates until hasMore is false", async () => {
    const found: number[] = [];
    for await (const item of paginate(async (page) => ({
      data: [page],
      page,
      limit: 1,
      total: 2,
      hasMore: page < 2,
    })))
      found.push(item);
    expect(found).toEqual([1, 2]);
  });
});
