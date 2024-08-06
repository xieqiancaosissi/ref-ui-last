import dynamic from "next/dynamic";

export default function RefPanelMobillePage() {
  const RefPanelMobilePage = dynamic(() => import("./RefPanelMobilePage"), {
    ssr: false,
  });
  return <RefPanelMobilePage />;
}
