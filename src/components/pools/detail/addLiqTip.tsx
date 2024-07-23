import React from "react";

export default function AddLiqTip(props: any) {
  const { tips } = props;
  return (
    <div
      className="h-13 w-full px-3 py-1 rounded border text-white text-sm my-2"
      style={{
        borderColor: "rgba(154, 249, 1, 0.6)",
        background: "rgba(154, 249, 1, 0.1)",
      }}
    >
      👀 {tips}
    </div>
  );
}
