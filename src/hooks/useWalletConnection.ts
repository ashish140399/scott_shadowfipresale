import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import { NETWORK_NAME, TAG_PROVIDER } from "../libs/constants";

const useWalletConnection = () => {
  const { active, account, chainId, library, activate, deactivate } =
    useWeb3React();

  const connectWallet = (wallet: any, callBack: any) => {
    if (!window) return;

    window.localStorage.clear();
    window.localStorage.setItem(TAG_PROVIDER, wallet.title);
    if (callBack) {
      callBack();
    }
    activate(wallet.connector, (error: Error) => {
      if (error.message.includes("Unsupported chain id")) {
        toast.info(`Please change network to ${NETWORK_NAME}.`);
      }
    });
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
