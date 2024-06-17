import React from "react";
import { TipIcon } from "../Icons";
import styles from "./tips.module.css";
import { style } from "d3";

export default function HoverTip({ msg }: { msg: string }) {
  return (
    <div className="w-4 h-4 relative mx-1">
      <div className={styles.iconContainer}>
        <TipIcon></TipIcon>
      </div>
      <div className={styles.tooltip}>{msg}</div>
    </div>
  );
}
