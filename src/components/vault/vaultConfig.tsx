import React from "react";

export function vaultConfig() {
  return [
    {
      icon: null,
      aprName: "Highest APR",
      aprValue: "100%",
      riskLevel: "2",
      category: "LP",
      title: "REF Classic + Stable LP",
    },
    {
      icon: null,
      aprName: "Highest APR",
      aprValue: "100%",
      riskLevel: "3",
      category: "LP",
      title: "REF DCL LP",
    },
    {
      icon: null,
      aprName: "Highest APR",
      aprValue: "100%",
      riskLevel: "2",
      category: "Launchpad",
      title: "REF Farming",
    },
    {
      icon: null,
      aprName: "Highest APR",
      aprValue: "100%",
      riskLevel: "2",
      category: "Lending",
      title: "Burrow",
    },
    {
      icon: null,
      aprName: "Highest APR",
      aprValue: "100%",
      riskLevel: "1",
      category: "Lending",
      title: "Delta Grid",
    },
    {
      icon: null,
      aprName: "Highest APR",
      aprValue: "100%",
      riskLevel: "1",
      category: "Lending",
      title: "Delta DCA",
    },
  ];
}

export function vaultTabList() {
  const data = vaultConfig();
  const list = [
    {
      key: "",
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
