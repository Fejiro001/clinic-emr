import "@testing-library/jest-dom";
import { afterEach, expect, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Mock Electron APIs (since we're in jsdom, not Electron)
global.window.db = {
  query: vi.fn(),
  queryOne: vi.fn(),
  execute: vi.fn(),
  transaction: vi.fn(),
};

global.window.auth = {
  saveToken: vi.fn(),
  getToken: vi.fn(),
  clearToken: vi.fn(),
  hasToken: vi.fn(),
  saveUserProfile: vi.fn(),
  getUserProfile: vi.fn(),
};

global.window.network = {
  isOnline: vi.fn(),
  checkConnectivity: vi.fn(),
  onOnline: vi.fn(),
  onOffline: vi.fn(),
};
