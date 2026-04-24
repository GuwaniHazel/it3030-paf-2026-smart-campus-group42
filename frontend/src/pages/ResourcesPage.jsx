import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import ResourcesByTypeChart from "../components/resources/ResourcesByTypeChart";
import ResourceAvailabilityCalendar from "../components/resources/ResourceAvailabilityCalendar";
import FavouriteResources from "../components/resources/FavouriteResources";
import { resourceService } from "../services/resourceService";

// ------------------------------------------------------------
// Smart Campus Resource Management Dashboard
// Roles:
// - admin: full CRUD, table view, bulk delete, export CSV
// - student: read-only card view, booking UI only
// ------------------------------------------------------------

const ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
};

const RESOURCE_TYPES = ["LECTURE_HALL", "LAB", "AUDITORIUM", "MEETING_ROOM", "EQUIPMENT"];
const RESOURCE_STATUSES = ["ACTIVE", "OUT_OF_SERVICE", "MAINTENANCE"];
const PAGE_SIZE = 6;
const FAVOURITES_STORAGE_KEY = "userFavourites";

const TYPE_LABELS = {
  LECTURE_HALL: "Lecture Hall",
  LAB: "Lab",
  AUDITORIUM: "Auditorium",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT: "Equipment",
};

const STATUS_LABELS = {
  ACTIVE: "Active",
  OUT_OF_SERVICE: "Out of Service",
  MAINTENANCE: "Maintenance",
};

const TYPE_ICONS = {
  LECTURE_HALL: "📚",
  LAB: "🔬",
  AUDITORIUM: "🎭",
  MEETING_ROOM: "🏢",
  EQUIPMENT: "🧰",
};

const TYPE_BADGES = {
  LECTURE_HALL: "bg-indigo-100 text-indigo-700",
  LAB: "bg-sky-100 text-sky-700",
  AUDITORIUM: "bg-violet-100 text-violet-700",
  MEETING_ROOM: "bg-cyan-100 text-cyan-700",
  EQUIPMENT: "bg-slate-100 text-slate-700",
};

const STATUS_BADGES = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  OUT_OF_SERVICE: "bg-rose-100 text-rose-700",
  MAINTENANCE: "bg-amber-100 text-amber-700",
};

const STAT_GRADIENTS = [
  "from-blue-600 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-red-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-teal-600",
];

const TYPE_THUMBNAILS = {
  LECTURE_HALL: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format",
  LAB: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format",
  AUDITORIUM: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format",
  MEETING_ROOM: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&auto=format",
  EQUIPMENT: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format",
};

const EMPTY_FORM = {
  name: "",
  type: "LECTURE_HALL",
  capacity: "",
  location: "",
  status: "ACTIVE",
  availableFrom: "08:00",
  availableTo: "17:00",
  description: "",
};

const resolveRole = (inputRole) => {
  if (inputRole === ROLES.ADMIN || inputRole === ROLES.STUDENT) return inputRole;
  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/admin")) return ROLES.ADMIN;
    if (window.location.pathname.startsWith("/student")) return ROLES.STUDENT;
  }
  return ROLES.STUDENT;
};

const Spinner = ({ label = "Loading" }) => (
  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
    <span className="relative inline-flex h-6 w-6 items-center justify-center">
      <span className="absolute inline-flex h-6 w-6 animate-ping rounded-full bg-sky-400/30" />
      <span className="h-6 w-6 animate-spin animate-pulse rounded-full border-2 border-slate-300 border-t-sky-500" />
    </span>
    <span className="font-medium">{label}</span>
  </div>
);

const AnimatedMetric = ({ value }) => {
  const [display, setDisplay] = useState(typeof value === "number" ? 0 : value);

  useEffect(() => {
    if (typeof value !== "number") {
      const numericPart = Number.parseInt(String(value).replace(/[^0-9]/g, ""), 10);
      if (Number.isNaN(numericPart)) {
        setDisplay(value);
        return;
      }

      const suffix = String(value).replace(/[0-9]/g, "");
      const duration = 850;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        setDisplay(`${Math.round(numericPart * eased)}${suffix}`);
        if (progress < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
      return;
    }

    const duration = 850;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));
      if (progress < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  }, [value]);

  return <>{display}</>;
};

const Toast = ({ toast }) => {
  if (!toast.show) return null;

  return (
    <div className="fixed right-4 top-4 z-[80] animate-[slideIn_.25s_ease-out]">
      <div
        className={`rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${
          toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
        }`}
      >
        {toast.message}
      </div>
    </div>
  );
};

