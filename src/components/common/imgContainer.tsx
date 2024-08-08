import { TokenMetadata } from "@/services/ft-contract";
import { getRiskTagByToken } from "@/utils/commonUtil";
import { RiskIcon } from "./SelectTokenModal/Icons";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import { isMobile } from "@/utils/device";
export function TokenImgWithRiskTag({
  token,
  size,
}: {
  token: TokenMetadata;
  size?: string;
}) {
  const riskTag = getRiskTagByToken(token);
  return (
    <div
      className="flex items-center justify-center relative overflow-hidden rounded-full border border-gray-110"
      style={{
        width: `${size || 28}px`,
        height: `${size || 28}px`,
      }}
    >
      <img
        className="flex-shrink-0"
        src={token.icon || "/images/placeholder.svg"}
        alt=""
      />
      {riskTag ? (
        <span
          className="flex items-center justify-center italic text-white bg-black bg-opacity-70 absolute bottom-0"
          style={{ width: `${size || 28}px`, height: "10px" }}
        >
          <label
            className="text-sm block transform scale-50 relative font-extrabold"
            style={{ left: "-1px" }}
          >
            {riskTag}
          </label>
        </span>
      ) : null}
    </div>
  );
}
export function RiskTipIcon() {
  const mobile = isMobile();
  if (mobile) return <RiskIcon />;
  function riskTip() {
    return `
    <div class="text-gray-110 text-xs text-left">
    Uncertified token, higher risk.
    </div>
    `;
  }
  const random = Math.random();
  const markId = "tknTipId" + random;
  return (
    <div
      className="text-white text-right"
      data-class="reactTip"
      data-tooltip-id={markId}
      data-place="top"
      data-tooltip-html={riskTip()}
    >
      <RiskIcon />
      <CustomTooltip id={markId} style={{ background: "#1B242C" }} />
    </div>
  );
}
