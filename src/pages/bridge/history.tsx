import React from "react";
import BridgeHistory from "./views/history";
import BridgeLayout from "@/layout/bridge";

const Page = () => {
  return <BridgeHistory />;
};

Page.customLayout = (page) => <BridgeLayout>{page}</BridgeLayout>;

export default Page;
