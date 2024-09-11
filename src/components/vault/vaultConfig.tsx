import React from "react";
import { RefVaultIcon, BurrowVaultIcon, DeltaVaultIcon } from "./vaultIcon";

export function vaultConfig() {
  return [
    {
      icon: <RefVaultIcon />,
      aprName: "Highest APY",
      aprValue: "100%",
      riskLevel: "2",
      category: "POOL",
      title: "REF Classic LP",
      path: "/pools",
    },
    {
      icon: <RefVaultIcon />,
      aprName: "Highest APY",
      aprValue: "100%",
      riskLevel: "1",
      category: "POOL",
      title: "REF Stable LP",
      path: "/pools",
    },
    {
      icon: <RefVaultIcon />,
      aprName: "Top Bin APY",
      aprValue: "100%",
      riskLevel: "2",
      category: "POOL",
      title: "REF DCL LP",
      path: "/pools",
    },
    {
      icon: <RefVaultIcon />,
      aprName: "Highest APY",
      aprValue: "100%",
      riskLevel: "1",
      category: "RefFarming",
      title: "REF Farming",
      path: "/v2farms",
    },
    {
      icon: <BurrowVaultIcon />,
      aprName: "Highest APY",
      aprValue: "100%",
      riskLevel: "1",
      category: "Lending",
      title: "Burrow",
      url: "https://app.burrow.finance/",
    },
    {
      icon: <DeltaVaultIcon />,
      aprName: "Historical ROI",
      aprValue: "100%",
      riskLevel: "2",
      category: "AutoBot",
      title: "Delta Grid",
      url: "https://www.deltatrade.ai/bots/grid/vaults/",
    },
    {
      icon: <DeltaVaultIcon />,
      aprName: "Historical ROI",
      aprValue: "100%",
      riskLevel: "2",
      category: "AutoBot",
      title: "Delta Swing",
      url: "https://www.deltatrade.ai/bots/swing/vaults/",
    },
    {
      icon: <DeltaVaultIcon />,
      aprName: "Historical ROI",
      aprValue: "100%",
      riskLevel: "2",
      category: "AutoBot",
      title: "Delta DCA",
      url: "https://www.deltatrade.ai/bots/dca/vaults/",
    },
  ];
}

export function VaultColorConfig(type: string) {
  switch (type) {
    case "POOL":
      return "text-black bg-green-10";
    case "RefFarming":
      return "text-black bg-vaultTagLaunchpad";
    case "Lending":
      return "text-white bg-vaultTagLending";
    case "AutoBot":
      return "text-white bg-vaultTagBot";
    default:
      return "text-white bg-vaultTagBot";
  }
}

export function vaultTabList() {
  const data = vaultConfig();
  const list = [
    {
      key: "All",
      value: "All",
      count: data.length,
    },
    {
      key: "pool",
      value: "POOL",
      count: 0,
    },
    {
      key: "reffarming",
      value: "RefFarming",
      count: 0,
    },
    {
      key: "lending",
      value: "Lending",
      count: 0,
    },
    {
      key: "autobot",
      value: "AutoBot",
      count: 0,
    },
  ];
  data.map((item: any) => {
    list.map((ite: any) => {
      if (item.category == ite.value) {
        ite.count = ite.count + 1;
      }
    });
  });

  return list;
}

export function vaultTabListMobile() {
  const data = vaultConfig();
  const list = [
    {
      key: "All",
      value: "All",
      count: data.length,
    },
    {
      key: "pool",
      value: "POOL",
      count: 0,
    },
    {
      key: "reffarming",
      value: "RefFarming",
      count: 0,
    },
  ];
  data.map((item: any) => {
    list.map((ite: any) => {
      if (item.category == ite.value) {
        ite.count = ite.count + 1;
      }
    });
  });

  return list;
}
