import { useEffect, useState } from "react";
import { Rainbow, WalletCedeBridge } from "./icons2";

export default function Bridge() {
  const [hover, setHover] = useState<boolean>(false);
  const bridgeList = [
    {
      icon: <Rainbow />,
      name: "Rainbow",
      link: "https://rainbowbridge.app/transfer",
    },
    {
      icon: <WalletCedeBridge />,
      name: "CEX Bridge",
      link: "https://send.cede.store/?tokenSymbol=NEAR&network=near&source=ref_finance",
    },
  ];
  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-center justify-center lg:h-9 xsm:h-[26px] rounded text-sm font-bold text-gray-10 px-2.5 cursor-pointer border border-gray-70 hover:text-white">
        BRIDGE
      </div>
      {hover ? (
        <div className="absolute" style={{ paddingTop: "10px", top: "30px" }}>
          <div className="flex flex-col gap-2 border border-gray-200 bg-dark-140 p-2 rounded-lg whitespace-nowrap text-sm text-gray-10">
            {bridgeList.map((b) => {
              return (
                <div
                  key={b.name}
                  className="flex items-center gap-2 rounded cursor-pointer hover:bg-gray-20 hover:text-white px-4 py-2"
                  onClick={() => {
                    window.open(b.link);
                  }}
                >
                  {b.icon}
                  {b.name}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
