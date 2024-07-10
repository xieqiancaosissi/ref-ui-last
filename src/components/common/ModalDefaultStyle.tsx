import Modal from "react-modal";
Modal.defaultStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 100,
    outline: "none",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  content: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -55%)",
    outline: "none",
  },
};
