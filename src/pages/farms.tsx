import React, { useState } from "react";
import { Seed, BoostConfig, UserSeedInfo } from "../services/farm";
import FarmsPage from "@/components/farm";

export default function FarmsBoosterPage(props: any) {
  const [detailData, setDetailData] = useState<Seed | null>(null);
  const [tokenPriceList, setTokenPriceList] = useState<any | null>(null);
  const [loveSeed, setLoveSeed] = useState<Seed | null>(null);
  const [boostConfig, setBoostConfig] = useState<BoostConfig | null>(null);
  const [user_data, set_user_data] = useState<{
    user_seeds_map?: Record<string, UserSeedInfo>;
    user_unclaimed_token_meta_map?: Record<string, any>;
    user_unclaimed_map?: Record<string, any>;
  }>({});
  const [user_data_loading, set_user_data_loading] = useState(true);
  const [dayVolumeMap, setDayVolumeMap] = useState<Record<string, any>>({});
  const [all_seeds, set_all_seeds] = useState<Seed[]>([]);
  const paramId = decodeURIComponent(props?.match?.params.id || "");
  const is_dcl = paramId.indexOf("<>") > -1 || paramId.indexOf("|") > -1;

  const getDetailData_user_data = (data: {
    user_seeds_map: Record<string, UserSeedInfo>;
    user_unclaimed_token_meta_map: Record<string, any>;
    user_unclaimed_map: Record<string, any>;
  }) => {
    const {
      user_seeds_map,
      user_unclaimed_map,
      user_unclaimed_token_meta_map,
    } = data;
    set_user_data({
      user_seeds_map,
      user_unclaimed_map,
      user_unclaimed_token_meta_map,
    });
    set_user_data_loading(false);
  };

  const getDayVolumeMap = (map: any) => {
    setDayVolumeMap(map || {});
  };

  const getDetailData_boost_config = (boostConfig: BoostConfig) => {
    setBoostConfig(boostConfig);
  };

  const getDetailData = (data: {
    detailData: Seed;
    tokenPriceList: any;
    loveSeed: Seed;
    all_seeds: Seed[];
  }) => {
    const { detailData, tokenPriceList, loveSeed, all_seeds } = data;
    setDetailData(detailData);
    setTokenPriceList(tokenPriceList);
    setLoveSeed(loveSeed);
    set_all_seeds(all_seeds);
  };

  const emptyDetailData = () => {
    setDetailData(null);
  };

  const baseCondition =
    paramId &&
    detailData &&
    tokenPriceList &&
    Object.keys(tokenPriceList).length > 0;
  const showDetailPage = baseCondition && !is_dcl;
  const showDclDetailPage = baseCondition && is_dcl;
  const showLoading = paramId && !showDetailPage && !showDclDetailPage;

  return (
    <>
      <FarmsPage
        getDetailData={getDetailData}
        getDetailData_user_data={getDetailData_user_data}
        getDetailData_boost_config={getDetailData_boost_config}
        getDayVolumeMap={getDayVolumeMap}
      ></FarmsPage>
    </>
  );
}
