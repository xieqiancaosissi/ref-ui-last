import { LoadingIcon } from "../icons";
export default function Loading() {
  return (
    <div
      className="flex flex-col relative items-center justify-center"
      style={{
        width: "100%",
        height: "300px",
      }}
    >
      <LoadingIcon />
    </div>
  );
}