const ModalShell = ({ children, onClose, isDarkMode, widthClass = "max-w-2xl" }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
    <div
      className={`relative z-10 w-full ${widthClass} rounded-2xl border shadow-2xl animate-[slideUp_.25s_ease-out] transition-all duration-300 ${
        isDarkMode ? "border-slate-700/70 bg-slate-900/95" : "border-slate-200/80 bg-white/95"
      }`}
    >
      {children}
    </div>
  </div>
);

const ResourceFormModal = ({
  isOpen,
  isDarkMode,
  isEditing,
  resource,
  onClose,
  onSave,
  saving,
  formError,
  setFormData,
  formData,
}) => {
  if (!isOpen) return null;

  const inputClass =
    `w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all duration-200 focus:-translate-y-[1px] focus:border-sky-500 focus:ring-2 focus:ring-sky-200/60 focus:ring-blue-500 focus:outline-none ${
      isDarkMode
        ? "border-slate-700 bg-slate-800/90 text-slate-100 placeholder:text-slate-500"
        : "border-slate-300 bg-white text-slate-700 placeholder:text-slate-400"
    }`;

  const labelClass = isDarkMode ? "text-slate-300" : "text-slate-700";

  return (
    <ModalShell onClose={onClose} isDarkMode={isDarkMode}>
      <div className={`flex items-center justify-between border-b px-5 py-4 ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
        <div>
          <h3 className={`text-xl font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
            {isEditing ? "Edit Resource" : "Add Resource"}
          </h3>
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            {resource ? `Editing ${resource.name}` : "Create a new campus resource"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`rounded-lg px-2 py-1 text-lg leading-none transition-all transition-transform duration-200 hover:scale-105 active:scale-95 ${
            isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          x
        </button>
      </div>

      <form onSubmit={onSave} className="space-y-4 px-5 py-4">
        {formError && (
          <div className={`rounded-lg px-3 py-2 text-sm ${isDarkMode ? "bg-rose-950 text-rose-200" : "bg-rose-50 text-rose-700"}`}>
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={`mb-1 block text-sm font-medium ${labelClass}`}>Resource Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
              className={inputClass}
              placeholder="e.g. Main Lecture Hall"
            />
          </div>

          <div>
            <label className={`mb-1 block text-sm font-medium ${labelClass}`}>Type</label>
            <select
              value={formData.type}
              onChange={(event) => setFormData((previous) => ({ ...previous, type: event.target.value }))}
              className={inputClass}
            >
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`mb-1 block text-sm font-medium ${labelClass}`}>Capacity *</label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(event) => setFormData((previous) => ({ ...previous, capacity: event.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label className={`mb-1 block text-sm font-medium ${labelClass}`}>Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(event) => setFormData((previous) => ({ ...previous, location: event.target.value }))}
              className={inputClass}
              placeholder="Building and floor"
            />
          </div>

          <div>
            <label className={`mb-1 block text-sm font-medium ${labelClass}`}>Status</label>
            <select
              value={formData.status}
              onChange={(event) => setFormData((previous) => ({ ...previous, status: event.target.value }))}
              className={inputClass}
            >
              {RESOURCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`mb-1 block text-sm font-medium ${labelClass}`}>Available From</label>
            <input
              type="time"
              value={formData.availableFrom}
              onChange={(event) => setFormData((previous) => ({ ...previous, availableFrom: event.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label className={`mb-1 block text-sm font-medium ${labelClass}`}>Available To</label>
            <input
              type="time"
              value={formData.availableTo}
              onChange={(event) => setFormData((previous) => ({ ...previous, availableTo: event.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={`mb-1 block text-sm font-medium ${labelClass}`}>Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(event) => setFormData((previous) => ({ ...previous, description: event.target.value }))}
              className={inputClass}
              placeholder="Optional notes"
            />
          </div>
        </div>

        <div className={`flex items-center justify-end gap-2 border-t pt-4 ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-300/60 ${
              isDarkMode
                ? "border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700"
                : "border border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all transition-transform duration-200 hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-300/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

const ConfirmDeleteModal = ({ isOpen, isDarkMode, resource, onClose, onConfirm, loading }) => {
  if (!isOpen || !resource) return null;

  return (
    <ModalShell onClose={onClose} isDarkMode={isDarkMode} widthClass="max-w-md">
      <div className="px-5 py-5">
        <h3 className={`text-lg font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
          Confirm Delete
        </h3>
        <p className={`mt-2 text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
          Delete {resource.name}? This action cannot be undone.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 ${
              isDarkMode ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all transition-transform duration-200 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

const ResourceDetailsModal = ({ isOpen, isDarkMode, resource, onClose, onBook, canBook }) => {
  if (!isOpen || !resource) return null;

  return (
    <ModalShell onClose={onClose} isDarkMode={isDarkMode} widthClass="max-w-lg">
      <div className="px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
              {resource.name}
            </h3>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              {TYPE_LABELS[resource.type]} • {resource.location}
            </p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGES[resource.status]}`}>
            {STATUS_LABELS[resource.status]}
          </span>
        </div>

        <div className={`mt-4 grid grid-cols-2 gap-3 text-sm ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
          <p><span className="font-semibold">Capacity:</span> {resource.capacity}</p>
          <p><span className="font-semibold">Bookings Today:</span> {resource.bookingsToday || 0}</p>
          <p><span className="font-semibold">Available:</span> {resource.availableFrom} - {resource.availableTo}</p>
          <p><span className="font-semibold">Type:</span> {TYPE_LABELS[resource.type]}</p>
        </div>

        <p className={`mt-4 rounded-xl p-3 text-sm ${isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-50 text-slate-600"}`}>
          {resource.description || "No description available."}
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 ${
              isDarkMode ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Close
          </button>
          {canBook && (
            <button
              type="button"
              onClick={() => onBook(resource)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all transition-transform duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg active:scale-95"
            >
              Book
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

const ResourcesPage = ({ role, navigate }) => {
  const resolvedRole = resolveRole(role);
  const isAdmin = resolvedRole === ROLES.ADMIN;

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [favouriteIds, setFavouriteIds] = useState([]);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const toastTimer = useRef(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("smartCampusTheme");
      if (stored === "dark") setIsDarkMode(true);
    } catch {
      // ignore localStorage errors
    }

    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
    });
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("smartCampusTheme", isDarkMode ? "dark" : "light");
    } catch {
      // ignore localStorage errors
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isAdmin) return;

    try {
      const raw = window.localStorage.getItem(FAVOURITES_STORAGE_KEY);
      if (!raw) {
        setFavouriteIds([]);
        return;
      }

      const parsed = JSON.parse(raw);
      if (parsed?.userId === "student123" && Array.isArray(parsed?.favourites)) {
        setFavouriteIds(parsed.favourites);
        return;
      }

      setFavouriteIds([]);
    } catch {
      setFavouriteIds([]);
    }
  }, [isAdmin]);

  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast({ show: false, type: "success", message: "" });
    }, 2400);
  }, []);

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await resourceService.list();
      setResources(data);
    } catch (e) {
      setError(e.message || "Failed to load resources.");
      showToast("error", e.message || "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadResources();
    return () => window.clearTimeout(toastTimer.current);
  }, [loadResources]);

  useEffect(() => {
    AOS.refresh();
  }, [loading, resources.length, isAdmin]);

  const filteredResources = useMemo(() => {
    const q = search.trim().toLowerCase();
    const loc = locationFilter.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesQuery =
        !q || `${resource.name} ${resource.location}`.toLowerCase().includes(q);
      const matchesType = typeFilter === "ALL" || resource.type === typeFilter;
      const matchesStatus = statusFilter === "ALL" || resource.status === statusFilter;
      const matchesLocation = !loc || resource.location.toLowerCase().includes(loc);
      let matchesCapacity = true;
      if (capacityFilter === "SMALL") matchesCapacity = resource.capacity <= 50;
      if (capacityFilter === "MEDIUM") matchesCapacity = resource.capacity > 50 && resource.capacity <= 150;
      if (capacityFilter === "LARGE") matchesCapacity = resource.capacity > 150;
      return matchesQuery && matchesType && matchesStatus && matchesLocation && matchesCapacity;
    });
  }, [resources, search, typeFilter, statusFilter, locationFilter, capacityFilter]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [search, typeFilter, statusFilter, locationFilter, capacityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / PAGE_SIZE));
  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredResources.slice(start, start + PAGE_SIZE);
  }, [filteredResources, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const total = filteredResources.length;
    const active = filteredResources.filter((item) => item.status === "ACTIVE").length;
    const outOfService = filteredResources.filter((item) => item.status === "OUT_OF_SERVICE").length;
    const categories = new Set(filteredResources.map((item) => item.type)).size;
    const bookingsToday = filteredResources.reduce((sum, item) => sum + (item.bookingsToday || 0), 0);
    const utilizationRate = total ? Math.round((active / total) * 100) : 0;

    return [
      { title: "Total Resources", value: total, icon: "📊" },
      { title: "Active", value: active, icon: "✅" },
      { title: "Out of Service", value: outOfService, icon: "⚠️" },
      { title: "Categories", value: categories, icon: "📁" },
      { title: "Bookings Today", value: bookingsToday, icon: "📅" },
      { title: "Utilization Rate", value: `${utilizationRate}%`, icon: "📈" },
    ];
  }, [filteredResources]);

  const openCreate = () => {
    if (!isAdmin) return;
    setEditing(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (resource) => {
    if (!isAdmin) return;
    setEditing(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      capacity: String(resource.capacity),
      location: resource.location,
      status: resource.status,
      availableFrom: resource.availableFrom,
      availableTo: resource.availableTo,
      description: resource.description || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Resource name is required.";
    if (!formData.location.trim()) return "Location is required.";
    if (!formData.capacity || Number(formData.capacity) <= 0) return "Capacity must be greater than 0.";
    if (formData.availableFrom >= formData.availableTo) return "Available To must be later than Available From.";
    return "";
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData, capacity: Number(formData.capacity) };
      if (editing) {
        await resourceService.update(editing.id, payload);
        showToast("success", "Resource updated successfully.");
      } else {
        await resourceService.create(payload);
        showToast("success", "Resource created successfully.");
      }
      setShowForm(false);
      setEditing(null);
      await loadResources();
    } catch (e) {
      const message = e.message || "Failed to save resource.";
      setFormError(message);
      showToast("error", message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (resource) => {
    if (!isAdmin) return;
    setDeleteTarget(resource);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await resourceService.remove(deleteTarget.id);
      setSelectedIds((previous) => previous.filter((id) => id !== deleteTarget.id));
      setShowDelete(false);
      setDeleteTarget(null);
      showToast("success", "Resource deleted successfully.");
      await loadResources();
    } catch (e) {
      showToast("error", e.message || "Failed to delete resource.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleBook = (resource) => {
    setDetailTarget(resource);
    setShowDetails(true);
    showToast("success", `Booking started for ${resource.name}.`);
  };

  const toggleFavourite = (resourceId) => {
    const nextFavourites = favouriteIds.includes(resourceId)
      ? favouriteIds.filter((id) => id !== resourceId)
      : [...favouriteIds, resourceId];

    setFavouriteIds(nextFavourites);
    window.localStorage.setItem(
      FAVOURITES_STORAGE_KEY,
      JSON.stringify({ userId: "student123", favourites: nextFavourites })
    );
  };

  const openDetails = (resource) => {
    setDetailTarget(resource);
    setShowDetails(true);
  };

  const toggleSelected = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((selectedId) => selectedId !== id) : [...previous, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === pageData.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(pageData.map((resource) => resource.id));
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) return;
    setDeleteBusy(true);
    try {
      await Promise.all(selectedIds.map((id) => resourceService.remove(id)));
      setSelectedIds([]);
      showToast("success", "Selected resources deleted.");
      await loadResources();
    } catch (e) {
      showToast("error", e.message || "Bulk delete failed.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const exportCsv = () => {
    if (!isAdmin) return;
    if (!filteredResources.length) {
      showToast("error", "No resources to export.");
      return;
    }

    const headers = ["ID", "Name", "Type", "Capacity", "Location", "Status", "Available From", "Available To", "Description"];
    const rows = filteredResources.map((resource) => [
      resource.id,
      resource.name,
      TYPE_LABELS[resource.type],
      resource.capacity,
      resource.location,
      STATUS_LABELS[resource.status],
      resource.availableFrom,
      resource.availableTo,
      resource.description || "",
    ]);

    const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "resources-export.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("success", "CSV exported successfully.");
  };

  const toggleTheme = () => setIsDarkMode((previous) => !previous);

  const headerClass = isDarkMode ? "bg-slate-900/80" : "bg-white/70";
  const shellClass = isDarkMode
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
    : "bg-[radial-gradient(circle_at_10%_10%,rgba(59,130,246,0.12),transparent_40%),radial-gradient(circle_at_95%_10%,rgba(6,182,212,0.12),transparent_45%),linear-gradient(135deg,#f8fbff_0%,#eef2ff_50%,#ecfeff_100%)]";
  const panelClass = isDarkMode ? "bg-slate-900/85" : "bg-white/80";
  const panelText = isDarkMode ? "text-slate-100" : "text-slate-900";
  const subtleText = isDarkMode ? "text-slate-300" : "text-slate-600";
  const bodyText = isDarkMode ? "text-slate-300" : "text-slate-600";
  const calendarResource = detailTarget || filteredResources[0] || resources[0] || null;

  return (
    <div className={`relative min-h-screen overflow-hidden p-4 transition-colors duration-300 md:p-6 ${shellClass}`}>
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top bar */}
        <header data-aos="fade-down" className={`relative overflow-hidden rounded-3xl border p-5 shadow-2xl backdrop-blur-md transition-colors duration-300 ${headerClass} ${
          isDarkMode ? "border-slate-700/60" : "border-white/60"
        }`}>
          <div className={`absolute inset-0 ${
            isDarkMode
              ? "bg-[linear-gradient(120deg,rgba(37,99,235,.24),rgba(168,85,247,.18),rgba(6,182,212,.18))]"
              : "bg-[linear-gradient(120deg,rgba(37,99,235,.14),rgba(168,85,247,.1),rgba(6,182,212,.12))]"
          }`} />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={`bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl ${isDarkMode ? "drop-shadow-[0_1px_0_rgba(15,23,42,.7)]" : ""}`}>
                  Smart Campus Resource Management
                </h1>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isAdmin ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {isAdmin ? "ADMIN" : "STUDENT"}
                </span>
              </div>
              <p className={`mt-2 max-w-2xl text-sm ${subtleText}`}>
                {isAdmin
                  ? "Professional admin console for full CRUD and resource control."
                  : "Read-only student view with booking UI and quick browsing."}
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 ${
                  isDarkMode ? "bg-slate-700 text-slate-100 hover:bg-slate-600" : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                }`}
              >
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </button>
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={exportCsv}
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg active:scale-95"
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={openCreate}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg active:scale-95"
                  >
                    + Add Resource
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => navigate?.(isAdmin ? "/student" : "/admin")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 ${
                  isDarkMode ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Switch to {isAdmin ? "Student" : "Admin"}
              </button>
            </div>
          </div>
        </header>

        {/* Stats */}
        {loading ? (
          <section data-aos="fade-up" className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`stat-skel-${index}`}
                className={`relative h-28 overflow-hidden rounded-2xl ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
              />
            ))}
          </section>
        ) : (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((card, index) => (
              <article
                key={card.title}
                data-aos="fade-up"
                data-aos-delay={index * 70}
                className={`group relative overflow-hidden rounded-2xl border border-transparent bg-white/30 p-4 text-white shadow-md backdrop-blur-xl ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isDarkMode ? "ring-white/10" : "ring-black/5"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${STAT_GRADIENTS[index % STAT_GRADIENTS.length]} opacity-95`} />
                <div className="pointer-events-none absolute -right-5 -top-6 h-20 w-20 rounded-full bg-white/30 blur-2xl" />
                <div className="relative mb-2 flex items-center justify-between">
                  <span className="text-2xl transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">{card.icon}</span>
                  <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold">Live</span>
                </div>
                <p className="relative text-sm text-white/85">{card.title}</p>
                <p className="relative text-2xl font-bold"><AnimatedMetric value={card.value} /></p>
              </article>
            ))}
          </section>
        )}

        {/* Charts and filters */}
        <section data-aos="fade-up" className={`rounded-3xl border p-4 shadow-xl backdrop-blur-xl transition-colors duration-300 ${panelClass} ${isDarkMode ? "border-slate-700/70" : "border-white/70"}`}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <ResourcesByTypeChart resources={resources} isDarkMode={isDarkMode} />
            </div>

            <div className={`space-y-4 rounded-3xl border p-4 backdrop-blur-xl ${isDarkMode ? "border-slate-700/70 bg-slate-800/45" : "border-white/70 bg-white/60"}`}>
              <h2 className={`text-lg font-bold ${panelText}`}>Search and Filters</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or location"
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all duration-200 focus:-translate-y-[1px] focus:border-sky-400 focus:ring-2 focus:ring-sky-300/50 focus:ring-blue-500 focus:outline-none xl:col-span-2 ${
                    isDarkMode
                      ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:bg-slate-800"
                      : "border-slate-200 bg-white text-slate-700 focus:bg-white"
                  }`}
                />

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className={`rounded-xl border px-3 py-2 text-sm outline-none transition-all duration-200 focus:-translate-y-[1px] focus:border-sky-400 focus:ring-2 focus:ring-sky-300/50 focus:ring-blue-500 focus:outline-none ${
                    isDarkMode ? "border-slate-700 bg-slate-900/60 text-slate-100" : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <option value="ALL">All Types</option>
                  {RESOURCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className={`rounded-xl border px-3 py-2 text-sm outline-none transition-all duration-200 focus:-translate-y-[1px] focus:border-sky-400 focus:ring-2 focus:ring-sky-300/50 focus:ring-blue-500 focus:outline-none ${
                    isDarkMode ? "border-slate-700 bg-slate-900/60 text-slate-100" : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <option value="ALL">All Status</option>
                  {RESOURCE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={locationFilter}
                  onChange={(event) => setLocationFilter(event.target.value)}
                  placeholder="Location"
                  className={`rounded-xl border px-3 py-2 text-sm outline-none transition-all duration-200 focus:-translate-y-[1px] focus:border-sky-400 focus:ring-2 focus:ring-sky-300/50 focus:ring-blue-500 focus:outline-none ${
                    isDarkMode ? "border-slate-700 bg-slate-900/60 text-slate-100" : "border-slate-200 bg-white text-slate-700"
                  }`}
                />

                <select
                  value={capacityFilter}
                  onChange={(event) => setCapacityFilter(event.target.value)}
                  className={`rounded-xl border px-3 py-2 text-sm outline-none transition-all duration-200 focus:-translate-y-[1px] focus:border-sky-400 focus:ring-2 focus:ring-sky-300/50 focus:ring-blue-500 focus:outline-none ${
                    isDarkMode ? "border-slate-700 bg-slate-900/60 text-slate-100" : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <option value="ALL">All Capacities</option>
                  <option value="SMALL">Small (1-50)</option>
                  <option value="MEDIUM">Medium (51-150)</option>
                  <option value="LARGE">Large (151+)</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                 
                  
                 
                </div>

                <div className={`text-xs font-semibold ${subtleText}`}>
                  Showing {filteredResources.length} result{filteredResources.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Loading / Error */}
        {loading && (
          <section className={`rounded-3xl border p-4 shadow-lg backdrop-blur-xl ${panelClass} ${isDarkMode ? "border-slate-700/70" : "border-white/70"}`}>
            <div className="space-y-4">
              <Spinner label="Loading resources..." />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`resource-skeleton-${index}`}
                    className={`h-36 animate-pulse rounded-2xl bg-gradient-to-r ${isDarkMode ? "from-slate-800 via-slate-700 to-slate-800" : "from-slate-100 via-slate-50 to-slate-100"}`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {!loading && error && (
          <section className={`rounded-2xl border p-4 text-sm shadow-lg ${isDarkMode ? "border-rose-900 bg-rose-950 text-rose-200" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {error}
          </section>
        )}

        {/* Data Grid */}
        {!loading && !error && (
          <section data-aos="fade-up" className={`rounded-3xl border p-4 shadow-xl backdrop-blur-xl transition-colors duration-300 ${panelClass} ${isDarkMode ? "border-slate-700/70" : "border-white/70"}`}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h2 className={`text-lg font-bold ${panelText}`}>Resources</h2>
                <p className={`text-sm ${subtleText}`}>
                  {isAdmin
                    ? "Admin table with full management controls."
                    : "Student cards with booking-only interactions."}
                </p>
              </div>

              {isAdmin && selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={bulkDelete}
                  disabled={deleteBusy}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all transition-transform duration-200 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleteBusy ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
                </button>
              )}
            </div>

            {/* Student cards */}
            {!isAdmin && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pageData.map((resource) => (
                  <article
                    key={resource.id}
                    data-aos="fade-up"
                    className={`group relative overflow-hidden rounded-2xl border border-transparent p-4 backdrop-blur-xl transition-all duration-300 [transform-style:preserve-3d] hover:-translate-y-1 hover:scale-[1.015] hover:shadow-xl hover:[transform:perspective(1000px)_rotateX(2deg)_rotateY(-4deg)] ${
                      isDarkMode
                        ? "[background:linear-gradient(rgba(15,23,42,.7),rgba(15,23,42,.7))_padding-box,linear-gradient(120deg,rgba(56,189,248,.45),rgba(45,212,191,.45),rgba(125,211,252,.45))_border-box] hover:[background:linear-gradient(rgba(30,41,59,.85),rgba(30,41,59,.85))_padding-box,linear-gradient(120deg,rgba(56,189,248,.75),rgba(45,212,191,.75),rgba(125,211,252,.75))_border-box]"
                        : "[background:linear-gradient(rgba(255,255,255,.72),rgba(255,255,255,.72))_padding-box,linear-gradient(120deg,rgba(56,189,248,.35),rgba(16,185,129,.35),rgba(59,130,246,.35))_border-box] hover:[background:linear-gradient(rgba(255,255,255,.9),rgba(255,255,255,.9))_padding-box,linear-gradient(120deg,rgba(56,189,248,.7),rgba(16,185,129,.7),rgba(59,130,246,.7))_border-box]"
                    }`}
                  >
                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                      <img
                        src={TYPE_THUMBNAILS[resource.type]}
                        alt={TYPE_LABELS[resource.type]}
                        className="h-28 w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/35 via-purple-600/25 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
                    </div>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="relative z-10 mt-20">
                        <h3 className={`text-base font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>{resource.name}</h3>
                        <p className={`text-xs ${subtleText}`}>{resource.location}</p>
                      </div>
                      <div className="relative z-10 flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => toggleFavourite(resource.id)}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-base font-bold transition-all transition-transform duration-200 hover:scale-110 active:scale-95 ${
                            favouriteIds.includes(resource.id)
                              ? "animate-[pulse_1.2s_ease-in-out_infinite] bg-rose-100 text-rose-600 hover:bg-rose-200"
                              : isDarkMode
                                ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                          }`}
                          aria-label={favouriteIds.includes(resource.id) ? "Remove from favourites" : "Add to favourites"}
                          title={favouriteIds.includes(resource.id) ? "Remove from favourites" : "Add to favourites"}
                        >
                          {favouriteIds.includes(resource.id) ? "❤" : "♡"}
                        </button>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGES[resource.status]}`}>
                          {STATUS_LABELS[resource.status]}
                        </span>
                      </div>
                    </div>

                    <div className={`relative z-10 mb-3 space-y-1 text-sm ${bodyText}`}>
                      <p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_BADGES[resource.type]}`}>
                          <span>{TYPE_ICONS[resource.type]}</span>
                          <span>{TYPE_LABELS[resource.type]}</span>
                        </span>
                      </p>
                      <p>Capacity: {resource.capacity}</p>
                      <p>Available: {resource.availableFrom} - {resource.availableTo}</p>
                    </div>

                    <div className="relative z-10 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openDetails(resource)}
                        className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition-all transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-200 active:scale-95"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBook(resource)}
                        className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all transition-transform duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg active:scale-95"
                      >
                        Book
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Admin table */}
            {isAdmin && (
              <div className={`overflow-x-auto rounded-2xl border ${isDarkMode ? "border-slate-700/70" : "border-slate-200"}`}>
                <table className={`min-w-[1040px] w-full text-left text-sm ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>
                  <thead>
                    <tr className={`border-b bg-gradient-to-r from-blue-600 to-purple-600 text-xs uppercase tracking-[0.12em] text-white ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                      <th className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={pageData.length > 0 && selectedIds.length === pageData.length}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-slate-400 text-sky-600 focus:ring-sky-400"
                        />
                      </th>
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
                    {pageData.map((resource) => (
                      <tr
                        key={resource.id}
                        className={`border-b transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                          isDarkMode
                            ? "border-slate-800 odd:bg-slate-900/55 even:bg-slate-900/35 hover:bg-slate-700/60"
                            : "border-slate-100 odd:bg-white even:bg-slate-50/70 hover:bg-sky-50/70"
                        }`}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(resource.id)}
                            onChange={() => toggleSelected(resource.id)}
                            className="h-4 w-4 rounded border-slate-400 text-sky-600 focus:ring-sky-400"
                          />
                        </td>
                        <td className={`px-3 py-3 font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>#{resource.id}</td>
                        <td className={`px-3 py-3 font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>{resource.name}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${TYPE_BADGES[resource.type]}`}>
                            <span>{TYPE_ICONS[resource.type]}</span>
                            <span>{TYPE_LABELS[resource.type]}</span>
                          </span>
                        </td>
                        <td className={`px-3 py-3 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>{resource.capacity}</td>
                        <td className={`px-3 py-3 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>{resource.location}</td>
                        <td className="px-3 py-3">
                          <span className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                            resource.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.38)]"
                              : resource.status === "OUT_OF_SERVICE"
                                ? "bg-rose-500/20 text-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.36)]"
                                : "bg-amber-500/20 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.34)]"
                          }`}>{STATUS_LABELS[resource.status]}</span>
                          <select
                            value={resource.status}
                            onChange={async (event) => {
                              try {
                                await resourceService.update(resource.id, { status: event.target.value });
                                showToast("success", "Status updated successfully.");
                                await loadResources();
                              } catch (e) {
                                showToast("error", e.message || "Failed to update status.");
                              }
                            }}
                            className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none transition-all duration-200 focus:ring-2 focus:ring-sky-300/50 ${
                              isDarkMode
                                ? "border-slate-700 bg-slate-800 text-slate-100"
                                : "border-slate-300 bg-white text-slate-700"
                            }`}
                          >
                            {RESOURCE_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className={`px-3 py-3 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                          {resource.availableFrom} - {resource.availableTo}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(resource)}
                              className="rounded-lg bg-sky-100 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition-all transition-transform duration-200 hover:-translate-y-0.5 hover:bg-sky-200 active:scale-95"
                              title="Edit resource"
                            >
                              Edit
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(resource)}
                              className="rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-all transition-transform duration-200 hover:-translate-y-0.5 hover:bg-rose-200 active:scale-95"
                              title="Delete resource"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!filteredResources.length && (
              <div className={`rounded-xl border border-dashed px-6 py-10 text-center ${isDarkMode ? "border-slate-700 bg-slate-800 text-slate-400" : "border-slate-300 bg-slate-50 text-slate-500"}`}>
                <p className={`text-lg font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-700"}`}>No resources found</p>
                <p className="text-sm">Try adjusting your filters.</p>
              </div>
            )}

            {filteredResources.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all transition-transform duration-200 active:scale-95 ${
                    page === 1
                      ? "cursor-not-allowed bg-slate-300 text-slate-500"
                      : isDarkMode
                        ? "bg-slate-700 text-slate-100 hover:-translate-y-0.5 hover:bg-slate-600"
                        : "bg-slate-200 text-slate-700 hover:-translate-y-0.5 hover:bg-slate-300"
                  }`}
                >
                  Previous
                </button>
                <span className={`text-xs font-semibold ${subtleText}`}>
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all transition-transform duration-200 active:scale-95 ${
                    page >= totalPages
                      ? "cursor-not-allowed bg-slate-300 text-slate-500"
                      : isDarkMode
                        ? "bg-slate-700 text-slate-100 hover:-translate-y-0.5 hover:bg-slate-600"
                        : "bg-slate-200 text-slate-700 hover:-translate-y-0.5 hover:bg-slate-300"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        )}

        {!loading && !error && !isAdmin && (
          <FavouriteResources
            userId="student123"
            resources={filteredResources}
            onQuickBook={handleBook}
            isDarkMode={isDarkMode}
            title="Favourite Resources"
          />
        )}

        {!loading && !error && calendarResource && (
          <section data-aos="fade-up" className={`rounded-3xl border p-4 shadow-lg backdrop-blur-xl transition-colors duration-300 ${panelClass} ${isDarkMode ? "border-slate-700/70" : "border-white/70"}`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className={`text-lg font-bold ${panelText}`}>Resource Availability Calendar</h2>
                <p className={`text-sm ${subtleText}`}>
                  Viewing availability for {calendarResource.name}. Use Details or Book on any resource card/row to switch.
                </p>
              </div>
            </div>

            <ResourceAvailabilityCalendar
              resourceId={calendarResource.id}
              resourceName={calendarResource.name}
            />
          </section>
        )}
      </div>

      {/* Modals and notifications */}
      <ResourceFormModal
        isOpen={showForm}
        isDarkMode={isDarkMode}
        isEditing={Boolean(editing)}
        resource={editing}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        saving={saving}
        formError={formError}
        formData={formData}
        setFormData={setFormData}
      />

      <ConfirmDeleteModal
        isOpen={showDelete}
        isDarkMode={isDarkMode}
        resource={deleteTarget}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        loading={deleteBusy}
      />

      <ResourceDetailsModal
        isOpen={showDetails}
        isDarkMode={isDarkMode}
        resource={detailTarget}
        onClose={() => setShowDetails(false)}
        onBook={handleBook}
        canBook={!isAdmin}
      />

      <Toast toast={toast} />
    </div>
  );
};

export default ResourcesPage;
