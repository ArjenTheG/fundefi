import Stats, { ProfileStats } from './Stats';
import useEnvironment from '../../services/useEnvironment';
import Loader from '../../components/components/Loader';
import Card from '../../components/components/Card';

const SummaryPanel = ({ stats, loading }: { stats: ProfileStats; loading: boolean }) => {
  const { getCurrency } = useEnvironment();

  return (
    <Card className="min-h-[556px]">
      <div className="w-full flex flex-col gap-10">
        <Loader many={2} loading={loading} width={750} height={80} element={<Stats stats={stats} currency={getCurrency()} />} />
      </div>
    </Card>
  );
};

export default SummaryPanel;
