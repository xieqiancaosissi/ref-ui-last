import React, { useState } from "react";
import YoursValue from "@/components/yours/yoursValue";
import YoursTab from "@/components/yours/yoursTabs";

export default function Yours() {
  const [currentModule, setCurrentModule] = useState("pools");
  const sendCurrentModule = (tab: string) => {
    console.log(tab);
    setCurrentModule(tab);
  };
  return (
    <div>
      <div className="h-52">
        {/* value */}
        <YoursValue></YoursValue>
        {/* tab */}
        <YoursTab setCurrentModule={sendCurrentModule}></YoursTab>
      </div>
      {/* main */}
      <div></div>
    </div>
  );
}
