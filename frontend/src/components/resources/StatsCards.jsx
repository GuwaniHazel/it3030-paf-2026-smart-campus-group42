import { useMemo } from "react";

const StatsCards = ({ resources = [], isDarkMode = false }) => {
  const cards = useMemo(() => {
    const total = resources.length;
    const active = resources.filter((item) => item.status === "ACTIVE").length;
    const outOfService = resources.filter((item) => item.status === "OUT_OF_SERVICE").length;
    const categories = new Set(resources.map((item) => item.type)).size;
    const bookingsToday = resources.reduce((sum, item) => sum + (item.bookingsToday || 0), 0);
    const utilizationRate = total ? Math.round((active / total) * 100) : 0;

    return [
      { title: "Total Resources", value: total, icon: "📊", gradient: "from-sky-500 to-blue-600", trend: "+12%" },
      { title: "Active", value: active, icon: "✅", gradient: "from-emerald-500 to-green-600" },
      { title: "Out of Service", value: outOfService, icon: "⚠️", gradient: "from-rose-500 to-red-600" },
      { title: "Categories", value: categories, icon: "📁", gradient: "from-violet-500 to-fuchsia-600" },
      { title: "Bookings Today", value: bookingsToday, icon: "📅", gradient: "from-amber-500 to-orange-600" },
      { title: "Utilization Rate", value: `${utilizationRate}%`, icon: "📈", gradient: "from-cyan-500 to-teal-600" },
    ];
  }, [resources]);

  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <article
          key={card.title}
          className={`rounded-2xl bg-gradient-to-r ${card.gradient} p-4 text-white shadow-md ring-1 transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl ${
            isDarkMode ? "ring-white/10" : "ring-black/5"
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-2xl">{card.icon}</span>
            {card.trend && (
              <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold">
                {card.trend}
              </span>
            )}
          </div>
          <p className="text-sm text-white/85">{card.title}</p>
          <p className="text-2xl font-bold">{card.value}</p>
        </article>
      ))}
    </section>
  );
};

export default StatsCards;
