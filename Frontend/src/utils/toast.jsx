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

// Custom loading toast
export function showLoading(message = "Loading...") {
  return toast.loading(message, {
    style: {
      background: "#e0f2fe", // light blue
      color: "#0369a1",
      border: "1px solid #3b82f6",
    },
  });
}

export function showConfirm(message, onConfirm, onCancel) {
  const toastId = toast.custom((t) => (
    <div
      style={{
        background: " #252525",
        color: "white",
        padding: "1rem",
        borderRadius: "8px",
        border: "1px solid #e66250",
        marginTop: "140px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
        width: "250px",
      }}
    >
      <span style={{ fontSize: "0.95rem" }}>{message}</span>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={() => {
            toast.dismiss(toastId);
            onConfirm();
          }}
          style={{
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Confirm
        </button>
        <button
          onClick={() => {
            toast.dismiss(toastId);
            if (onCancel) onCancel();
          }}
          style={{
            backgroundColor: "#9b2e2e",
            color: "white",
            border: "none",
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  ), {
    duration: Infinity,
    position: "top-center",
  });
}
