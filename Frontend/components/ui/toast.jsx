import { toast } from "react-hot-toast";

export const showToast = ({ type, message = "", id = undefined }) => {
  switch (type) {
    case "loading":
      return toast.loading(message || "Please wait...", { id });

    case "success":
      return toast.success(message || "Success!", { id });

    case "error":
      return toast.error(message || "Something went wrong!", { id });

    default:
      return;
  }
};
