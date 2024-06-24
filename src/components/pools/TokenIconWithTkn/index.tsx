import React from "react";
import styles from "./index.module.css";
import { NearIcon, DangerousIcon, TknIcon } from "@/components/pools/icon";
import { useRiskTokens } from "@/hooks/useRiskTokens";
import tokenIcons from "@/utils/tokenIconConfig";
import Tips from "@/components/common/Tips/index";

export const TokenIconComponent = ({
  ite,
  tokenIcons,
  pureIdList,
  ind,
}: {
  ite: any;
  tokenIcons: any;
  pureIdList: any;
  ind: number;
}) => {
  const hasCustomIcon = Reflect.has(tokenIcons, ite.tokenId);
  const isNearToken = ite.tokenId === "wrap.near";
  const iconStyle = { width: "26px", height: "26px" };

  if (hasCustomIcon && !isNearToken) {
    return (
      <div className={`relative`}>
        <img src={tokenIcons[ite.tokenId]} alt="" style={iconStyle} />
        {pureIdList.includes(ite.tokenId) && (
          <TknIcon
            className="absolute z-10"
            style={{
              bottom: "0px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        )}
      </div>
    );
  }

  if (isNearToken) {
    return <NearIcon style={iconStyle} />;
  }

  return (
    <div className={`relative z-${ind + 2}`}>
      <img src={ite.icon} alt="" style={iconStyle} />
      {pureIdList.includes(ite.tokenId) && (
        <TknIcon
          className="absolute"
          style={{
            bottom: "0px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      )}
    </div>
  );
};
