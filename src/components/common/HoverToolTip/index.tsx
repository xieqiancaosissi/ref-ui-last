import React, { useState } from "react";
import styles from "./index.module.css";

const HoverTooltip = ({
  children,
  tooltipText,
}: {
  children: any;
  tooltipText: string;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div
      className={styles.hoverTooltipContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {showTooltip && <div className={styles.hoverTooltip}>{tooltipText}</div>}
    </div>
  );
};

export default HoverTooltip;
