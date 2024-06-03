import Image from "next/image";
import {
  SwapIcon,
  LimitIcon,
  OrderbookIcon,
  PoolIcon,
  FarmsIcon,
  YoursIcon,
} from "./icons";

interface IMenu {
  id: string;
  label: string | React.ReactElement;
  path?: string;
  children?: IMenuChild[];
}
interface IMenuChild {
  id: string;
  label: string | React.ReactElement;
  icon: React.ReactElement;
  path: "";
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
          path: "",
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
      id: "pool",
      label: "POOL",
      children: [
        {
          id: "pools",
          label: "Pools",
          icon: <PoolIcon />,
          path: "",
        },
        {
          id: "farms",
          label: "Farms",
          icon: <FarmsIcon />,
          path: "",
        },
        {
          id: "yours",
          label: "Yours",
          icon: <YoursIcon />,
          path: "",
        },
      ],
    },
    {
      id: "stake",
      label: "STAKE",
      path: "",
    },
    {
      id: "meme",
      label: (
        <>
          MEME
          <Image src="/images/memeMenu.svg" width={24} height={24} alt="" />
          SEASON
        </>
      ),
      path: "",
    },
  ];
}
