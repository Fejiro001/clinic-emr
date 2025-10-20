import { useState } from "react";

export const useAuth = () => {
  const [user] = useState(null);
  const [loading] = useState(false);
  const [error] = useState(null);

  return { user, error, loading };
};
