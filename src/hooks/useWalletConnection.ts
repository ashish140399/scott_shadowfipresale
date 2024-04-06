import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import { NETWORK_NAME, TAG_PROVIDER } from "../libs/constants";

const useWalletConnection = () => {
  const { activate, deactivate } = useWeb3React();

  const isMobile = () => {
    // Simple check for mobile devices
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  const connectWallet = async (wallet:any, callBack:any) => {
    if (!window) return;

    // Check if the user is on a mobile device
    if (isMobile()) {
      // Redirect to MetaMask deep link for mobile users
      const dappURL = 'https://shadowfipresale.netlify.app'; // Replace with your actual website URL
      window.location.href = `https://metamask.app.link/dapp/${dappURL}`;
      return; // Stop further execution for mobile devices
    }

    window.localStorage.clear();
    window.localStorage.setItem(TAG_PROVIDER, wallet.title);

    try {
      await activate(wallet.connector);
      if (callBack) callBack();
    } catch (error:any) {
      console.error('Failed to connect:', error);

      if (error.message.includes("Unsupported chain id")) {
        toast.info(`Please change network to ${NETWORK_NAME}.`);
      }
      // Additional error handling as needed
    }
  };

  const disconnectWallet = (callBack:any) => {
    window.localStorage.clear();
    if (callBack) callBack();
    deactivate();
  };

  return { connectWallet, disconnectWallet };
};


export default useWalletConnection;
