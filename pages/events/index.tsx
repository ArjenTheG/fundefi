import Head from 'next/head';
import EventCard from '../../components/components/EventCard';
import CreateEventModal from '../../features/CreateEventModal';
import { useState } from 'react';
import { ControlsPlus } from '@heathmont/moon-icons-tw';
import { Button } from '@heathmont/moon-core-tw';
import DonateCoinToEventModal from '../../features/DonateCoinToEventModal';

let mockEvents: any[] = [
  { eventId: '1', Title: 'Annual Food Drive', End_Date: new Date(), amountOfNFTs: 8, Budget: 1000, reached: 200.53, logo: 'https://www.efsa.europa.eu/sites/default/files/news/food-donations.jpg' },
  { eventId: '2', Title: 'Annual Food Drive', End_Date: new Date(), amountOfNFTs: 8, Budget: 1400, reached: 1200.3, logo: 'https://www.efsa.europa.eu/sites/default/files/news/food-donations.jpg' }
];

export default function Events() {
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showDonateCoinModal, setShowDonateCoinModal] = useState(false);
  const [eventForDonation, setEventForDonation] = useState({ Title: '', eventId: null, wallet: '' });

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
      setEventForDonation({ Title: '', eventId: null, wallet: '' });
      setShowDonateCoinModal(false);
    }
  }

  function openCreateEventModal() {
    setShowCreateEventModal(true);
  }

  return (
    <>
      <Head>
        <title>Fundefi - Events</title>
        <meta name="description" content="Fundefi - Events" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex items-center flex-col gap-8">
        <div className="gap-8 flex flex-col w-full bg-gohan pt-10 pb-6 border-beerus border">
          <div className="container flex w-full justify-between">
            <div className="flex flex-col gap-1 overflow-hidden w-full">
              <h1 className="text-moon-32 font-bold">All events</h1>
              <h3 className="text-trunks">Here you can find all ongoing charity events</h3>
            </div>
            <Button iconLeft={<ControlsPlus />} onClick={openCreateEventModal} className="flex-shrink-0 pe-2 sm:pe-4">
              <span className="hidden sm:inline-block">Create event</span>
            </Button>
          </div>
        </div>
        <div className="container flex flex-col gap-8 items-center">
          {mockEvents.map((event, index) => (
            <EventCard item={event} key={index} onClickDonate={() => openDonateCoinModal(event)} />
          ))}
        </div>
      </div>

      <DonateCoinToEventModal open={showDonateCoinModal} onClose={closeDonateCoinModal} eventName={eventForDonation.Title} eventid={eventForDonation.eventId} recieveWallet={eventForDonation.wallet} />
      <CreateEventModal open={showCreateEventModal} onClose={closeCreateEventModal} daoId={1} />
    </>
  );
}
