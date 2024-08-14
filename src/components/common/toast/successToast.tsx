import { toast } from "react-toastify";
import { CloseIcon, PopSuccessfulIcon } from "@/components/common/Icons";
const successToast = (successText?: string) => {
  toast(
    <div>
      <div className="flex items-center gap-1.5">
        <PopSuccessfulIcon />
        <span className="text-white tetx-base font-bold">
          Transaction Successful
        </span>
      </div>
      {successText ? (
        <div className="text-gray-60 text-sm pl-6 mt-1">{successText}</div>
      ) : null}
    </div>,
    {
      autoClose: 8000,
      closeOnClick: true,
      hideProgressBar: false,
      closeButton: (
        <CloseIcon
          size="12"
          className="relative top-2 right-1 text-dark-80 hover:text-white flex-shrink-0"
        />
      ),
      progressStyle: {
        background: "#9DFD01",
        borderRadius: "8px",
        height: "2px",
      },
      style: {
        borderRadius: "8px",
        background: "#1B242C",
        border: "1px solid rgba(151, 151, 151, 0.2)",
        padding: "6px 10px 8px 6px",
      },
    }
  );
};
export default successToast;
