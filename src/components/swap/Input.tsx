import Image from "next/image";
import { ArrowDownIcon } from "../../components/swap/icons";
import { twMerge } from "tailwind-merge";

export default function Input(props: any) {
  const { disabled, className } = props;
  return (
    <div
      className={twMerge(
        `flex items-center flex-col bg-dark-60 rounded w-full p-3.5 border border-transparent ${
          disabled ? "" : "hover:border-green-10"
        }`,
        className
      )}
    >
      <div className="flex items-center justify-between w-full gap-2">
        <input
          step="any"
          type="number"
          placeholder="0.0"
          disabled={disabled}
          className="flex-grow w-1 bg-transparent outline-none font-bold text-white text-2xl"
        />
        <div className="flex items-center cursor-pointer flex-shrink-0">
          <Image width="20" height="20" alt="" src="/images/memeMenu.svg" />
          <span className="text-white font-bold text-base ml-1.5 mr-2.5 ">
            NEAR
          </span>
          <ArrowDownIcon className="text-gray-50" />
        </div>
      </div>
      <div className="flex items-center justify-between w-full text-sm text-gray-50 mt-2.5">
        <span>$140.5</span>
        <span>Balance: 123.35</span>
      </div>
      {/* near validation error tip */}
      <div
        className={`flex items-center px-2.5 py-1 bg-yellow-10 bg-opacity-15 rounded text-xs text-yellow-10 w-full mt-3 mb-1.5 ${
          disabled ? "hidden" : ""
        }`}
      >
        Must have 0.2N or more left in wallet for gas fee.
      </div>
    </div>
  );
}
