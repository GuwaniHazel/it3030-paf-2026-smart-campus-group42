import {
  HiOutlineChartBar,
  HiOutlineCheckBadge,
  HiOutlineExclamationTriangle,
  HiOutlineSquares2X2,
  HiOutlineCalendarDays,
  HiOutlineArrowTrendingUp,
} from "react-icons/hi2";

const iconMap = {
  total: HiOutlineChartBar,
  active: HiOutlineCheckBadge,
  outOfService: HiOutlineExclamationTriangle,
  categories: HiOutlineSquares2X2,
  bookingsToday: HiOutlineCalendarDays,
  utilizationRate: HiOutlineArrowTrendingUp,
};

const StatsCards = ({ stats = [] }) => {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((item) => {
        const Icon = item.icon || iconMap[item.key] || HiOutlineChartBar;

        return (
          <article
            key={item.title}
            className={`group rounded-2xl bg-gradient-to-r ${item.gradient} p-4 text-white shadow-md transition duration-300 hover:scale-[1.03] hover:shadow-xl`}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                <Icon className="h-6 w-6" />
              </div>

              {item.trend && (
                <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold backdrop-blur-sm">
                  {item.trend}
                </span>
              )}
            </div>

            <p className="text-sm text-white/85">{item.title}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{item.value}</p>
          </article>
        );
      })}
    </section>
  );
};

export default StatsCards;
