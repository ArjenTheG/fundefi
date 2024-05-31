import { useState, useEffect } from "react";
import { ethers } from 'ethers';
import {ERC20Unique} from './ERC20Singleton';
import Fundefi from '../contracts/deployments/unique/Fundefi.json';
let UniqueProviderURL = 'https://rpc-opal.unique.network';

export default function useContract() {
	const [contractInstance, setContractInstance] = useState({
		
		contractUnique: null,
		signerAddress: null,
		sendTransaction: sendTransaction,
	})
	useEffect(() => {
		const fetchData = async () => {
			try {
				if (window.localStorage.getItem("login-type") === "metamask") {
					const contract = { contractUnique: null, signerAddress: null, sendTransaction: sendTransaction };
					const provider = new ethers.providers.Web3Provider(window.ethereum);
					const signer = provider.getSigner();

					window.provider = provider;


					let contractUnique = await ERC20Unique();
					contract.contractUnique = contractUnique;
					window.contractUnique = contractUnique;


					window.sendTransaction = sendTransaction;
					window.signer = signer;
					contract.signerAddress = (await signer.getAddress())?.toString()?.toLocaleUpperCase();
					window.signerAddress = contract.signerAddress;
					window.selectedAddress = (await signer.getAddress())?.toString();
					setContractInstance(contract);
					// console.clear();
				} else {
					const contract = {  contractUnique: null, signerAddress: null, sendTransaction: sendTransaction};
				
				
					// Define providerUnique
					const uniiqueProvider = new ethers.providers.JsonRpcProvider(UniqueProviderURL, {
						chainId: 8882,
						name: 'unique-testnet'
					});	
					const contractUnique = new ethers.Contract(Fundefi.address, Fundefi.abi, uniiqueProvider)
					contract.contractUnique = contractUnique;
					window.contractUnique = contractUnique;

					setContractInstance(contract);

				}
			} catch (error) {
				console.error(error)
			}
		}

		fetchData()
	}, [])


	async function sendTransaction(methodWithSignature) {
		await ethereum.enable();

		if (Number(window.ethereum.networkVersion) === 8882){//If it is sending from Unique then direct
			const tx = {
				...methodWithSignature,
				value: 0,
			}
			await (await window.signer.sendTransaction(tx)).wait();
			return;
		}
	}


	return contractInstance
}



export function getChain(chainid) {
	for (let i = 0; i < chains.allchains.length; i++) {
		const element = chains.allchains[i]
		if (element.chainId === chainid) {
			return element
		}
	}
	return chains.allchains[0];
}
export function getChainByToken(token) {
	for (let i = 0; i < chains.allchains.length; i++) {
		const element = chains.allchains[i]
		if (element.nativeCurrency.symbol === token) {
			return element
		}
	}
	return chains.allchains[0];
}