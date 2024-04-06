import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { BSC_INFURA_KEY } from "./constants";

export const METAMASK = new InjectedConnector({
  supportedChainIds: [56],
});

export const WALLETCONNECT = new WalletConnectConnector({
  // @ts-ignore
  rpcUrl: `https://mainnet.infura.io/v3/${BSC_INFURA_KEY}`,
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});
