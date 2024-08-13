import { toast } from "react-toastify";
import getConfig from "@/utils/config";
import { CloseIcon, PopFailedIcon } from "@/components/common/Icons";
const swapFailToast = (txHash: string, errorType?: string) => {
  toast(
    <a
      className="text-error w-full h-full pl-1.5 py-1 flex flex-col text-sm"
      href={`${getConfig().explorerUrl}/txns/${txHash}`}
      target="_blank"
      rel="noopener noreferrer nofollow"
      style={{
        lineHeight: "20px",
      }}
    >
      <span className="flex items-center text-white text-base">
        <span className="mr-2.5">
          <PopFailedIcon />
        </span>

        <span>Transaction failed.</span>
      </span>

      <div
        className="flex flex-col gap-0.5 text-gray-60"
        style={{ paddingLeft: "26px" }}
      >
        <span>Type {errorType}.</span>
        <span
          className="underline decoration-1 hover:text-white"
          style={{
            textDecorationThickness: "1px",
          }}
        >
          Click to view
        </span>
      </div>
    </a>,
    {
      autoClose: false,
      closeOnClick: true,
      hideProgressBar: false,
      closeButton: (
        <CloseIcon size="12" className=" text-dark-80 hover:text-white" />
      ),
      progressStyle: {
        background: "#FF4B76",
        borderRadius: "8px",
        height: "2px",
      },
      style: {
        background: "#1B242C",
        border: "1px solid rgba(151, 151, 151, 0.2)",
        borderRadius: "8px",
      },
    }
  );
};
export default swapFailToast;
