'use client';
import { useContext, useEffect, useState } from 'react';
import { createContext } from 'react';
import {  getChainByToken } from '../services/useContract';

const AppContext = createContext({
  switchNetworkByToken :async()=>{}
});

export function UtilsProvider({ children }) {

  async function switchNetworkByToken(token) {
   

    if (token == "DOT"){

      const { web3Enable } = require('@polkadot/extension-dapp');
      await web3Enable('Fundefi');
      window.localStorage.setItem('loggedin', 'true');
      window.localStorage.setItem('login-type', 'polkadot');
      return;
    }

    let chainInfo = getChainByToken(token)

    let result = await window.ethereum.request({ method: 'eth_requestAccounts' });
    result;

    try {
      const getacc = await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + chainInfo.chainId.toString(16) }]
      });
      getacc;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x' + chainInfo.chainId.toString(16),
                chainName: chainInfo.name,
                nativeCurrency: {
                  name: chainInfo.nativeCurrency.name,
                  symbol: chainInfo.nativeCurrency.symbol,
                  decimals: chainInfo.nativeCurrency.decimals
                },
                rpcUrls: chainInfo.rpc
              }
            ]
          });
        } catch (addError) {
          // handle "add" error
          console.log(addError);
        }
      }
      // handle other "switch" errors
    }

    window.localStorage.setItem('loggedin', 'true');
    window.localStorage.setItem('login-type', 'metamask');

  }

  return <AppContext.Provider value={{ switchNetworkByToken:switchNetworkByToken }}>{children}</AppContext.Provider>;
}

export const useUtilsContext = () => useContext(AppContext);
