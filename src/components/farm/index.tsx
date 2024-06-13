import { SetStateAction, useContext, useEffect, useState } from "react";
import { useAccountStore } from "../../stores/account";
import {
  FarmAvatarIcon,
  FarmDownArrown,
  FarmInputCheck,
  FarmWithdrawIcon,
} from "./icons";
import { SearchIcon } from "../pools/icon";
import { get_unWithDraw_rewards } from "@/services/farm";

const Farms = () => {
  const { getIsSignedIn } = useAccountStore();
  const accountId = getIsSignedIn();
  const [farmsType, setFarmsType] = useState("All");
  const [farmsChildType, setFarmsChildType] = useState("All");
  const [selected, setSelected] = useState("stakedOnly");
  const [user_unWithdraw_rewards, set_user_unWithdraw_rewards] = useState<
    Record<string, string>
  >({});
  const farmsTypeList = [
    { key: "All", value: "All" },
    { key: "Classic", value: "Classic" },
    { key: "DCL", value: "DCL" },
  ];
  const farmsChildTypeList = [
    { key: "All", value: "All" },
    { key: "New", value: "New" },
    { key: "NEAR", value: "NEAR" },
    { key: "Stable", value: "Stable" },
    { key: "ETH", value: "ETH" },
    { key: "Meme", value: "Meme" },
    { key: "Ended", value: "Ended" },
    { key: "Others", value: "Others" },
  ];
  // useEffect(() => {
  //   get_user_unWithDraw_rewards();
  // }, [accountId]);
  const handleCheckbox = (value: SetStateAction<string>) => {
    setSelected(value);
  };
  async function get_user_unWithDraw_rewards() {
    if (accountId) {
      const userRewardList = await get_unWithDraw_rewards();
      set_user_unWithdraw_rewards(userRewardList);
    }
  }
  console.log(user_unWithdraw_rewards, "111user_unWithdraw_rewards");
  return (
    <main className="dark:text-white">
      {/* title */}
      <div className="bg-farmTitleBg fccc w-full pt-12 pb-1.5">
        <div className="frcb mb-12 w-3/5">
          <div className="frcc">
            <FarmAvatarIcon className="mr-6" />
            <div>
              <p className="text-sm text-gray-50">Claimed Rewards</p>
              <h1 className="text-3xl paceGrotesk-Bold">$260.34</h1>
            </div>
          </div>
          <div
            className="rounded-lg py-2.5 px-4 frcc"
            style={{
              boxShadow:
                "0 0 0 0.5px rgba(255, 247, 45, 0.3), 0 0 0 2px rgba(158, 255, 0, 0.3)",
            }}
          >
            <p className="text-gray-10 text-base">Withdraw</p>
            <FarmWithdrawIcon className="ml-2" />
          </div>
        </div>
        <div className="frcb w-3/5">
          <div className="frcc border border-dark-40 rounded-md p-0.5">
            {farmsTypeList.map((item) => (
              <div
                key={item.key}
                className={`${
                  farmsType === item.value
                    ? "bg-poolsTypelinearGrayBg rounded"
                    : "text-gray-60"
                } w-25 h-8 frcc cursor-pointer text-sm`}
                onClick={() => setFarmsType(item.value)}
              >
                {item.value}
              </div>
            ))}
          </div>
          <div className="frcc">
            <div className="frcc text-sm mr-10">
              <p className="text-gray-60 mr-2">Sort by:</p>
              <p className="frcc text-gray-60 border-r border-gray-60 border-opacity-30 pr-3.5">
                TVL <FarmDownArrown className="ml-2" />
              </p>
              <p className="frcc text-gray-60 ml-3.5">
                APR <FarmDownArrown className="ml-2" />
              </p>
            </div>
            <div className="border border-gray-100 w-52 h-9 frc p-1 rounded">
              <input
                type="text"
                placeholder="Search Farms by token"
                className="border-none w-40 bg-transparent outline-none caret-white mr-1 ml-1 text-white text-sm"
              />
              <SearchIcon />
            </div>
          </div>
        </div>
      </div>
      {/* content */}
      <div className="mx-auto w-3/5 pt-10">
        {/* select */}
        <div className="frcb mb-3.5">
          <div className="frcc">
            {farmsChildTypeList.map((item) => (
              <div
                key={item.key}
                className={`rounded-2xl border border-dark-40 py-1 px-3.5 text-sm mr-1 mb-1 cursor-pointer ${
                  farmsChildType === item.key
                    ? "bg-gray-100 text-white"
                    : "text-gray-60"
                }`}
                onClick={() => setFarmsChildType(item.key)}
              >
                {item.value}
              </div>
            ))}
          </div>
          <div className="frcc">
            <label className="inline-flex items-center mr-6 relative">
              <input
                type="checkbox"
                checked={selected === "stakedOnly"}
                onChange={() => handleCheckbox("stakedOnly")}
                className="checkbox-radio"
              />
              <span className="ml-1.5 text-gray-10 text-sm">Staked only</span>
              {selected === "stakedOnly" && (
                <FarmInputCheck className="absolute top-1 left-0.5" />
              )}
            </label>
            <label className="inline-flex items-center relative">
              <input
                type="checkbox"
                checked={selected === "showEndedFarms"}
                onChange={() => handleCheckbox("showEndedFarms")}
                className="checkbox-radio"
              />
              <span className="ml-1.5 text-gray-10 text-sm">
                Show Ended Farms
              </span>
              {selected === "showEndedFarms" && (
                <FarmInputCheck className="absolute top-1 left-0.5" />
              )}
            </label>
          </div>
        </div>
        {/* list */}
        <div>list page</div>
      </div>
    </main>
  );
};

export default Farms;
