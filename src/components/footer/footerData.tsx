import {
  TwitterIcon,
  TelegramIcon,
  DiscordIcon,
  MediumIcon,
  RefAnalyticsIcon,
} from "./icons";

export const communityLinks = [
  {
    label: "Discord",
    url: "https://discord.gg/reffinance",
    icon: <DiscordIcon />,
  },
  {
    label: "Twitter",
    url: "https://twitter.com/finance_ref",
    icon: <TwitterIcon />,
  },
  {
    label: "Telegram",
    url: "https://t.me/ref_finance",
    icon: <TelegramIcon />,
  },
  {
    label: "Medium",
    url: "https://ref-finance.medium.com/",
    icon: <MediumIcon />,
  },
  // {
  //   label: 'Forum',
  //   url: 'https://gov.ref.finance',
  //   icon: <IconForum />,
  // },
];

export const docLinks = [
  {
    id: "ref.analytics",
    label: "REF.ANALYTICS",
    url: "https://stats.ref.finance/",
    icon: <RefAnalyticsIcon />,
  },
  {
    id: "security",
    label: "SECURITY",
    url: "https://guide.ref.finance/developers/audits",
  },
  {
    id: "docs",
    label: "DOCS",
    url: "https://guide.ref.finance/",
  },
  {
    id: "risks",
    label: "RISKS",
    url: "/risks",
    inLink: true,
  },
  {
    id: "bugbounty",
    label: "BUG BOUNTY",
    url: "https://immunefi.com/bug-bounty/reffinance/",
  },
];
