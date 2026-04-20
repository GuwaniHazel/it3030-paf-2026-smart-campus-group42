import { useMemo } from "react";

const TYPE_CONFIG = [
  { key: "LECTURE_HALL", label: "Lecture Hall", barClass: "bg-blue-500" },
  { key: "LAB", label: "Lab", barClass: "bg-green-500" },
  { key: "AUDITORIUM", label: "Auditorium", barClass: "bg-purple-500" },
  { key: "MEETING_ROOM", label: "Meeting Room", barClass: "bg-orange-500" },
  { key: "EQUIPMENT", label: "Equipment", barClass: "bg-gray-500" },
];

const ResourcesByTypeChart = ({ resources = [], isDarkMode = false, className = "" }) => {
  const chartRows = useMemo(() => {
    const total = resources.length;

    return TYPE_CONFIG.map((type) => {
      const count = resources.filter((resource) => resource.type === type.key).length;
      const percent = total === 0 ? 0 : Math.round((count / total) * 100);

      return {
        ...type,
        count,
        percent,
        width: `${percent}%`,
      };
    });
  }, [resources]);

  const titleClass = isDarkMode ? "text-slate-100" : "text-slate-900";
  const metaClass = isDarkMode ? "text-slate-400" : "text-slate-500";
  const trackClass = isDarkMode ? "bg-slate-800" : "bg-slate-200";

  return (
    <section className={className}>
      <h2 className={`text-lg font-bold ${titleClass}`}>Resources by Type</h2>
      <p className={`mb-4 text-xs ${metaClass}`}>Dynamic distribution with live percentages</p>

      <div className="space-y-4">
        {chartRows.map((row) => (
          <div key={row.key}>
            <div className={`mb-1.5 flex items-center justify-between text-xs ${metaClass}`}>
              <span className="font-semibold">{row.label}</span>
              <span>
                {row.count} ({row.percent}%)
              </span>
            </div>
            <div className={`h-2.5 w-full overflow-hidden rounded-full ${trackClass}`}>
              <div
                className={`h-full rounded-full ${row.barClass} transition-all duration-500`}
                style={{ width: row.width }}
                aria-label={`${row.label} ${row.percent}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResourcesByTypeChart;
