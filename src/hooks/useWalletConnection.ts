import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import { NETWORK_NAME, TAG_PROVIDER } from "../libs/constants";
import { METAMASK, WALLETCONNECT } from "../libs/connectors";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Web3Wallet } from '@walletconnect/web3wallet';

const CustomWeb3WalletConnector = (web3Wallet: Web3Wallet): AbstractConnector => {
  const activate = async (params?: any): Promise<void> => {
    try {
      await web3Wallet.activate(params);
    } catch (error) {
      throw error;
    }
  };

  const deactivate = (): void => {
    try {
      web3Wallet.deactivate();
    } catch (error) {
      console.error("Error deactivating Web3Wallet:", error);
    }
  };

  const getProvider = async (): Promise<any> => {
    try {
      return await web3Wallet.getProvider();
    } catch (error) {
      console.error("Error getting provider from Web3Wallet:", error);
      return null;
    }
  };

  const getChainId = async (): Promise<any> => {
    try {
      return await web3Wallet.getChainId();
    } catch (error) {
      console.error("Error getting chain ID from Web3Wallet:", error);
      return null;
    }
  };

  const getAccount = async (): Promise<any> => {
    try {
      return await web3Wallet.getAccount();
    } catch (error) {
      console.error("Error getting account from Web3Wallet:", error);
      return null;
    }
  };

  return {
    activate,
    deactivate,
    getProvider,
    getChainId,
    getAccount,
    emitUpdate: () => {}, // Define these to avoid type errors
    emitError: () => {},
    emitDeactivate: () => {},
    addListener: () => {},
    removeListener: () => {}
  };
};

const useWalletConnection = () => {
  const { activate, deactivate } = useWeb3React();

  const connectWallet = async (wallet: any, callBack: any) => {
    if (!window) return;

    window.localStorage.clear();
    window.localStorage.setItem(TAG_PROVIDER, wallet.title);
    
    const provider = wallet === METAMASK ? METAMASK : CustomWeb3WalletConnector(WALLETCONNECT);

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

  return { connectWallet, disconnectWallet };
};

export default useWalletConnection;
