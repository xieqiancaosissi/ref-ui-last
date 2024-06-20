import React from "react";
import { TipIcon } from "../Icons";
import styles from "./tips.module.css";

export default function HoverTip({
  msg,
  extraStyles,
  OhterIcon,
}: {
  msg: string;
  extraStyles?: string;
  OhterIcon?: any;
}) {
  return (
    <div className="w-4 h-4 relative mx-1">
      {
        <div className={styles.iconContainer}>
          {OhterIcon ? <OhterIcon></OhterIcon> : <TipIcon></TipIcon>}
        </div>
      }
      <div className={`${styles.tooltip}  ${extraStyles}`}>{msg}</div>
    </div>
  );
}
