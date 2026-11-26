import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { installMatchMedia } from "./media";

installMatchMedia();

afterEach(() => {
  cleanup();
  localStorage.clear();
});
