import { toast } from "react-toastify";
import getConfig from "@/utils/config";
import { CloseIcon, PopSuccessfulIcon } from "@/components/common/Icons";
import { ONLY_ZEROS } from "@/utils/numbers";
const limitOrderSuccessPopUp = ({
  tokenSymbol,
  swapAmount,
  limitOrderAmount,
  txHash,
  swapAmountOut,
  tokenOutSymbol,
}: {
  tokenSymbol: string;
  swapAmount: string;
  limitOrderAmount: string;
  txHash: string;
  swapAmountOut?: string;
  tokenOutSymbol?: string;
}) => {
  toast(
    <a
      className="text-white w-full h-full pl-1.5 text-base flex flex-wrap items-center"
      href={`${getConfig().explorerUrl}/txns/${txHash}`}
      target="_blank"
      rel="noopener noreferrer nofollow"
    >
      <span className="mr-2.5 self-start relative" style={{ top: "6px" }}>
        <PopSuccessfulIcon />
      </span>
      {!ONLY_ZEROS.test(swapAmount || "0") && (
        <span className="mr-1 flex flex-col whitespace-nowrap">
          <span>
            {ONLY_ZEROS.test(limitOrderAmount || "0") ? (
              <>Limit order filled.</>
            ) : (
              <>Limit order partially filled.</>
            )}
          </span>

          {
            <span className="">{`Sold ${swapAmount} ${tokenSymbol} for ${swapAmountOut} ${tokenOutSymbol}.`}</span>
          }
        </span>
      )}
      {ONLY_ZEROS.test(swapAmount || "0") && (
        <span className="mr-6 ">Limit order created.</span>
      )}

      <span
        className="underline decoration-1 text-gray-60 hover:text-white"
        style={{
          textDecorationThickness: "1px",
          paddingLeft: "26px",
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
export default limitOrderSuccessPopUp;
