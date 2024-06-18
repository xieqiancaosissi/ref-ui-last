import React from "react";
// import { FormattedMessage, useIntl } from "react-intl";

export default function SelectBox(props: any) {
  const { list, selectedId, setSelectedId, type } = props;
  function switchOption(id: string) {
    setSelectedId(id);
  }
  const selectList =
    list?.filter((item: any) => {
      return !item.hidden;
    }) || [];

  const getClassName = (item: any) => {
    if (type === "filter") {
      return `rounded-2xl border border-dark-40 py-1 px-3.5 text-sm mr-1 mb-1 cursor-pointer ${
        item.id === selectedId ? "bg-gray-100 text-white" : "text-gray-60"
      }`;
    } else if (type === "farm_type") {
      return `${
        item.id === selectedId
          ? "bg-poolsTypelinearGrayBg rounded"
          : "text-gray-60"
      } w-25 h-8 frcc cursor-pointer text-sm`;
    } else {
      return "";
    }
  };

  return (
    <div className="frcb" tabIndex={Math.random()}>
      {selectList.map((item: any) => {
        const { id, label, name } = item;
        return (
          <div
            onClick={() => {
              switchOption(id);
            }}
            key={id}
            className={getClassName(item)}
          >
            <div className="flex items-center">
              <span className="text-sm text-white">{name || label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
