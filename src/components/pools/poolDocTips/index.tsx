import React from "react";
import styles from "./index.module.css";
import { ExclamationIcon } from "@/components/common/Icons";
export default function DocTips({ tips, src }: { tips: string; src: string }) {
  return (
    <div className={styles.dclTips}>
      <div className="pl-4">
        <ExclamationIcon />
        <span className="mx-1">{tips}</span>
        <span
          className={styles.learnMore}
          onClick={() => {
            window.open(src, "_blank");
          }}
        >
          Learn more
        </span>
      </div>
    </div>
  );
}
