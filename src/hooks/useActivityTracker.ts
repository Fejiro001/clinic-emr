import { useEffect } from "react";
import { authService } from "../services/auth";

const useActivityTracker = () => {
  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const updateActivity = () => {
      authService.updateActivity();
    };

    let lastUpdate = 0;
    const throttleUpdate = () => {
      const now = Date.now();
      if (now - lastUpdate > 60000) {
        lastUpdate = now;
        updateActivity();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, throttleUpdate, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttleUpdate);
      });
    };
  }, []);
};

export default useActivityTracker;
