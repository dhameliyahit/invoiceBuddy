import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Default config for your project
const defaultConfig = {
  confirmButtonColor: "#4F46E5", // Tailwind indigo-600
  cancelButtonColor: "#EF4444", // Tailwind red-500
  buttonsStyling: true,
};

export const alertSuccess = (title = "Success!", text = "") => {
  return MySwal.fire({
    ...defaultConfig,
    icon: "success",
    title,
    text,
  });
};

export const alertError = (title = "Error!", text = "") => {
  return MySwal.fire({
    ...defaultConfig,
    icon: "error",
    title,
    text,
  });
};

export const alertConfirm = async (title = "Are you sure?", text = "") => {
  const result = await MySwal.fire({
    ...defaultConfig,
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  });

  return result.isConfirmed;
};
