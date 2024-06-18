import React from "react";
import { TipIcon } from "../Icons";
import styles from "./tips.module.css";
import { style } from "d3";

export default function HoverTip({
  msg,
  extraStyles,
}: {
  msg: string;
  extraStyles?: string;
}) {
  console.log(extraStyles);
  return (
    <div className="w-4 h-4 relative mx-1">
      <div className={styles.iconContainer}>
        <TipIcon></TipIcon>
      </div>
      <div className={`${styles.tooltip}  ${extraStyles}`}>{msg}</div>
    </div>
  );
}
