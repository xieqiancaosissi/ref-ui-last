import { ToastContainer } from "react-toastify";
import { isMobile } from "@/utils/device";
import "react-toastify/dist/ReactToastify.css";
export default function ToastContainerEle() {
  return (
    <ToastContainer
      // newestOnTop={
      //   window.location.pathname.startsWith("/orderbook") ? true : false
      // }
      style={{
        marginTop: isMobile() ? "none" : "44px",
      }}
    />
  );
}
