import { HiPencilSquare, HiTrash } from "react-icons/hi2";

const typeConfig = {
  LAB: { icon: "🔬", label: "Lab", className: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300" },
  AUDITORIUM: { icon: "🎭", label: "Auditorium", className: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300" },
  LECTURE_HALL: { icon: "📚", label: "Lecture Hall", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" },
  MEETING_ROOM: { icon: "🏢", label: "Meeting Room", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" },
  EQUIPMENT: { icon: "🧰", label: "Equipment", className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300" },
};

const statusConfig = {
  ACTIVE: { label: "Active", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" },
  OUT_OF_SERVICE: { label: "Out of Service", className: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300" },
  MAINTENANCE: { label: "Maintenance", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" },
};

const ResourceList = ({
  resources = [],
  onEdit,
  onDelete,
  isDarkMode = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  return (
    <section
      className={`rounded-2xl p-4 shadow-lg transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : "bg-white"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`text-lg font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
          Resource List
        </h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isDarkMode ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-600"
          }`}
        >
          {resources.length} items
        </span>
      </div>

      <div className="space-y-3 sm:hidden">
        {resources.map((resource) => {
          const type = typeConfig[resource.type] || {
            icon: "🏷️",
            label: resource.type,
            className: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
          };
          const status = statusConfig[resource.status] || {
            label: resource.status,
            className: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
          };

          return (
            <article
              key={`card-${resource.id}`}
              className={`rounded-xl border p-3 transition duration-200 ${
                isDarkMode
                  ? "border-slate-700 bg-slate-800"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className={`text-sm font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
                  {resource.name}
                </h3>
                <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>ID: #{resource.id}</p>
                <p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${type.className}`}>
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </span>
                </p>
                <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>Capacity: {resource.capacity}</p>
                <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>Location: {resource.location}</p>
                <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
                  Available: {resource.availableFrom} - {resource.availableTo}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(resource)}
                  className="inline-flex items-center gap-1 rounded-lg bg-sky-100 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition duration-200 hover:scale-105 hover:bg-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:hover:bg-sky-900/70"
                >
                  <HiPencilSquare className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(resource)}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition duration-200 hover:scale-105 hover:bg-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-900/70"
                >
                  <HiTrash className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr
              className={`border-b text-xs uppercase tracking-wide ${
                isDarkMode
                  ? "border-slate-700 text-slate-400"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              <th className="px-3 py-3">ID</th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Capacity</th>
              <th className="px-3 py-3">Location</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Available</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {resources.map((resource) => {
              const type = typeConfig[resource.type] || {
                icon: "🏷️",
                label: resource.type,
                className: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
              };
              const status = statusConfig[resource.status] || {
                label: resource.status,
                className: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
              };

              return (
                <tr
                  key={resource.id}
                  className={`border-b transition duration-200 ${
                    isDarkMode
                      ? "border-slate-800 hover:bg-slate-800/70"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <td className={`px-3 py-3 font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    #{resource.id}
                  </td>
                  <td className={`px-3 py-3 font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                    {resource.name}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${type.className}`}>
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </span>
                  </td>
                  <td className={`px-3 py-3 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                    {resource.capacity}
                  </td>
                  <td className={`px-3 py-3 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                    {resource.location}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className={`px-3 py-3 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                    {resource.availableFrom} - {resource.availableTo}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(resource)}
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-100 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition duration-200 hover:scale-105 hover:bg-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:hover:bg-sky-900/70"
                      >
                        <HiPencilSquare className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(resource)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition duration-200 hover:scale-105 hover:bg-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-900/70"
                      >
                        <HiTrash className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
            currentPage === 1
              ? "cursor-not-allowed bg-slate-300 text-slate-500"
              : isDarkMode
                ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          Previous
        </button>

        <span className={`text-xs font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
            currentPage >= totalPages
              ? "cursor-not-allowed bg-slate-300 text-slate-500"
              : isDarkMode
                ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default ResourceList;
