import { useEffect, useState } from 'react';
import { Button, Dropdown, IconButton, MenuItem, Modal } from '@heathmont/moon-core-tw';
import { ControlsClose } from '@heathmont/moon-icons-tw';
import UseFormInput from '../../components/components/UseFormInput';
import useEnvironment from '../../services/useEnvironment';
import { useUniquePolkadotContext } from '../../contexts/UniquePolkadotContext';
import { useUtilsContext } from '../../contexts/UtilsContext';
import { toast } from 'react-toastify';

declare let window;
export default function DonateCoinToEventModal({ open, onClose, eventName, eventid,address, recieveWallet,recievetype }) {
  const [Balance, setBalance] = useState('');
  const [BalanceAmount, setBalanceAmount] = useState(0);
  const [Coin, setCoin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { api,PolkadotLoggedIn, userWalletPolkadot,updateCurrentUser,showToast,userSigner } = useUniquePolkadotContext();
  const { switchNetworkByToken }: { switchNetworkByToken: Function } = useUtilsContext();

  const [Amount, AmountInput] = UseFormInput({
    defaultValue: '',
    type: 'number',
    placeholder: '0.00',
    id: 'amount',
    className: 'max-w-[140px]'
  });

  async function DonateCoinSubmission(e) {
    e.preventDefault();
    console.clear();

    const ToastId = toast.loading('Donating....');

    setIsLoading(true);

    let feed = JSON.stringify({
      donated: Amount,
      eventTitle: eventName,
      eventid: eventid
    });

    async function onSuccess() {
      window.location.reload();
      LoadData();
      setIsLoading(false);

      onClose({ success: true });
    }

    toast.update(ToastId, { render: 'Sending Transaction...', isLoading: true });
   
    if (Coin == 'DOT') {
      let recipient = recievetype == 'Polkadot' ? recieveWallet : address;
      const txs = [api.tx.balances.transferAllowDeath(recipient, `${Amount * 1e12}`), api._extrinsics.ideas.addDonation(eventid, `${Amount * 1e12}`, Number(window.userid))];

      const transfer = api.tx.utility.batch(txs).signAndSend(userWalletPolkadot, { signer: userSigner }, (status) => {
        showToast(
          status,
          ToastId,
          'Donation successful!',
          () => {
            onSuccess();
          },
          true,
          null,
          true
        );
      });
    } else{
      let methodWithSignature = await window.contractUnique.populateTransaction.add_donation(eventid, `${Amount * 1e18}`, feed);
      const tx = {
        ...methodWithSignature,
        value: `${Amount * 1e18}`
      };
      await (await window.signer.sendTransaction(tx)).wait();
  
      toast.update(ToastId, { render: 'Success!', isLoading: false, type: 'success' });
  
      onSuccess();
    }
   
  }

  async function LoadData(currencyChanged = false) {
    async function setPolkadotNetwork() {
      if (Coin !== 'DOT') setCoin('DOT');
      updateCurrentUser();
      const { nonce, data: balance } = await api.query.system.account(userWalletPolkadot);
      setBalance((Number(balance.free.toString()) / 1e12).toString());
      setBalanceAmount(Number(balance.free.toString()) / 1e12);
    }

    async function setMetamask() {
      try {
        const Web3 = require('web3');
        const web3 = new Web3(window.ethereum);
        let Balance = await web3.eth.getBalance(window?.selectedAddress);

        setBalance((Balance / 1e18).toFixed(5));
        setBalanceAmount(Number(Balance) / 1e18);
      } catch (error) {}
    }

    if (PolkadotLoggedIn && currencyChanged == false && Coin == '') {
      switchNetworkByToken('DOT');
      setPolkadotNetwork();
    } else if (currencyChanged == true && Coin == 'DOT') {
      switchNetworkByToken('DOT');
      setPolkadotNetwork();
    } else if (currencyChanged == true && Coin !== 'DOT' && Coin !== '') {
      switchNetworkByToken('UNQ');
      setMetamask();
    }
  }
  function isInvalid() {
    return !Amount;
  }
  useEffect(() => {
    if (Coin !== '') LoadData(true);
  }, [Coin]);

  useEffect(() => {
    LoadData();
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Backdrop />
      <Modal.Panel className="sm:min-w-[480px] min-w-[95%] bg-gohan">
        <div className="flex items-center justify-center flex-col">
          <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
            <h1 className="text-moon-20 font-semibold">Donate to {eventName}</h1>
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onClose} />
          </div>
          <div className="flex flex-col gap-6 w-full max-h-[calc(90vh-162px)]">
            <form id="doanteForm" autoComplete="off">
              <div className="flex flex-col gap-2 py-16 px-6">
                <div className="flex items-center ">
                  <span className="font-semibold flex-1">Total</span>
                  <div className="max-w-[140px] mr-4"> {AmountInput}</div>
                  <Dropdown value={Coin} onChange={setCoin} className="max-w-[100px] ">
                    <Dropdown.Select>{Coin}</Dropdown.Select>
                    <Dropdown.Options className="bg-gohan w-48 min-w-0">
                      <Dropdown.Option value="UNQ">
                        <MenuItem>UNQ</MenuItem>
                      </Dropdown.Option>
                      <Dropdown.Option value="DOT">
                        <MenuItem>DOT</MenuItem>
                      </Dropdown.Option>
                    </Dropdown.Options>
                  </Dropdown>
                </div>
                {Coin == '' ? (
                  <></>
                ) : (
                  <>
                    {Number(BalanceAmount) - Amount < 1 ? (
                      <>
                        <p className=" w-full text-right text-chichi">Insufficent Balance </p>
                      </>
                    ) : (
                      <>
                        <p className="text-trunks w-full text-right">Your balance will be {Number(BalanceAmount) - Amount + ' ' + Coin} </p>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-between border-t border-beerus w-full p-6">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button animation={isLoading ? 'progress' : false} disabled={isLoading || isInvalid()} onClick={DonateCoinSubmission}>
                  Donate
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal.Panel>
    </Modal>
  );
}
