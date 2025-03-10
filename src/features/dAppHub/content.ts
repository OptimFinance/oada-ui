import discordIcon from "../../assets/icons/discord.svg";
import githubIcon from "../../assets/icons/github.svg";
import telegramIcon from "../../assets/icons/telegram.svg";
import twitterIcon from "../../assets/icons/twitter.svg";
import epochStakeAuction from "../../assets/icons/dapphub-menu/epoch-stake-auction.svg";
import oada from "../../assets/icons/dapphub-menu/oada.svg";

export type AsideLink = {
  title: string;
  icon: string;
  href: string;
  soon?: boolean;
  new?: boolean;
  outsideLink?: boolean;
  parent: string;
};

const asideLinks: AsideLink[] = [
  {
    title: "OADA",
    icon: oada,
    href: "/dashboard",
    parent: "/oada",
  },
  {
    title: "Epoch Stake Auction",
    icon: epochStakeAuction,
    href: "/epoch-stake-auction/dashboard",
    parent: "/epoch-stake-auction",
  },
];

const topNavLinks: {
  [key: string]: { title: string; href: string; isExternal?: boolean }[];
} = {
  oada: [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Mint-Stake-Earn",
      href: "/oada/mint-stake-earn",
    },
    {
      title: "Swap",
      href: "//app.dexhunter.io/oada",
      isExternal: true,
    },
  ],
  "epoch-stake-auction": [
    {
      title: "Dashboard",
      href: "/epoch-stake-auction/dashboard",
    },
  ],
};

const asideFooterLinks = [
  {
    title: "Home",
    href: "//www.optim.finance",
  },
  {
    title: "Docs",
    href: "//optim-finance.gitbook.io/optim-finance",
  },
  {
    title: "Terms",
    href: "//www.optim.finance/disclaimer",
  },
  {
    title: "Audits",
    href: "//optim-finance.gitbook.io/optim-finance/audits/oada-system-audit",
  },
];

const socialLinks = [
  {
    title: "Telegram",
    href: "//t.me/Optim_Fi",
    icon: telegramIcon,
  },
  {
    title: "Twitter",
    href: "//twitter.com/optimfi",
    icon: twitterIcon,
  },
  {
    title: "Github",
    href: "//github.com/optimfinance",
    icon: githubIcon,
  },
  {
    title: "Discord",
    href: "//discord.gg/VZ329q7x69",
    icon: discordIcon,
  },
];

export { asideFooterLinks, asideLinks, socialLinks, topNavLinks };
