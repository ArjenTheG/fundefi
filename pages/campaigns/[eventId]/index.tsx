import { Button, Tabs } from '@heathmont/moon-core-tw';
import { GenericEdit, GenericLoyalty, ShopWallet } from '@heathmont/moon-icons-tw';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useUniquePolkadotContext } from '../../../contexts/UniquePolkadotContext';
import DonateCoinToEventModal from '../../../features/DonateCoinToEventModal';
import useContract from '../../../services/useContract';
import useEnvironment from '../../../services/useEnvironment';
import DonateNFTModal from '../../../features/DonateNFTModal';
import Loader from '../../../components/components/Loader';
import Link from 'next/link';
import { NFT } from '../../../data-model/nft';
import NFTCard from '../../../components/components/NFTCard';
import BidHistoryModal from '../../../features/BidHistoryModal';
import PlaceHigherBidModal from '../../../features/PlaceHigherBidModal';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { CharityEvent } from '../../../data-model/event';

declare let window;
export default function Events() {
  //Variables
  const [nfts, setNfts] = useState([]);
  const { api, getUserInfoById,  GetAllNfts, GetAllEvents  } = useUniquePolkadotContext();
  const [eventIdTxt, setEventTxtID] = useState('');
  const [showCreateGoalModal, setShowDonateNFTModal] = useState(false);
  const [showDonateCoinModal, setShowDonateCoinModal] = useState(false);
  const [showPlaceHigherBidModal, setShowPlaceHigherBidModal] = useState<NFT | null>(null);
  const [EventID, setEventID] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [isDistributing, setDistributing] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const { sendTransaction,contractUnique } = useContract();

  const [eventType, setEventType] = useState('polkadot');
  const [showBidHistoryModal, setShowBidHistoryModal] = useState<NFT | null>(null);

  const router = useRouter();
  const { getCurrency } = useEnvironment();
  const [EventURI, setEventURI] = useState({
    EventId: '',
    daoId: '',
    Title: '',
    Description: '',
    Budget: '',
    End_Date: '',
    user_info: {
      fullName: '',
      id: null
    },
    reached: false,
    wallet: '',
    logo: '',
    isOwner: true,
    status: ''
  });

  const currentDate = new Date();
  const futureDate = new Date(currentDate.setDate(currentDate.getDate() + 3));

  const mockInfo: Partial<CharityEvent> = {
    Title: 'Annual Food Drive',
    logo: 'https://marketplace.canva.com/EAFG5wKTkFk/1/0/1131w/canva-pastel-food-drive-a4-flyer-tBm19VC3AKU.jpg',
    user_info: { fullName: 'Thomas Goethals', id: 1 },
    reached: 50,
    Budget: 75,
    status: 'Busy',
    End_Date: futureDate.getTime() as any
  };

  const mockNFTs: NFT[] = [
    {
      id: '',
      url: 'https://marketplace.canva.com/EAFG5wKTkFk/1/0/1131w/canva-pastel-food-drive-a4-flyer-tBm19VC3AKU.jpg',
      name: 'NFT LSP9',
      highestBid: { date: '20 Nov 2022 01:15PM', bidAmount: 20, bidder: 'Barry Bono', walletAddress: 'wallet-address' },
      bidHistory: [
        { date: '20 Nov 2022 01:15PM', bidAmount: 20, bidder: 'Bert Bono', walletAddress: 'wallet-address-1' },
        { date: '19 Nov 2022 01:15PM', bidAmount: 19, bidder: 'Barry Bono', walletAddress: 'wallet-address-2' },
        { date: '18 Nov 2022 01:15PM', bidAmount: 18, bidder: 'Bevin Bono', walletAddress: 'wallet-address-3' }
      ],
      description: 'A description about the token and why its worth bidding for.'
    },
    {
      id: '',
      url: 'https://marketplace.canva.com/EAFG5wKTkFk/1/0/1131w/canva-pastel-food-drive-a4-flyer-tBm19VC3AKU.jpg',
      name: 'NFT LSP9',
      highestBid: { date: '20 Nov 2022 01:15PM', bidAmount: 20, bidder: 'Barry Bono', walletAddress: 'wallet-address' },
      bidHistory: [{ date: '20 Nov 2022 01:15PM', bidAmount: 20, bidder: 'Barry Bono', walletAddress: 'wallet-address' }],
      description: 'A description about the token and why its worth bidding for.'
    },
    {
      id: '',
      url: 'https://marketplace.canva.com/EAFG5wKTkFk/1/0/1131w/canva-pastel-food-drive-a4-flyer-tBm19VC3AKU.jpg',
      name: 'NFT LSP9',
      highestBid: { date: '20 Nov 2022 01:15PM', bidAmount: 20, bidder: 'Barry Bono', walletAddress: 'wallet-address' },
      bidHistory: [{ date: '20 Nov 2022 01:15PM', bidAmount: 20, bidder: 'Barry Bono', walletAddress: 'wallet-address' }],
      description: 'A description about the token and why its worth bidding for.'
    }
  ];

  useEffect(() => {
    getEventID();
    fetchData();
  }, [contractUnique, api, router]);

  async function fetchData() {
    setEventURI(mockInfo as any);
    setLoading(false);

    if (router.query.daoId) {
      fetchContractDataFull();
    }
  }

  function getEventID() {
    const eventIdParam = router.query.eventId as string;
    if (!eventIdParam) {
      return;
    }
    setEventID(Number(eventIdParam));
    setEventTxtID(eventIdParam);
  }

  async function fetchContractDataFull() {
    setLoading(true);
    try {
      if (api && EventID !== undefined && EventID !== null) {
        //Load everything-----------

        let allEvents = await GetAllEvents();
        let eventURIFull = allEvents.filter((e) => e?.eventId == eventIdTxt.toString())[0];

        let allNfts = await GetAllNfts();
        let eventNFTs = allNfts.filter((e) => e.eventid == eventIdTxt.toString());
        console.log(eventNFTs);
        setNfts(eventNFTs);


        let user_info = await getUserInfoById(Number(eventURIFull.UserId));
        eventURIFull.user_info = user_info;
        eventURIFull.isOwner = eventURIFull.UserId == Number(window.userid);

        setEventURI(eventURIFull);
        setLoading(false);
      }
    } catch (error) {}
    setLoading(false);
  }

  function closeDonateCoinModal(event) {
    if (event) {
      setShowDonateCoinModal(false);
    }
  }

  function openDonateCoinModal() {
    setShowDonateCoinModal(true);
  }

  function closeDonateNFTModal(event) {
    if (event) {
      setShowDonateNFTModal(false);
    }
  }

  function openDonateNFTModal() {
    setShowDonateNFTModal(true);
  }

  async function distributeNFTs() {
    setDistributing(true);

    console.log('======================>Distributing NFT');
    const ToastId = toast.loading('Distributing NFT ...');

    try {
      // Creating Event in Smart contract
      await sendTransaction(await window.contractUnique.populateTransaction.distribute_nft_to_highest_bidder(Number(EventID)));
      toast.update(ToastId, {
        render: 'Distributed NFTs!',
        type: 'success',
        isLoading: false,
        autoClose: 1000,
        closeButton: true,
        closeOnClick: true,
        draggable: true
      });
    } catch (e) {
      console.error(e);
    }
    setDistributing(false);
    window.location.reload();
  }

  return (
    <>
      <Head>
        <title>Campaign</title>
        <meta name="description" content="Campaign" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`flex items-center flex-col gap-8`}>
        <div className={`gap-8 flex flex-col w-full bg-gohan pt-10 border-beerus border`}>
          <div className="container flex flex-col sm:flex-row gap-6 w-full justify-between relative">
            <div className="flex flex-col gap-1">
              <Loader
                loading={loading}
                width={300}
                element={
                  <h5>
                    <Link className="text-piccolo" href="/campaigns">
                      &lt; Back to campaigns
                    </Link>{' '}
                  </h5>
                }
              />
              <Loader loading={loading} width={300} element={<h1 className="text-moon-32 font-bold">{EventURI.Title}</h1>} />
              <Loader
                loading={loading}
                width={770}
                element={
                  <h3 className="flex gap-2 whitespace-nowrap">
                    <div className="font-bold text-piccolo">{EventURI.status === 'ended' ? 'Ended' : EventURI.End_Date ? formatDistanceToNow(EventURI.End_Date as any) : ''} left</div>
                    <div>•</div>
                    <div className="flex">
                      by&nbsp;
                      <a href={'/profile/' + EventURI.user_info.id} className="truncate text-piccolo max-w-[200px]">
                        @{EventURI.user_info.fullName}
                      </a>
                    </div>
                  </h3>
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              {EventURI.status == 'ended' ? (
                <></>
              ) : (
                <>
                  <Button className="hidden sm:flex" iconLeft={<GenericLoyalty />} onClick={openDonateNFTModal}>
                    Donate NFT
                  </Button>
                  <Button className="hidden sm:flex" iconLeft={<ShopWallet />} onClick={openDonateCoinModal}>
                    Donate Coin
                  </Button>
                  <Button variant="secondary" iconLeft={<GenericEdit />}>
                    Edit
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="container">
            <Tabs selectedIndex={tabIndex} onChange={setTabIndex}>
              <Tabs.List>
                <Tabs.Tab>Description</Tabs.Tab>
                <Tabs.Tab>NFT's on auction ({nfts.length})</Tabs.Tab>
              </Tabs.List>
            </Tabs>
          </div>
        </div>
        {tabIndex === 0 && (
          <div className="container mt-[-2rem] w-full flex-col sm:flex-row flex gap-6 pb-6">
            <div className="w-full sm:max-w-[476px] h-[476px] overflow-hidden relative">
              <Image unoptimized={true} objectFit="cover" layout="fill" className="rounded-xl object-cover" src={EventURI.logo} alt="" />
            </div>
            <div className="flex flex-col gap-5 bg-gohan rounded-xl w-full sm:max-w-[300px] items-center p-6 pt-10 shadow-moon-lg">
              <GenericLoyalty className="text-hit text-moon-48" />
              <div className="font-bold text-moon-20">
                Raised {getCurrency()} {EventURI.reached} of {EventURI.Budget}
              </div>
              {EventURI.status == 'ended' ? (
                <>
                  <div className="text-chichi text-center">Auction Ended</div>
                </>
              ) : (
                <>
                  {EventURI.isOwner ? (
                    <>
                      <div className="text-trunks text-center">NFT donations are put up for bidding at the event</div>
                      <Button animation={isDistributing ? 'progress' : false} disabled={isDistributing} className="font-bold" onClick={distributeNFTs}>
                        Distribute NFTs to highest bidder
                      </Button>
                      <div className="flex flex-1 flex-col justify-end text-center text-trunks text-moon-12">
                        99.9% of the proceeds go to the campaign. <br /> Just 0.1% goes to DAOnation.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-trunks text-center">NFTs funded are put up for bidding at the event.</div>
                      <div className="flex flex-col gap-2 w-full">
                        <Button className="w-full" iconLeft={<GenericLoyalty />} onClick={openDonateNFTModal}>
                          Fund with NFT
                        </Button>
                        <Button className="w-full" iconLeft={<ShopWallet />} onClick={openDonateCoinModal}>
                          Fund with Coin
                        </Button>
                      </div>
                      <div className="text-trunks text-moon-14 text-center">99.9% of the proceeds go to the charity. Just 0.1% goes to Fundefi.</div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        {tabIndex === 1 && (
          <div className="container mt-[-2rem] w-full flex flex-wrap gap-6 justify-center">
            {mockNFTs.map((item, i) => (
              <NFTCard className="w-2/4" item={item} key={i} onShowBidHistory={() => setShowBidHistoryModal(item)} eventStatus={EventURI.status} onShowPlaceHigherBid={() => setShowPlaceHigherBidModal(item)} />
            ))}
          </div>
        )}
      </div>

      <DonateNFTModal open={showCreateGoalModal} onClose={closeDonateNFTModal} eventid={eventIdTxt} eventName={EventURI.Title} />
      <DonateCoinToEventModal open={showDonateCoinModal} onClose={closeDonateCoinModal} eventName={EventURI.Title} eventid={EventID} recieveWallet={EventURI.wallet} />
      <PlaceHigherBidModal open={!!showPlaceHigherBidModal} onClose={() => setShowPlaceHigherBidModal(null)} item={showPlaceHigherBidModal} />
      <BidHistoryModal open={!!showBidHistoryModal} onClose={() => setShowBidHistoryModal(null)} item={showBidHistoryModal} />
    </>
  );
}
