// src/pages/QuickRecipes.test.jsx
import { test, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import QuickRecipes from "./QuickRecipes";
import * as api from "../api/meals";

test("renders multiple meals after fetching", async () => {
  const fakeMeals = [
    { idMeal: "1", strMeal: "Pasta" },
    { idMeal: "2", strMeal: "Salad" },
    { idMeal: "3", strMeal: "Soup" },
  ];

  // Mock getRandomMeal to return three items in sequence
  vi.spyOn(api, "getRandomMeal")
    .mockResolvedValueOnce(fakeMeals[0])
    .mockResolvedValueOnce(fakeMeals[1])
    .mockResolvedValueOnce(fakeMeals[2]);

  render(
    <MemoryRouter>
      <QuickRecipes />
    </MemoryRouter>
  );

  const loading = screen.queryByText(/loading/i);
  if (loading) expect(loading).toBeInTheDocument();

  await waitFor(() => expect(screen.getByText("Pasta")).toBeInTheDocument());
  expect(screen.getByText("Salad")).toBeInTheDocument();
  expect(screen.getByText("Soup")).toBeInTheDocument();
});
