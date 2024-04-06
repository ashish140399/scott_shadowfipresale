import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { BSC_INFURA_KEY } from "./constants";

// export const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42,56] });
export const METAMASK = new InjectedConnector({
  supportedChainIds: [56],
});

export const WALLETCONNECT = new WalletConnectConnector({
  // @ts-ignore
  rpcUrl: `https://mainnet.infura.io/v3/${BSC_INFURA_KEY}`,
  bridge: "https://bridge.walletconnect.org",
// Define the redirect URL after successful connection
redirectUri: `https://shadowfipresale.netlify.app/`,
// Specify deep linking URL
deepLink: "https://metamask.app.link",
});
