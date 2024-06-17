import "@/styles/globals.css";
import { IntlProvider } from "react-intl";
import type { AppProps } from "next/app";
import Modal from "react-modal";
import dynamic from "next/dynamic";
import Menu from "../components/menu";
import { useEffect } from "react";
import getConfig from "../utils/config";
import "../components/common/ModalDefaultStyle";
const Footer = dynamic(() => import("../components/footer"), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    UIInit();
    DBInit();
  }, []);
  function UIInit() {
    Modal.setAppElement("#root");
  }
  function DBInit() {
    const myWorker = new Worker(new URL("../db/worker.ts", import.meta.url), {
      type: "module",
    });
    sendWorkerData(myWorker);
  }
  function sendWorkerData(myWorker: Worker) {
    const config = getConfig();
    myWorker.postMessage({
      config,
    });
  }
  return (
    <IntlProvider messages={{}} locale={"en"}>
      <div className="flex flex-col bg-primaryDark min-h-screen">
        <Menu />
        <div className="flex-grow">
          <Component {...pageProps} />
        </div>
        <Footer />
      </div>
    </IntlProvider>
  );
}
