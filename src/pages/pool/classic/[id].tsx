import React, { useEffect } from "react";
import { useRouter } from "next/router";

export default function ClassicPoolDetail() {
  useEffect(() => {
    console.log(useRouter, "router");
  }, []);
  return <div></div>;
}
