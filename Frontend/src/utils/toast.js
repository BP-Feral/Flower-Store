import { toast } from "react-hot-toast";

// Custom success toast
export function showSuccess(message) {
  toast.success(message, {
    duration: 3000,
    style: {
      background: "#d1fae5", // pastel green
      color: "#065f46",
      border: "1px solid #10b981",
    },
    iconTheme: {
      primary: "#10b981",
      secondary: "#ffffff",
    },
  });
}

// Custom error toast
export function showError(message) {
  toast.error(message, {
    duration: 4000,
    style: {
      background: "#fee2e2", // pastel red
      color: "#991b1b",
      border: "1px solid #ef4444",
    },
    iconTheme: {
      primary: "#ef4444",
      secondary: "#ffffff",
    },
  });
}

// Optional: Custom loading toast
export function showLoading(message = "Loading...") {
  return toast.loading(message, {
    style: {
      background: "#e0f2fe", // light blue
      color: "#0369a1",
      border: "1px solid #3b82f6",
    },
  });
}
