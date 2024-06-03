import { communityLinks, docLinks } from "./footerData";
export default function Footer() {
  function jump(url: string) {
    window.open(url);
  }
  return (
    <div className="flex items-center justify-between text-white h-9 border-t border-white border-opacity-10 px-6">
      <div className="flex items-center gap-4">
        {communityLinks.map((item) => {
          return (
            <div
              className="cursor-pointer text-gray-50 hover:text-primaryGreen"
              key={item.label}
              onClick={() => {
                jump(item.url);
              }}
            >
              {item.icon}
            </div>
          );
        })}
      </div>
      <div className="flex items-center">
        {docLinks.map((item, index) => {
          return (
            <div
              onClick={() => {
                jump(item.url);
              }}
              key={item.id}
              className={`flex items-end gap-1 text-xs font-bold text-gray-50 hover:text-primaryGreen cursor-pointer px-5 ${
                index !== docLinks.length - 1 ? "border-r border-gray-50" : ""
              }`}
            >
              {item.icon || ""}
              {item.label}
            </div>
          );
        })}
        <div className="flex items-center justify-center w-6 h-6 rounded border border-white border-opacity-20 font-semibold text-xs text-gray-50 cursor-pointer">
          EN
        </div>
      </div>
    </div>
  );
}
