import { Button } from '@heathmont/moon-core-tw';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Welcome() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('loggedin') && localStorage.getItem('login-type')) {
      router.push('/campaigns');
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Fundefi</title>
        <meta name="description" content="Fundefi" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="homepage-container w-full pb-16 md:min-h-full-min-header flex flex-col md:flex-row items-center gap-8 px-4 text-center md:text-left">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4 items-left text-popo mt-16">
            <h2 className="font-bold text-moon-40">Maximize your fundraising with new revenue streams</h2>
            <h5 className="text-moon-24">Leverage blockchain technology to amplify your fundraising efforts with innovative tools and seamless crypto integration.</h5>
          </div>
          <Link href="/register" className="flex justify-center">
            <Button className="shadow-moon-md bg-piccolo">Create your campaign</Button>
          </Link>
        </div>
        <Image src="/home/campaign-example.png" height={560} width={280} alt="" />
      </div>
      <div className="bg-popo flex flex-col gap-20 text-gohan py-16">
        <div className="flex homepage-container flex-col items-center md:flex-row md:gap-16 md:items-start">
          <Image className="shrink-0" src="/home/simplified.png" alt="" width={420} height={312} />
          <div className="flex flex-col gap-8 pt-10">
            <h3 className="text-moon-32 font-bold">Crypto funding simplified</h3>
            <p className="text-moon-18">Accept cryptocurrency funding in UNIQUE and POLKADOT, broadening your reach to tech-savvy donors, while ensuring transparency and security in all transactions.</p>
          </div>
        </div>
      </div>
      <div className="bg-gohan flex flex-col gap-20 text-popo py-16">
        <div className="flex homepage-container flex-col-reverse items-center md:flex-row md:gap-16 md:items-start">
          <div className="flex flex-col gap-8 pt-10">
            <h3 className="text-moon-32 font-bold">Innovative NFT donations and auctions</h3>
            <p className="text-moon-18">Allow supporters to donate NFTs, which can be auctioned to raise funds. Engage your community with creative and valuable contributions, while maximizing your fundraising potential.</p>
          </div>
          <Image className="shrink-0" src="/home/craft.png" alt="" width={380} height={424} />
        </div>
      </div>
      <div className="bg-piccolo flex flex-col gap-16 text-gohan py-16">
        <div className="flex homepage-container flex-col-reverse items-center md:flex-row md:gap-16 md:items-start">
          <div className="flex flex-col gap-8 pt-10">
            <h3 className="text-moon-32 font-bold">Dynamic bidding system</h3>
            <p className="text-moon-18">Facilitate an engaging and competitive environment by enabling users to place bids on NFTs using UNIQUE and POLKADOT coins. Drive higher contributions through an exciting auction process.</p>
          </div>
        </div>
        <div className="flex justify-center">
          <Image className="shrink-0" src="/home/nft-example.png" alt="" width={380} height={350} />
        </div>
        <div className="flex homepage-container flex-col items-center md:flex-row md:gap-16 md:items-start">
          <div className="flex flex-col gap-8">
            <h3 className="text-moon-32 font-bold">Efficient NFT distribution</h3>
            <p className="text-moon-18">Automatically distribute NFTs to the highest bidders, ensuring a smooth and transparent process. Focus on your cause while our platform handles the logistics.</p>
          </div>
        </div>
      </div>
      <div className="bg-brief flex flex-col gap-20 text-gohan py-16">
        <div className="flex homepage-container flex-col-reverse items-center md:flex-row md:gap-16 md:items-start">
          <div className="flex flex-col gap-8 pt-10 text-center">
            <h3 className="text-moon-32 font-bold">
              Transparent funds, <span className="text-raditz">lasting impact</span>
            </h3>
            <p className="text-moon-18">Witness the power of transparency! Track your funds seamlessly as they fuel your charity's endeavors. Every donation, every decision, making a measurable difference where it counts.</p>
          </div>
        </div>
      </div>
    </>
  );
}
