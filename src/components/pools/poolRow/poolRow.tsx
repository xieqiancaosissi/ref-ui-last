import React from "react";
import styles from "./poolRow.module.css";

export default function PoolRow() {
  return (
    <>
      <div className={styles.poolContainer}>
        {/* tokens */}
        <div></div>
        <div>
          {/* fee */}
          <div>7.77%</div>
          {/* apr */}
          <div>
            <span>0.36%</span>
          </div>
          {/* 24h */}
          <div>$0.39</div>
          {/* tvl */}
          <div>$1.89k</div>
        </div>
      </div>
    </>
  );
}
