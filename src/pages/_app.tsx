import "@/styles/globals.css";
import { IntlProvider } from "react-intl";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Menu from "../components/menu";

const Footer = dynamic(() => import("../components/footer"), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
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
