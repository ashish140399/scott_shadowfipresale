import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { toast } from 'react-toastify';
import { NETWORK_NAME, TAG_PROVIDER } from '../libs/constants';

// This function checks if the device is mobile
const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const useWalletConnection = () => {
  const { active, account, chainId, library, activate, deactivate } = useWeb3React();

  useEffect(() => {
    // Check if returning from a login attempt
    const loginAttempt = localStorage.getItem('loginAttempt');
    if (loginAttempt === 'inProgress') {
      // Here you would check if the wallet is connected now, which might involve calling `activate` again
      // depending on your wallet management strategy.
      // For now, let's just clear the flag and log to console. You should replace this with your actual connection check.
      console.log('Checking if wallet is connected after returning...');
      localStorage.removeItem('loginAttempt');

      // If using a specific wallet connector that needs re-activation, do it here
      // activate(walletConnector, errorCallback);
    }
  }, [activate]); // Re-run the effect if the `activate` function changes

  const connectWallet = (wallet: any, callBack: any) => {
    if (!window) return;

    if (isMobile()) {
      localStorage.setItem('loginAttempt', 'inProgress');
      alert('You will be redirected to MetaMask. Please return back to our app after completing the action in MetaMask.');

      const dappURL = 'shadowfipresale.netlify.app';
      window.location.href = `https://metamask.app.link/dapp/${dappURL}`;
      return; // The return here doesn't need to return the object again
    }

    window.localStorage.clear();
    window.localStorage.setItem(TAG_PROVIDER, wallet.title);
    if (callBack) {
      callBack();
    }
    activate(wallet.connector, (error: Error) => {
      if (error.message.includes('Unsupported chain id')) {
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
