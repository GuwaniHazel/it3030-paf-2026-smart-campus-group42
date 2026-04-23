import {
  HiPencilSquare,
  HiCalendarDays,
  HiTrash,
} from "react-icons/hi2";

const mockResources = [
  {
    id: 1,
    name: "AI Lab 01",
    type: "LAB",
    capacity: 40,
    location: "Building C - Floor 1",
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Main Auditorium",
    type: "AUDITORIUM",
    capacity: 300,
    location: "Main Block",
    status: "MAINTENANCE",
  },
  {
    id: 3,
    name: "Lecture Hall A1",
    type: "LECTURE_HALL",
    capacity: 120,
    location: "Building A - Floor 2",
    status: "ACTIVE",
  },
  {
    id: 4,
    name: "Lecture Hall B2",
    type: "LECTURE_HALL",
    capacity: 80,
    location: "Building B - Floor 1",
    status: "OUT_OF_SERVICE",
  },
  {
    id: 5,
    name: "Robotics Lab",
    type: "LAB",
    capacity: 35,
    location: "Innovation Wing",
    status: "ACTIVE",
  },
];

const typeConfig = {
  LAB: {
    icon: "🔬",
    label: "Lab",
    className: "bg-sky-100 text-sky-700",
  },
  AUDITORIUM: {
    icon: "🎭",
    label: "Auditorium",
    className: "bg-violet-100 text-violet-700",
  },
  LECTURE_HALL: {
    icon: "📚",
    label: "Lecture Hall",
    className: "bg-amber-100 text-amber-700",
  },
};

const statusConfig = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-100 text-emerald-700",
  },
  OUT_OF_SERVICE: {
    label: "Out of Service",
    className: "bg-rose-100 text-rose-700",
  },
  MAINTENANCE: {
    label: "Maintenance",
    className: "bg-yellow-100 text-yellow-700",
  },
};

const ResourceList = ({ resources = mockResources, onEdit, onBook, onDelete }) => {
  const handleAction = (handler, resource, actionLabel) => {
    if (typeof handler === "function") {
      handler(resource);
      return;
    }
    window.alert(`${actionLabel}: ${resource.name}`);
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">Resources</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {resources.length} items
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-3">ID</th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Capacity</th>
              <th className="px-3 py-3">Location</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {resources.map((resource) => {
              const type = typeConfig[resource.type] || {
                icon: "🏷️",
                label: resource.type,
                className: "bg-slate-100 text-slate-700",
              };
              const status = statusConfig[resource.status] || {
                label: resource.status,
                className: "bg-slate-100 text-slate-700",
              };

              return (
                <tr
                  key={resource.id}
                  className="border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                >
                  <td className="px-3 py-3 font-semibold text-slate-700">#{resource.id}</td>
                  <td className="px-3 py-3 font-medium text-slate-800">{resource.name}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${type.className}`}
                    >
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{resource.capacity}</td>
                  <td className="px-3 py-3 text-slate-600">{resource.location}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction(onEdit, resource, "Edit")}
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-100 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-200"
                        title="Edit"
                      >
                        <HiPencilSquare className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAction(onBook, resource, "Book")}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200"
                        title="Book"
                      >
                        <HiCalendarDays className="h-4 w-4" />
                        Book
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAction(onDelete, resource, "Delete")}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
                        title="Delete"
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
    </section>
  );
};

export default ResourceList;
