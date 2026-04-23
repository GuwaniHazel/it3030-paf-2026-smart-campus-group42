const RESOURCE_TYPES = [
  { label: "All Types", value: "ALL" },
  { label: "Lecture Hall", value: "LECTURE_HALL" },
  { label: "Lab", value: "LAB" },
  { label: "Auditorium", value: "AUDITORIUM" },
  { label: "Meeting Room", value: "MEETING_ROOM" },
  { label: "Equipment", value: "EQUIPMENT" },
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Out of Service", value: "OUT_OF_SERVICE" },
  { label: "Maintenance", value: "MAINTENANCE" },
];

const ResourceFilters = ({ filters, onChange, onReset, isDarkMode = false }) => {
  const inputClassName =
    "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

  return (
    <section
      className={`space-y-4 rounded-2xl p-4 shadow-lg transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : "bg-white"
      }`}
    >
      <input
        type="text"
        value={filters.search}
        onChange={(event) => onChange("search", event.target.value)}
        placeholder="Search by name, type, status, or location"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={filters.type}
          onChange={(event) => onChange("type", event.target.value)}
          className={inputClassName}
        >
          {RESOURCE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(event) => onChange("status", event.target.value)}
          className={inputClassName}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <select
          value={filters.capacity}
          onChange={(event) => onChange("capacity", event.target.value)}
          className={inputClassName}
        >
          <option value="ALL">All Capacities</option>
          <option value="SMALL">Small (1 - 50)</option>
          <option value="MEDIUM">Medium (51 - 150)</option>
          <option value="LARGE">Large (151+)</option>
        </select>

        <input
          type="text"
          value={filters.location}
          onChange={(event) => onChange("location", event.target.value)}
          placeholder="Filter by location"
          className={inputClassName}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Reset Filters
        </button>
      </div>
    </section>
  );
};

export default ResourceFilters;
