import Image from 'next/legacy/image';
import Card from '../Card';
import { ArrowsRightShort, ShopWallet, SportDarts } from '@heathmont/moon-icons-tw';
import { MouseEventHandler, useState } from 'react';
import useEnvironment from '../../../services/useEnvironment';
import { CharityEvent } from '../../../data-model/event';
import Link from 'next/link';
import { Button } from '@heathmont/moon-core-tw';
import { useRouter } from 'next/router';
import { intervalToDuration, isPast, parseISO } from 'date-fns';

const EventCard = ({ item, className = '', onClickDonate }: { item: CharityEvent; className?: string; onClickDonate?: MouseEventHandler }) => {
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const router = useRouter();
  const { getCurrency } = useEnvironment();
   // Format the duration
   let formattedDuration = '';
   const todayISO = new Date().toISOString().split('T')[0];
   const startDate = new Date(todayISO);
   let hasAlreadyPast = false;
 
   if (item.End_Date) {
     const endDate = new Date(item.End_Date);
 
     const duration = intervalToDuration({ start: startDate, end: endDate });
 
     formattedDuration += duration.days > 0 ? `${duration.days} days ` : '';
     formattedDuration += duration.hours > 0 ? `${duration.hours} hours ` : '';
     formattedDuration += duration.minutes > 0 ? `and ${duration.minutes} min` : '';
     formattedDuration = formattedDuration.trim();
 
     hasAlreadyPast = isPast(endDate) ;
   } else {
     hasAlreadyPast = true;
   }

  return (
    <Card className={`max-w-[720px] flex flex-col gap-4 relative ${className}`}>
      <div className="flex w-full">
        <div className="rounded-moon-s-md overflow-hidden flex justify-center items-center border border-beerus relative w-[80px] h-[80px] sm:w-[180px] sm:h-[180px]">
          {<Image unoptimized={true} layout="fill" objectFit="cover" src={item.logo} onError={() => setShowPlaceholder(true)} alt="" />}
          {showPlaceholder && <SportDarts className="text-moon-48 text-trunks" />}
        </div>
        <div className="flex flex-1 flex-col gap-2 relative px-5 text-moon-16">
          <p className="font-semibold text-moon-18">{item.Title}</p>
          <p className="text-trunks">
            By {item.user_info?.fullName} <br /> {hasAlreadyPast?<><span className='text-chichi'>Ended</span></>:"Ends in " +formattedDuration}
          </p>
          <div className="sm:inline-block">
            <p className="font-semibold text-moon-20 text-hit">
              {getCurrency()} {item?.reached?.toString()}
            </p>
            <p>
              raised of {getCurrency()} {item.Budget} goal
            </p>
          </div>
          <div className="hidden gap-2 sm:block items-center ">
            <p className="font-semibold text-moon-20 text-hit">{item?.amountOfNFTs}</p>
            <p>NFTs</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 relative sm:absolute sm:bottom-6 sm:right-6">
        {hasAlreadyPast?<></>:<>
        <Button className="w-full sm:w-auto flex-1" variant="secondary" iconLeft={<ShopWallet />} onClick={onClickDonate}>
          Donate
        </Button>
        </>}
       
        <Link className="w-full sm:w-auto flex-1" href={`${router.pathname}/${item.eventId}`}>
          <Button className="w-full" iconLeft={<ArrowsRightShort />}>
            Go to campaign
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default EventCard;
