import { useState } from "react";
import { useNavigate } from "react-router";
import { authService } from "../../services/auth";
import { Button } from "../Common";

const LogoutModal = ({
  setShowLogoutModal,
}: {
  setShowLogoutModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
      setIsLoggingOut(false);
      void navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="modal_inset"></div>

      <div className="modal_parent">
        <div className="modal_bg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Confirm Logout
          </h3>
          <p className="text-gray-700 mb-6">
            Are you sure you want to logout? Any unsaved changes will be lost.
          </p>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              disabled={isLoggingOut}
              onClick={() => {
                setShowLogoutModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={isLoggingOut}
              loadingText="Logging out..."
              onClick={(): void => {
                void handleLogout();
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutModal;
