// src/api/meals.test.js
import { beforeEach, afterEach, test, expect, vi } from "vitest";
import { getRandomMeal } from "./meals";

beforeEach(() => {
  // mock fetch with vi.fn
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          meals: [{ idMeal: "1", strMeal: "Pizza" }],
        }),
    })
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("getRandomMeal returns one meal from API", async () => {
  const meal = await getRandomMeal();
  expect(fetch).toHaveBeenCalled();
  expect(meal.strMeal).toBe("Pizza");
});
