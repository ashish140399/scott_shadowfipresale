import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import { NETWORK_NAME, TAG_PROVIDER } from "../libs/constants";

const useWalletConnection = () => {
  const { active, account, chainId, library, activate, deactivate } =
    useWeb3React();

    const connectWallet = async (wallet:any,callBack:any) => {
      if (!window) return;
  
      window.localStorage.clear();
      window.localStorage.setItem(TAG_PROVIDER, wallet.title);
  
      try {
          await activate(wallet.connector);
          if (callBack) callBack(); // Call the callback after successful activation
      } catch (error) {
          console.error('Failed to connect:', error);
          // @ts-ignore
          if (error.message.includes("Unsupported chain id")) {
              toast.info(`Please change network to ${NETWORK_NAME}.`);
          }
          // Handle other types of errors here
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
