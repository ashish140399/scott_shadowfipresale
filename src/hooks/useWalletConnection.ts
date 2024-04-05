import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import { NETWORK_NAME, TAG_PROVIDER } from "../libs/constants";
import { METAMASK, WALLETCONNECT } from "../libs/connectors";

const useWalletConnection = () => {
  const { active, account, chainId, library, activate, deactivate } =
    useWeb3React();

  const connectWallet = async (wallet: any, callBack: any) => {
    if (!window) return;

    window.localStorage.clear();
    window.localStorage.setItem(TAG_PROVIDER, wallet.title);
    
    const provider = wallet === METAMASK ? METAMASK : WALLETCONNECT;

    try {
      await activate(provider, undefined, true);
      if (callBack) {
        callBack();
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      if (error && error.message.includes("Unsupported chain id")) {
        toast.info(`Please change network to ${NETWORK_NAME}.`);
      }
      // Handle other errors
    }
  };

  const disconnectWallet = (callBack: any) => {
    window.localStorage.clear();
    if (callBack) {
      callBack();
    }
    deactivate();
  };

  return { active, account, chainId, library, connectWallet, disconnectWallet };
};

export default useWalletConnection;
