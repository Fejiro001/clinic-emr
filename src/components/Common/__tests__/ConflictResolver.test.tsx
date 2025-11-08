import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  waitFor,
} from "../../../test/utils/testHelpers";
import userEvent from "@testing-library/user-event";
import ConflictResolver from "../ConflictResolver";
import { conflictResolutionService } from "../../../services/conflictResolution";
import { mockConflict, mockUser } from "../../../test/mocks/mockData";
import { useAuthStore } from "../../../store/authStore";

vi.mock("../../../services/conflictResolution", () => ({
  conflictResolutionService: {
    getUnresolvedConflicts: vi.fn(),
    resolveConflict: vi.fn(),
  },
}));

describe("ConflictResolver", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
    });
  });

  it("should not render when closed", () => {
    renderWithProviders(
      <ConflictResolver isOpen={false} onClose={mockOnClose} />
    );

    expect(screen.queryByText("Sync Conflicts")).not.toBeInTheDocument();
  });

  it("should render conflicts when open", async () => {
    vi.mocked(
      conflictResolutionService.getUnresolvedConflicts
    ).mockResolvedValue([mockConflict]);

    renderWithProviders(
      <ConflictResolver isOpen={true} onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText("Sync Conflicts")).toBeInTheDocument();
    });
  });

  it("should show 'no conflicts' message when empty", async () => {
    vi.mocked(
      conflictResolutionService.getUnresolvedConflicts
    ).mockResolvedValue([]);

    renderWithProviders(
      <ConflictResolver isOpen={true} onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText(/No conflicts to resolve!/i)).toBeInTheDocument();
    });
  });

  it("should call resolveConflict when user clicks 'Use Local'", async () => {
    const user = userEvent.setup();

    vi.mocked(
      conflictResolutionService.getUnresolvedConflicts
    ).mockResolvedValue([mockConflict]);
    vi.mocked(conflictResolutionService.resolveConflict).mockResolvedValue();

    renderWithProviders(
      <ConflictResolver isOpen={true} onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText("patients")).toBeInTheDocument();
    });

    const showDetailsButton = screen.getByText("Show Details");
    await user.click(showDetailsButton);

    const useLocalButton = screen.getByText("Use Local");
    await user.click(useLocalButton);

    await waitFor(() => {
      expect(conflictResolutionService.resolveConflict).toHaveBeenCalledWith(
        mockConflict.id,
        "local",
        mockUser.id
      );
    });
  });
});
