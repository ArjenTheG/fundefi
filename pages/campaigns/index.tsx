import Head from 'next/head';
import EventCard from '../../components/components/EventCard';
import CreateEventModal from '../../features/CreateEventModal';
import { useEffect, useState } from 'react';
import { ControlsPlus, GenericUsers } from '@heathmont/moon-icons-tw';

import Loader from '../../components/components/Loader';
import { Button } from '@heathmont/moon-core-tw';
import DonateCoinToEventModal from '../../features/DonateCoinToEventModal';
import useContract from '../../services/useContract';
import { useUniquePolkadotContext } from '../../contexts/UniquePolkadotContext';
import EmptyState from '../../components/components/EmptyState';

let mockEvents: any[] = [
  { eventId: '1', Title: 'Annual Food Drive', End_Date: new Date(), amountOfNFTs: 8, Budget: 1000, reached: 200.53, logo: 'https://www.efsa.europa.eu/sites/default/files/news/food-donations.jpg' },
  { eventId: '2', Title: 'Annual Food Drive', End_Date: new Date(), amountOfNFTs: 8, Budget: 1400, reached: 1200.3, logo: 'https://www.efsa.europa.eu/sites/default/files/news/food-donations.jpg' }
];

export default function Events() {
  const { api, GetAllEvents, GetAllJoined } = useUniquePolkadotContext();

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showDonateCoinModal, setShowDonateCoinModal] = useState(false);
  const [eventForDonation, setEventForDonation] = useState({ Title: '', eventId: null, wallet: '', type:"" });
  const [joinedDaosList, setJoinedDaosList] = useState([]);

  const { contractUnique } = useContract();
  function closeCreateEventModal(event) {
    if (event) {
      setShowCreateEventModal(false);
    }
  }

  function openDonateCoinModal(selectedEvent) {
    setEventForDonation(selectedEvent);
    setShowDonateCoinModal(true);
  }

  function closeDonateCoinModal(event) {
    if (event) {
      setEventForDonation(event);
      setShowDonateCoinModal(false);
    }
  }

  function openCreateEventModal() {
    setShowCreateEventModal(true);
  }

  
  useEffect(() => {
    fetchData();
  }, [contractUnique, api]);

  async function fetchData() {
    if (contractUnique && api) {
      setLoading(true);
      let allEvents = await GetAllEvents();
      let allJoined = await GetAllJoined();

      const joinedDaosList = [];

      allEvents.forEach((event) => {
        if (Number(event.user_id) === Number(window.userid)) {
          joinedDaosList.push(event);
        }
      });

      setLoading(false);
      setList(allEvents.reverse());
      setJoinedDaosList(joinedDaosList);
    }
  }

  return (
    <>
      <Head>
        <title>Fundefi - Campaigns</title>
        <meta name="description" content="Fundefi - Campaigns" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex items-center flex-col gap-8">
        <div className="gap-8 flex flex-col w-full bg-gohan pt-10 pb-6 border-beerus border">
          <div className="container flex w-full justify-between">
            <div className="flex flex-col gap-1 overflow-hidden w-full">
              <h1 className="text-moon-32 font-bold">All campaigns</h1>
              <h3 className="text-trunks">Here you can find all ongoing campaigns</h3>
            </div>
            <Button iconLeft={<ControlsPlus />} onClick={openCreateEventModal} className="flex-shrink-0 pe-2 sm:pe-4">
              <span className="hidden sm:inline-block">Create campaign</span>
            </Button>
          </div>
        </div>
        <div className="container flex flex-col gap-8 items-center">
        <Loader element={list.length > 0 ? list.map((listItem, index) => <EventCard  item={listItem} key={index}  onClickDonate={() => openDonateCoinModal(listItem)} />) : <EmptyState icon={<GenericUsers className="text-moon-48" />} label="There are no Campaigns created yet" />} loading={loading} width={'100%'} height={236} many={3} />{' '}
       
        </div>
      </div>

      <DonateCoinToEventModal open={showDonateCoinModal} onClose={closeDonateCoinModal} eventName={eventForDonation.Title} eventid={eventForDonation.eventId} recieveWallet={eventForDonation.wallet} recievetype={eventForDonation.type} address={eventForDonation.wallet} />
      <CreateEventModal open={showCreateEventModal} onClose={closeCreateEventModal} />
    </>
  );
}
