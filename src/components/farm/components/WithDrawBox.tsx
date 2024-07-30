import { useContext, useEffect, useState } from "react";
import { FarmBoost, Seed } from "../../../services/farm";
import { FarmAvatarIcon, FarmWithdrawIcon, FarmWithdrawMobIcon } from "../icon";
import { useAccountStore } from "../../../stores/account";
import { ftGetTokenMetadata } from "@/services/token";
import {
  toReadableNumber,
  toInternationalCurrencySystem,
} from "@/utils/numbers";
import BigNumber from "bignumber.js";
import getConfig from "@/utils/config";
import { NEAR_META_DATA } from "@/utils/nearMetaData";
import Withdraw from "./WithdrawModal";
import styles from "../farm.module.css";

const { WRAP_NEAR_CONTRACT_ID } = getConfig();

export default function WithDrawBox(props: {
  userRewardList: any;
  tokenPriceList: any;
  farmDisplayList: Seed[];
}) {
  const { userRewardList, tokenPriceList, farmDisplayList } = props;
  const { getIsSignedIn } = useAccountStore();
  const isSignedIn = getIsSignedIn();
  const actualRewardList: { [key: string]: any } = {};
  const maxLength = 10;
  Object.entries(userRewardList).forEach(([key, value]) => {
    if (Number(value) > 0) {
      actualRewardList[key] = value;
    }
  });
  const [rewardList, setRewardList] = useState<any>({});
  const [yourReward, setYourReward] = useState("-");
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  useEffect(() => {
    const tempList = Object.keys(actualRewardList).map(async (key: string) => {
      let rewardToken = await ftGetTokenMetadata(key);
      const price = tokenPriceList[key]?.price;
      if (rewardToken.id === WRAP_NEAR_CONTRACT_ID) {
        rewardToken = { ...rewardToken, ...NEAR_META_DATA };
      }
      return {
        tokenId: key,
        rewardToken,
        price,
        number: actualRewardList[key],
      };
    });
    Promise.all(tempList).then((list) => {
      list.forEach((item: any) => {
        rewardList[item.tokenId] = item;
      });
      setRewardList(rewardList);
    });
    if (
      actualRewardList &&
      tokenPriceList &&
      Object.keys(tokenPriceList).length > 0 &&
      farmDisplayList &&
      farmDisplayList.length > 0
    ) {
      getTotalUnWithdrawRewardsPrice();
    }
  }, [actualRewardList, tokenPriceList, farmDisplayList]);

  function getTotalUnWithdrawRewardsPrice() {
    const rewardTokenList: { [key: string]: any } = {};
    farmDisplayList.forEach((seed: Seed, index: number) => {
      if (seed.farmList) {
        seed.farmList.forEach((farm: FarmBoost) => {
          const { token_meta_data } = farm;
          if (token_meta_data) {
            rewardTokenList[token_meta_data.id] = token_meta_data;
          }
        });
      }
    });
    let totalUnWithDraw = 0;
    Object.entries(actualRewardList).forEach((arr: [string, string]) => {
      const [key, v] = arr;
      const singlePrice = tokenPriceList[key]?.price;
      const token = rewardTokenList[key];
      if (token) {
        const number: any = toReadableNumber(token.decimals, v);
        if (singlePrice && singlePrice != "N/A") {
          totalUnWithDraw = BigNumber.sum(
            singlePrice * number,
            totalUnWithDraw
          ).toNumber();
        }
      }
    });
    if (totalUnWithDraw > 0) {
      let totalUnWithDrawV = toInternationalCurrencySystem(
        totalUnWithDraw.toString(),
        2
      );
      if (Number(totalUnWithDrawV) == 0) {
        totalUnWithDrawV = "<$0.01";
      } else {
        totalUnWithDrawV = `$${totalUnWithDrawV}`;
      }
      setYourReward(totalUnWithDrawV);
    } else {
      isSignedIn ? setYourReward("$0.00") : "";
    }
  }
  function showWithdrawModal() {
    setIsWithdrawOpen(true);
  }
  function hideWithdrawModal() {
    setIsWithdrawOpen(false);
  }
  return (
    <>
      <div className="frcb mb-12 w-3/5 xs:hidden">
        <div className="frcc">
          <FarmAvatarIcon className="mr-6" />
          <div>
            <p className="text-sm text-gray-50">Claimed Rewards</p>
            <h1 className="text-3xl paceGrotesk-Bold frcc">
              {yourReward}
              {Object.values(rewardList).length > 0 ? (
                <div className="flex items-center ml-3">
                  {Object.values(rewardList)
                    .slice(0, maxLength)
                    .map((reward: any, index: number) => {
                      return (
                        <img
                          key={index}
                          src={reward.rewardToken.icon}
                          className={`w-5 h-5 rounded-full  bg-cardBg border border-green-10 ${
                            index > 0 ? "-ml-1" : ""
                          }`}
                        ></img>
                      );
                    })}
                </div>
              ) : null}
            </h1>
          </div>
        </div>
        <div
          className={styles.gradient_border_container}
          onClick={() => {
            showWithdrawModal();
          }}
        >
          <p className="text-gray-10 text-base">Withdraw</p>
          <FarmWithdrawIcon className="ml-2" />
        </div>
        <Withdraw
          isOpen={isWithdrawOpen}
          onRequestClose={hideWithdrawModal}
          rewardList={rewardList}
        />
      </div>
      <div className="lg:hidden md:hidden">
        <div className="frcb mb-2.5">
          <p className="text-2xl"> {yourReward}</p>
          <div
            className="border border-black p-1.5 rounded text-base pr-1.5 frcc font-medium"
            onClick={() => {
              showWithdrawModal();
            }}
          >
            Withdraw
            <FarmWithdrawMobIcon className="ml-1.5" />
          </div>
        </div>
        {Object.values(rewardList).length > 0 ? (
          <div className="flex items-center">
            {Object.values(rewardList)
              .slice(0, maxLength)
              .map((reward: any, index: number) => {
                return (
                  <img
                    key={index}
                    src={reward.rewardToken.icon}
                    className={`w-5 h-5 rounded-full  bg-cardBg border border-green-10 ${
                      index > 0 ? "-ml-1" : ""
                    }`}
                  ></img>
                );
              })}
          </div>
        ) : null}
      </div>
    </>
  );
}
