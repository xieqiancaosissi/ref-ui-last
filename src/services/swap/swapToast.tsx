import { toast } from "react-toastify";
import getConfig from "@/utils/config";
import { CloseIcon, PopSuccessfulIcon } from "@/components/common/Icons";
const swapToast = (txHash: string) => {
  toast(
    <a
      className="text-white w-full h-full pl-1.5 text-base flex flex-wrap items-center"
      href={`${getConfig().explorerUrl}/txns/${txHash}`}
      target="_blank"
      rel="noopener noreferrer nofollow"
      style={{
        lineHeight: "40px",
      }}
    >
      <span className="mr-2.5 ">
        <PopSuccessfulIcon />
      </span>
      <span className="mr-1">Swap successfully.</span>
      <span
        className="underline"
        style={{
          textDecorationThickness: "1px",
        }}
      >
        Click to view
      </span>
    </a>,
    {
      autoClose: 8000,
      closeOnClick: true,
      hideProgressBar: false,
      closeButton: (
        <CloseIcon className=" text-dark-80 hover:text-white" size="12" />
      ),
      progressStyle: {
        background: "#9DFD01",
        borderRadius: "8px",
      },
      style: {
        background: "rgba(151, 151, 151, 0.2)",
        boxShadow: "0px 0px 10px 10px rgba(0, 0, 0, 0.15)",
        borderRadius: "8px",
        minHeight: "0px",
      },
    }
  );
};
export default swapToast;
