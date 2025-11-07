import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "../authStore";
import { mockUser } from "../../test/mocks/mockData";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("should set user and mark as authenticated", () => {
    const { setUser } = useAuthStore.getState();

    setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("should logout the user and clear user", () => {
    const { setUser, logout } = useAuthStore.getState();

    // Set the user first
    setUser(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Then logout
    logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should check user role", () => {
    const { setUser, hasRole } = useAuthStore.getState();

    // Set the user first
    setUser(mockUser);

    expect(hasRole("doctor")).toBe(true);
    expect(hasRole("nurse")).toBe(false);
    expect(hasRole(["doctor", "nurse"])).toBe(true);
  });

  it("should update last activity", () => {
    const { updateLastActivity } = useAuthStore.getState();
    const before = useAuthStore.getState().lastActivity;

    setTimeout(() => {
      updateLastActivity();
      const after = useAuthStore.getState().lastActivity;
      expect(after).toBeGreaterThan(before);
    }, 1000);
  });
});
