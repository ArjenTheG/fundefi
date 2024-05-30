import { useEffect, useState } from 'react';

import { Avatar, Button, IconButton, Tabs } from '@heathmont/moon-core-tw';
import { ControlsExpandAlt, FilesGeneric, SoftwareLogOut } from '@heathmont/moon-icons-tw';
import Head from 'next/head';
import useContract from '../../services/useContract';
import PolkadotConfig from '../../contexts/json/polkadot-config.json';
import { useRouter } from 'next/router';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
import TransactionsPanel from '../../features/TransactionsPanel';
import BadgesPanel from '../../features/BadgesPanel';
import CollectiblesPanel from '../../features/CollectiblesPanel';

export default function Profile() {
  const { contract } = useContract();

  const { api, getUserInfoById, GetAllDaos, GetAllIdeas, GetAllGoals, GetAllJoined, GetAllVotes, GetAllUserDonations } = usePolkadotContext();
  const [loading, setLoading] = useState(true);
  const [UserBadges, setUserBadges] = useState({
    dao: false,
    joined: false,
    goal: false,
    ideas: false,
    vote: false,
    donation: false,
    comment: false,
    reply: false
  });

  const [UserInfo, setUserInfo] = useState({ fullName: '', imgIpfs: [] });
  const [tabIndex, setTabIndex] = useState(0);
  const [loggedUser, setLoggedUser] = useState(false);
  const [signerAddress, setSignerAddress] = useState('');

  const router = useRouter();

  useEffect(() => {
    fetchContractData();
  }, [contract, api, router]);

  async function fetchContractData() {
    let user_id = router.query.address;
    setSignerAddress(window.signerAddress);

    if (!contract || !api) return false;
    setLoading(true);
    if (user_id == window.userid) setLoggedUser(true);
    let user_info = (await getUserInfoById(user_id)) as any;
    setUserInfo(user_info);
    //Fetching data from Smart contract
    let allDaos = await GetAllDaos();
    let allJoined = await GetAllJoined();
    let allGoals = await GetAllGoals();
    let allIdeas = await GetAllIdeas();
    let allVotes = await GetAllVotes();
    let allDonations = await GetAllUserDonations();

    // let donated = Number(await contract._donated(Number(user_id))) / 1e18;
    let allBadges = UserBadges;

    let total_read = 0;
    let _message_read_ids = await contract._message_read_ids();
    for (let i = 0; i < _message_read_ids; i++) {
      let ReadURI = await contract.all_read_messages(i);
      if (ReadURI.wallet == user_id) {
        total_read += 1;
      }
    }

    let founddao = [];
    for (let i = 0; i < allDaos.length; i++) {
      let dao_info = allDaos[i];
      if (dao_info.user_id == user_id) {
        dao_info.id = i;
        let goal = allGoals.filter((e) => e.daoId == dao_info.daoId);
        dao_info.goals = goal;

        founddao.push(dao_info);
      }
    }
    founddao.sort(function (a, b) {
      return b.goals.length - a.goals.length;
    });

    let foundidea = allIdeas.filter((e) => Number(e.user_id) == Number(user_id));

    foundidea.sort(function (a, b) {
      return b.votes - a.votes;
    });

    let foundGoals = allGoals.filter((e) => Number(e.UserId) == Number(user_id));
    let donated = allDonations[user_id.toString()];

    allBadges['dao'] = founddao.length > 0 ? true : false;
    allBadges['joined'] = allJoined.filter((e) => Number(e.user_id) == Number(user_id)).length > 0 ? true : false;
    allBadges['goal'] = foundGoals.length > 0 ? true : false;
    allBadges['ideas'] = foundidea.length > 0 ? true : false;
    allBadges['vote'] = allVotes.filter((e) => Number(e.user_id) == Number(user_id)).length > 0 ? true : false;
    allBadges['donation'] = donated > 0 ? true : false;

    let totalDonationsRecieved = 0;
    foundidea.forEach((e) => (totalDonationsRecieved += e.donation));

    let ideasReplied = 0;
    let _message_ids = await window.contract._message_ids();
    for (let i = 0; i < _message_ids; i++) {
      let messageURI = await window.contract.all_messages(i);

      if (JSON.parse(messageURI.message).userid == user_id) {
        ideasReplied += 1;
      }
    }

    setUserBadges(allBadges);

    setLoading(false);
  }

  function goToFaucet() {
    if (localStorage.getItem('login-type') === 'polkadot') {
      window.open(`https://polkadot.js.org/apps/?rpc=${PolkadotConfig.chain_rpc}#/accounts`, '_ blank');
    } else if (localStorage.getItem('login-type') == 'metamask') {
      window.open('https://faucet.moonbeam.network/', '_ blank');
    }
  }

  function logout() {
    router.push('logout');
  }

  return (
    <>
      <Head>
        <title>Profile</title>
        <meta name="description" content="Profile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`gap-8 flex flex-col w-full bg-gohan pt-10 border-beerus border`}>
        <div className="container flex flex-col gap-4 sm:flex-row w-full justify-between relative">
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Avatar className="rounded-full border border-beerus bg-gohan text-moon-80 h-20 w-20" imageUrl={'https://' + UserInfo?.imgIpfs?.toString() + '.ipfs.nftstorage.link'} />
              <IconButton className="absolute right-0 bottom-0 rounded-moon-i-sm" size="xs" icon={<FilesGeneric className="text-gohan" color="#ffff" />} onClick={null}></IconButton>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="font-bold text-moon-32 text-raditz">{UserInfo?.fullName?.toString()}</h1>
              <h3 className="text-trunks break-all">{signerAddress}</h3>
            </div>
          </div>
          <div className="flex sm:flex-col gap-2">
            {loggedUser && (
              <Button iconLeft={<ControlsExpandAlt />} onClick={goToFaucet} className="flex-1">
                Add coin
              </Button>
            )}

            {loggedUser && (
              <Button variant="secondary" iconLeft={<SoftwareLogOut />} onClick={logout} className="flex-1">
                Log out
              </Button>
            )}
          </div>
        </div>
        <div className="container">
          <Tabs selectedIndex={tabIndex} onChange={setTabIndex}>
            <Tabs.List>
              <Tabs.Tab>Collectibles</Tabs.Tab>
              <Tabs.Tab>Badges</Tabs.Tab>
              <Tabs.Tab>Transactions</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </div>
      </div>
      <div className="container py-10">
        {tabIndex === 0 && <CollectiblesPanel />}
        {tabIndex === 1 && <BadgesPanel badges={UserBadges} />}
        {tabIndex === 2 && <TransactionsPanel />}
      </div>
    </>
  );
}
