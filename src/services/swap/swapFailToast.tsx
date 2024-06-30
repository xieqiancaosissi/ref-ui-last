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
        className="flex items-center gap-2 text-gray-60"
        style={{ paddingLeft: "26px" }}
      >
        <span className="whitespace-nowrap">Type {errorType}.</span>
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
        <CloseIcon
          className=" text-dark-80 hover:text-white"
          style={{ transform: "scale(0.85)" }}
        />
      ),
      progressStyle: {
        background: "#FF4B76",
        borderRadius: "8px",
      },
      style: {
        background: "rgba(151, 151, 151, 0.2)",
        boxShadow: "0px 0px 10px 10px rgba(0, 0, 0, 0.15)",
        borderRadius: "8px",
      },
    }
  );
};
export default swapFailToast;
