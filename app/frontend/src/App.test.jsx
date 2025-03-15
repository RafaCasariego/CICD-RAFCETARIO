import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom"; 
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App Component", () => {
  it("muestra el título en la página", () => {
    render(<App />);
    const titleElement = screen.getByRole("heading", { level: 1 });
    expect(titleElement).toBeInTheDocument();
  });
});