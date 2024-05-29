import Head from 'next/head';
import { useEffect } from 'react';

export default function Logout() {
  useEffect(() => {
    localStorage.clear();
    window.location.href = '/';
  }, []);

  return (
    <>
      <Head>
        <title>Logout</title>
        <meta name="description" content="PlanetDAO - Logout" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`gap-8 flex w-full bg-gohan pt-10 pb-6 border-beerus border`}>
        <div className="container flex flex-col gap-2 w-full justify-between">
          <h1 className="text-moon-32 font-bold">Logging out...</h1>
        </div>
      </div>
    </>
  );
}
