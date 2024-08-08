import React from "react";
import styles from "./index.module.css";
import { ExclamationIcon } from "@/components/common/Icons";
export default function DocTips({ tips, src }: { tips: string; src: string }) {
  return (
    <div className={`${styles.dclTips}`}>
      <div className="flex items-center lg:pl-4 xsm:pl-2">
        <ExclamationIcon className="flex-shrink-0" />
        <span className="mx-1">
          {tips} &nbsp;
          <span
            className={styles.learnMore}
            onClick={() => {
              window.open(src, "_blank");
            }}
          >
            Learn more
          </span>
        </span>
      </div>
    </div>
  );
}
