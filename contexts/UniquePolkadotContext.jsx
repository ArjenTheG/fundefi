'use client';
import { useContext, useEffect, useState } from 'react';
import { createContext } from 'react';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import polkadotConfig from './json/polkadot-config.json';
import { toast } from 'react-toastify';

const AppContext = createContext({
  api:null,
  deriveAcc:null,
  PolkadotLoggedIn:false,
  userInfo:null,
  userSigner:null,
  userWalletPolkadot:"",
  
  showToast: async (status, IdOrShowAlert, FinalizedText, doAfter, callToastSuccess = true, events, ShowToast = false) => {},
  getUserInfoById: async (userid) => {},
  EasyToast:  (message, type, UpdateType = false, ToastId = '') => {},
  GetAllBids: async () => [],
  GetAllJoined: async()=>[],
  GetAllNfts: async () => [],
  GetAllEvents: async () => [],
  updateCurrentUser: () => {},
});

export function UniquePolkadotProvider({ children }) {
  const [api, setApi] = useState();
  const [deriveAcc, setDeriveAcc] = useState(null);
  const [PolkadotLoggedIn, setPolkadotLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [userWalletPolkadot, setUserWalletPolkadot] = useState('');
  const [userSigner, setUserSigner] = useState('');


  async function showToast(status, IdOrShowAlert, FinalizedText, doAfter, callToastSuccess = true, events, ShowToast = false) {
    if (status.isInBlock) {
      if (ShowToast == false) {
      toast.update(IdOrShowAlert, { render: 'Transaction In block...', isLoading: true });
      }else {
        IdOrShowAlert('pending', 'Transaction In block...');
      }

    } else if (status.isFinalized) {
      if (callToastSuccess)
        if (ShowToast == false) {
          toast.update(IdOrShowAlert, {
            render: FinalizedText,
            type: 'success',
            isLoading: false,
            autoClose: 1000,
            closeButton: true,
            closeOnClick: true,
            draggable: true
          });
        } else {
          IdOrShowAlert('success', FinalizedText);
        }

      if (events != null) {
        doAfter(events);
      } else {
        doAfter();
      }
    }
  }

  async function fetchPolkadotJoinedData() {
    //Fetching data from Parachain
    try {
      if (api) {
        let totalJoinedCount = Number(await api._query.daos.joinedIds());
        let arr = [];
        for (let i = 0; i < totalJoinedCount; i++) {
          const element = await api._query.daos.joinedById(i);
          let newElm = {
            id: element['__internal__raw'].id.toString(),
            daoId: element['__internal__raw'].daoid.toString(),
            user_id: element['__internal__raw'].userId.toString(),
            joined_date: element['__internal__raw'].joinedDate.toString()
          };
          arr.push(newElm);
        }
        //All DAOs Users
        let allDaos = await GetAllDaos();
        for (let i = 0; i < allDaos.length; i++) {
          const element = allDaos[i];
          let newElm = {
            id: element.daoId,
            daoId: element.daoId,
            user_id: element.user_id,
            joined_date: element.Created_Date
          };
          arr.push(newElm);
        }


        return arr;
      }
    } catch (error) { console.error(error) }
    return [];
  }
  async function fetchContractJoinedData() {
    //Fetching data from Smart contract
    try {
      if (window.contract) {
        const totalJoined = await contract._join_ids();

        const arr = [];
        for (let i = 0; i < Number(totalJoined); i++) {
          const joined_dao = await contract._joined_person(i);
          arr.push(joined_dao);
        }

        return arr;
      }
    } catch (error) { }

    return [];
  }
  async function GetAllJoined() {
    let arr = [];
    arr = arr.concat(await fetchPolkadotJoinedData());
    arr = arr.concat(await fetchContractJoinedData());
    return arr;
  }

  async function getUserInfoById(userid) {
    if (api) {
      return await api.query.users.userById(userid);
    } else {
      return {};
    }
  }
  async function EasyToast(message, type, UpdateType = false, ToastId = '') {
    if (UpdateType) {
      toast.update(ToastId, {
        render: message,
        type: type,
        isLoading: false,
        autoClose: 1000,
        closeButton: true,
        closeOnClick: true,
        draggable: true
      });
    }
  }

  async function updateCurrentUser() {
    const { web3Enable, web3Accounts, web3FromAddress } = require('@polkadot/extension-dapp');

    setPolkadotLoggedIn(true);
    await web3Enable('DAOnation');
    let wallet = (await web3Accounts())[0];
    const injector = await web3FromAddress(wallet.address);

    setUserSigner(injector.signer);

    setUserWalletPolkadot(wallet.address);
    window.signerAddress = wallet.address;
  }

  useEffect(() => {
    (async function () {
      try {
        const wsProvider = new WsProvider(polkadotConfig.chain_rpc);
        const _api = await ApiPromise.create({ provider: wsProvider });
        await _api.isReady;

        setApi(_api);

        const keyring = new Keyring({ type: 'sr25519' });
        const newPair = keyring.addFromUri(polkadotConfig.derive_acc);
        setDeriveAcc(newPair);

        if (window.localStorage.getItem('loggedin') == 'true') {
          let userid = window.localStorage.getItem('user_id');
          window.userid = userid;
          const userInformation = await _api.query.users.userById(userid);
          setUserInfo(userInformation);

          if (window.localStorage.getItem('login-type') == 'polkadot') {
            updateCurrentUser();
          }
        }
      } catch (e) { }
    })();
  }, []);


  async function InsertEventData(totalEventCount, allEvents, prefix) {
    const arr = [];
    for (let i = 0; i < totalEventCount; i++) {
      let object = '';
      let daoId = "";
      let reached = 0;
      let nft_raised  = 0;
      let totalNfts = 0;
      let eventId = prefix + i;

      if (prefix == 'm_') {
        object = JSON.parse(allEvents[i].event_uri);
        daoId = allEvents[i].dao_id;
         nft_raised = Number(await contractUnique.get_event_reached(i));
         totalNfts = Number(await contractUnique.get_event_nft_count(i));
      } else {
        if (allEvents[i]?.eventUri) {
          object = JSON.parse(allEvents[i].eventUri?.toString());
          daoId = allEvents[i].daoId.toString();
        }
      }
      reached =  Number(allEvents[i].raised)/1e18 + nft_raised/1e18 ;


      if (object) {
        arr.push({
          //Pushing all data into array
          id: i,
          eventId: i,
          daoId: daoId,
          Title: object.properties.Title.description,
          Description: object.properties.Description.description,
          Budget: object.properties.Budget.description,
          End_Date: object.properties.End_Date.description,
          wallet: object.properties.wallet.description,
          UserId: object.properties?.user_id?.description,
          logo: object.properties.logo.description?.url,
          type: prefix == 'm_' ? 'Polkadot' : 'EVM',
          reached: reached,
          amountOfNFTs:totalNfts,
          status:allEvents[i].status
        });
      }
    }
    return arr;
  }


  async function fetchPolkadotEventData() {
    //Fetching data from Parachain
    try {
      if (api) {
        let totalEventCount = Number(await api._query.events.eventIds());

        let totalEvent = async () => {
          let arr = [];
          for (let i = 0; i < totalEventCount; i++) {
            const element = await api._query.events.eventById(i);
            let eventURI = element['__internal__raw'];

            arr.push(eventURI);
          }
          return arr;
        };

        let arr = InsertEventData(totalEventCount, await totalEvent(), 'p_');
        return arr;
      }
    } catch (error) { }
    return [];
  }
  async function fetchContractEventData() {
    //Fetching data from Smart contract
    try {
      if (window.contractUnique) {

        const totalEventCount = Number(await contractUnique._event_ids());
        let totalEvent = async () => {
          const arr = [];
          for (let i = 0; i < Number(totalEventCount); i++) {
            const event_info = await contractUnique._event_uris(i);
            arr.push(event_info);
          }
          return arr;
        }
        let arr = InsertEventData(totalEventCount, await totalEvent(), 'm_');
        return arr;

      }
    } catch (error) { }

    return [];
  }
  async function GetAllEvents() {
    let arr = [];
    // arr = arr.concat(await fetchPolkadotEventData());
    arr = arr.concat(await fetchContractEventData());
    return arr;
  }




  async function InsertNftData(totalNftCount, allNfts, prefix,allBids = []) {
    const arr = [];
    for (let i = 0; i < totalNftCount; i++) {
      let object = {};

      if (prefix == 'm_') {
        object = allNfts[i];
      }
      let nftId = prefix + i;
      let allnftbids = allBids.filter((item)=>item.nftId == Number(i));

      arr.push({
        //Pushing all data into array
        id: i,
        nftId: nftId,
        eventid: object.event_id,
        name: object.name,
        url: object.url,
        description: object.description,
        sender_wallet: object.sender_wallet,
        reciever_wallet: object.reciever_wallet,
        highest_amount: Number(object.highest_amount) /1e18,
        highest_bidder: object.highest_bidder,
        highest_bidder_userid: object.highest_bidder_userid,
        type: prefix == 'm_' ? 'Polkadot' : 'EVM',
        highestBid: [],
        bidHistory:allnftbids,
      });
    }
    return arr;
  }

  async function fetchContractNftData(allBids) {
    //Fetching data from Smart contract
    try {
      if (window.contractUnique) {
        const totalNftCount = Number(await contractUnique._nft_ids());
        let totalNft = async () => {
          const arr = [];
          for (let i = 0; i < Number(totalNftCount); i++) {
            const nft_info = await contractUnique._nft_uris(i);
            arr.push(nft_info);
          }
          return arr;
        }
        let arr = InsertNftData(totalNftCount, await totalNft(), 'm_',allBids);
        return arr;

      }
    } catch (error) { }

    return [];
  }

  async function GetAllNfts() {

    let allBids =await  GetAllBids();
    console.log(allBids);
    let arr = [];
    // arr = arr.concat(await fetchPolkadotGoalData());
    arr = arr.concat(await fetchContractNftData(allBids));
    return arr;
  }





  async function InsertBidData(totalBidCount, allBids, prefix) {
    const arr = [];
    for (let i = 0; i < totalBidCount; i++) {
      let object = {};

      if (prefix == 'm_') {
        object = allBids[i];
      }
      let bidId = prefix + i;

      arr.push({
        //Pushing all data into array
        id: i,
        bidId: bidId,
        nftId: object.nft_id,
        date: object.date,
        walletAddress: object.walletAddress,
        bidder: object.bidder,
        bidder_userid:Number(object.bidder_userid),
        bidAmount:Number(object.bidAmount)/1e18
      });
    }
    return arr;
  }

  async function fetchContractBidData() {
    //Fetching data from Smart contract
    try {
      if (window.contractUnique) {
        const totalBidCount = Number(await contractUnique._bid_ids());
        let totalBid = async () => {
          const arr = [];
          for (let i = 0; i < Number(totalBidCount); i++) {
            const bid_info = await contractUnique._bid_uris(i);
            arr.push(bid_info);
          }
          return arr;
        }
        let arr = InsertBidData(totalBidCount, await totalBid(), 'm_');
        return arr;

      }
    } catch (error) { }

    return [];
  }

  async function GetAllBids(){
    let arr = [];
    // arr = arr.concat(await fetchPolkadotGoalData());
    arr = arr.concat(await fetchContractBidData());
    return arr;
  }


  return <AppContext.Provider value={{api:api,deriveAcc:deriveAcc,PolkadotLoggedIn:PolkadotLoggedIn,userInfo:userInfo, userWalletPolkadot:userWalletPolkadot,userSigner:userSigner,GetAllBids:GetAllBids,GetAllNfts:GetAllNfts,GetAllEvents:GetAllEvents,EasyToast:EasyToast,getUserInfoById:getUserInfoById,showToast:showToast,GetAllJoined:GetAllJoined}}>{children}</AppContext.Provider>;
}

export const useUniquePolkadotContext = () => useContext(AppContext);
