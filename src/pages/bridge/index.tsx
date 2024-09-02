import React from "react";
import BridgeEntry from "./views/entry";
import BridgeLayout from "@/layout/bridge";

const Page = () => {
  return <BridgeEntry />;
};

Page.customLayout = (page) => <BridgeLayout>{page}</BridgeLayout>;

export default Page;
