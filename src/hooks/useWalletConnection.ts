import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import { NETWORK_NAME, TAG_PROVIDER } from "../libs/constants";

const useWalletConnection = () => {
  const { active, account, chainId, library, activate, deactivate } =
    useWeb3React();

  const connectWallet = (wallet: any, callBack: any) => {
    if (!window) return;
    const isMobile = () => {
      // Simple check for mobile devices
      return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    };
    if (isMobile()) {
      // Optionally, save the current app state or any other necessary info in local storage
      // localStorage.setItem('appState', JSON.stringify(/* Your app's current state */));
  
      // Inform the user they will be redirected and should return back after completing their actions
      alert('You will be redirected to MetaMask. Please return back to our app after completing the action in MetaMask.');
  
      // Redirect to MetaMask deep link for mobile users
      const dappURL = 'shadowfipresale.netlify.app';
      window.location.href = `https://metamask.app.link/dapp/${dappURL}`;
      return;
    }
  
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
