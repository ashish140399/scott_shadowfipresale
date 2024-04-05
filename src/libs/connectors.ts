import { InjectedConnector } from "@web3-react/injected-connector";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { BSC_INFURA_KEY } from "./constants";

export const METAMASK = new InjectedConnector({
  supportedChainIds: [56],
});

export const WALLETCONNECT = new WalletConnectProvider({
  rpc: {
    56: `https://mainnet.infura.io/v3/${BSC_INFURA_KEY}`,
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});
