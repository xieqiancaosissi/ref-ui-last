import React from "react";
import { RefVaultIcon, BurrowVaultIcon, DeltaVaultIcon } from "./vaultIcon";

export function vaultConfig() {
  return [
    {
      icon: <RefVaultIcon />,
      aprName: "Highest APR",
      aprValue: "100%",
      riskLevel: "2",
      category: "LP",
      title: "REF Classic + Stable LP",
    },
    {
      icon: <RefVaultIcon />,
      aprName: "Highest APR",
      aprValue: "100%",
      riskLevel: "3",
      category: "LP",
      title: "REF DCL LP",
    },
    {
      icon: <RefVaultIcon />,
      aprName: "Highest APR",
      aprValue: "100%",
      riskLevel: "2",
      category: "Launchpad",
      title: "REF Farming",
    },
    {
      icon: <BurrowVaultIcon />,
      aprName: "Highest APR",
      aprValue: "100%",
      riskLevel: "2",
      category: "Lending",
      title: "Burrow",
    },
    {
      icon: <DeltaVaultIcon />,
      aprName: "Highest APR",
      aprValue: "100%",
      riskLevel: "1",
      category: "Bot",
      title: "Delta Grid",
    },
    {
      icon: <DeltaVaultIcon />,
      aprName: "Highest APR",
      aprValue: "100%",
      riskLevel: "1",
      category: "Bot",
      title: "Delta DCA",
    },
  ];
}

export function VaultColorConfig(type: string) {
  switch (type) {
    case "LP":
      return "text-black bg-green-10";
    case "Launchpad":
      return "text-black bg-vaultTagLaunchpad";
    case "Lending":
      return "text-white bg-vaultTagLending";
    case "Bot":
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
      key: "lp",
      value: "LP",
      count: 0,
    },
    {
      key: "lending",
      value: "Lending",
      count: 0,
    },
    {
      key: "bot",
      value: "Bot",
      count: 0,
    },
    {
      key: "launchpad",
      value: "Launchpad",
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
      key: "lp",
      value: "LP",
      count: 0,
    },
    {
      key: "lending",
      value: "Lending",
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

export function vaultTabListMobileDropDown() {
  const data = vaultConfig();
  const list = [
    {
      key: "bot",
      value: "Bot",
      count: 0,
    },
    {
      key: "launchpad",
      value: "Launchpad",
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
