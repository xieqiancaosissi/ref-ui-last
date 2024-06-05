import Image from "next/image";
import {
  SwapIcon,
  LimitIcon,
  OrderbookIcon,
  PoolIcon,
  FarmsIcon,
  YoursIcon,
  StakeIcon,
} from "./icons";

export interface IMenu {
  id: string;
  label: string | React.ReactElement;
  path?: string;
  children?: IMenuChild[];
  icon?: string | React.ReactElement;
}
export interface IMenuChild {
  id: string;
  label: string | React.ReactElement;
  icon: React.ReactElement;
  path: string;
}
export function menuData(): IMenu[] {
  return [
    {
      id: "trade",
      label: "TRADE",
      children: [
        {
          id: "swap",
          label: "Swap",
          icon: <SwapIcon />,
          path: "/",
        },
        {
          id: "limit",
          label: "Limit",
          icon: <LimitIcon />,
          path: "",
        },
        {
          id: "orderbook",
          label: "Orderbook",
          icon: <OrderbookIcon />,
          path: "",
        },
      ],
    },
    {
      id: "earn",
      label: "EARN",
      children: [
        {
          id: "pools",
          label: "Pools",
          icon: <PoolIcon />,
          path: "/pools",
        },
        {
          id: "farms",
          label: "Farms",
          icon: <FarmsIcon />,
          path: "/farms",
        },
        {
          id: "yours",
          label: "Yours",
          icon: <YoursIcon />,
          path: "",
        },
        {
          id: "stake",
          label: "Stake",
          icon: <StakeIcon />,
          path: "",
        },
      ],
    },
    {
      id: "meme",
      icon: <Image src="/images/memeMenu.svg" width={24} height={24} alt="" />,
      label: "MEME SEASON",
      path: "",
    },
  ];
}
