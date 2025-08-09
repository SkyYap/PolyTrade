import { toast } from "react-hot-toast";

export const copyToClipboardWithToast = (text: string, label: string = "Text") => {
  navigator.clipboard.writeText(text).then(() => {
    toast.success(`${label} copied to clipboard!`, {
      duration: 2000,
      position: 'bottom-center',
    });
  }).catch(() => {
    toast.error(`Failed to copy ${label.toLowerCase()}`, {
      duration: 2000,
      position: 'bottom-center',
    });
  });
};

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-center',
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-center',
  });
};
