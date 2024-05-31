import React, { useState, useEffect } from 'react';
import useContract from '../../services/useContract';
import { useUniquePolkadotContext } from '../../contexts/UniquePolkadotContext';
import { Button, IconButton, Dropdown, MenuItem, Modal } from '@heathmont/moon-core-tw';
import { ControlsClose } from '@heathmont/moon-icons-tw';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { useUtilsContext } from '../../contexts/UtilsContext';
declare let window;

export default function JoinCommunityModal({ SubsPrice, show, onHide, address, recieveWallet, recievetype, title, eventId }) {
  const [Balance, setBalance] = useState(0);
  const [BalanceAmount, setBalanceAmount] = useState(0);
  const [Token, setToken] = useState('');
  const [isLoading, setisLoading] = useState(false);
  const [Amount, setAmount] = useState(0);
  const [Coin, setCoin] = useState('');
  const { sendTransaction } = useContract();
  const router = useRouter();


  const { userInfo, PolkadotLoggedIn, userWalletPolkadot, userSigner, showToast, api } = useUniquePolkadotContext();
  const { switchNetworkByToken }: { switchNetworkByToken: Function } = useUtilsContext();

  async function JoinSubmission(e) {
    e.preventDefault();
    console.clear();

    setisLoading(true);
    const id = toast.loading('Joining event ...');
    let feed = JSON.stringify({
      eventId: eventId,
      name: userInfo?.fullName?.toString()
    });
    async function onSuccess() {
      router.push(`/campaigns/${eventId}`);
      LoadData();
      setisLoading(false);
      onHide({ success: true });
    }
    if (Coin == 'DOT') {
      toast.update(id, {
        render: 'Joining event....'
      });
      let recipient = recievetype == 'Polkadot' ? recieveWallet : address;
      const txs = [api.tx.balances.transferAllowDeath(recipient, `${Amount * 1e12}`), api._extrinsics.daos.joinCommunity(eventId, Number(window.userid), new Date().toLocaleDateString(), feed), api._extrinsics.feeds.addFeed(feed, 'join', new Date().valueOf())];

      const transfer = api.tx.utility.batch(txs).signAndSend(userWalletPolkadot, { signer: userSigner }, (status) => {
        showToast(status, id, 'Joined successfully!', () => {
          onSuccess();
        });
      });
    } else {
      let recipient = recievetype == 'Polkadot' ? address : recieveWallet;
      const tx = {
        from: window?.selectedAddress,
        to: recipient,
        value: ethers.utils.parseEther(`${Number(Amount)}`),
        gasPrice: 6_000_000_000
      };
      await (await window.signer.sendTransaction(tx)).wait();


      // Saving Joined Person on smart contract
      await sendTransaction(await window.contract.populateTransaction.join_community(eventId, Number(window.userid), new Date().toLocaleDateString(), feed));
      toast.update(id, {
        render: 'Purchased Subscription successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 1000,
        closeButton: true,
        closeOnClick: true,
        draggable: true
      });
      onSuccess();
    }
  }


  async function LoadData(currencyChanged = false) {
    async function setPolkadotNetwork() {
      if (Coin !== 'DOT') setCoin('DOT');
      const { nonce, data: balance } = await api.query.system.account(userWalletPolkadot);
      setBalanceAmount(Number(balance.free.toString()) / 1e12);
    }

    async function setMetamask() {
      try {
        const Web3 = require('web3');
        const web3 = new Web3(window.ethereum);
        let Balance = await web3.eth.getBalance(window?.selectedAddress);

        setBalanceAmount(Number(Balance) / 1e18);
      } catch (error) { }
    }

    if (PolkadotLoggedIn && currencyChanged == false && Coin == '') {
      setPolkadotNetwork();
    } else if (currencyChanged == true && Coin == 'DOT') {
      switchNetworkByToken('DOT');
      setPolkadotNetwork();
    } else if (currencyChanged == true && Coin !== 'DOT' && Coin !== '') {
      switchNetworkByToken('UNQ');
      setMetamask();
    }
  }
  useEffect(() => {
    if (Coin !== '') LoadData(true);
  }, [Coin]);

  useEffect(() => {
    LoadData();
  }, [show]);

  return (
    <Modal open={show} onClose={onHide} aria-labelledby="contained-modal-title-vcenter">
      <Modal.Backdrop />
      <Modal.Panel className="bg-gohan w-[90%] max-w-[480px]">
        <div className={`flex items-center justify-center flex-col`}>
          <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
            <h1 className="text-moon-20 font-semibold">Join charity "{title}"</h1>
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onHide} />
          </div>


          <div className="flex flex-col gap-3 w-full p-8">
            <div className="flex justify-between pt-8">
              <h4 className="font-semibold text-moon-18">Total</h4>
              <h4 className="font-semibold text-moon-18">{SubsPrice} USD</h4>
            </div>

            <div className="flex justify-between">
              <h4 className="font-semibold text-moon-18">Coin</h4>
              <h4 className="font-semibold text-moon-18"></h4>
              <div className="flex items-center gap-2">
                {Amount}
                <Dropdown value={Coin} onChange={setCoin}>
                  <Dropdown.Select placeholder={'Select a Currency'}>{Coin}</Dropdown.Select>
                  <Dropdown.Options className="bg-gohan w-48 min-w-0 w-full">
                    <Dropdown.Option value="DOT">
                      <MenuItem>DOT</MenuItem>
                    </Dropdown.Option>
                    <Dropdown.Option value="UNQ">
                      <MenuItem>UNQ</MenuItem>
                    </Dropdown.Option>
                  </Dropdown.Options>
                </Dropdown>
              </div>
            </div>

            {Amount > Balance ? (
              <p className="pt-5 text-right text-raditz">Insufficient funds</p>
            ) : (
              <p className="pt-5 text-right">
                Your balance is {Balance} {Coin}
              </p>
            )}
          </div>

          <div className="flex justify-between border-t border-beerus w-full p-6">
            <Button variant="ghost" onClick={onHide}>
              Cancel
            </Button>
            <Button id="CreateGoalBTN" type="submit" onClick={JoinSubmission} animation={isLoading ? 'progress' : false}>
              Join
            </Button>
          </div>
        </div>
      </Modal.Panel>
    </Modal>
  );
}
