// src/pages/Home.test.jsx
import { test, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";
import * as api from "../api/meals";

test("renders featured meal after loading", async () => {
  // Mock API to return a single meal
  vi.spyOn(api, "getRandomMeal").mockResolvedValueOnce({ idMeal: "1", strMeal: "Burger" });

  // Render inside a Router so useNavigate() works
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  // if you show a loading message initially, this asserts that
  const loading = screen.queryByText(/loading/i);
  if (loading) expect(loading).toBeInTheDocument();

  // Wait for component to show the mocked meal name
  await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
});
