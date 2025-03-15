import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom"; 
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App Component", () => {
  it("muestra el título en la página", () => {
    render(<App />);
    const titleElement = screen.getByText(/Bienvenido al Rafcetario/i);
    expect(titleElement).toBeInTheDocument();
  });
});
