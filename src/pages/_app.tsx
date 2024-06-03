import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Menu from "../components/menu";
import Footer from "../components/footer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col bg-primaryDark min-h-screen">
      <Menu />
      <div className="flex-grow">
        <Component {...pageProps} />
      </div>
      <Footer />
    </div>
  );
}
