import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-green-600",
  "from-rose-500 to-red-600",
  "from-violet-500 to-fuchsia-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-teal-600",
];

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
  <div className="flex items-center gap-3 text-sm text-slate-600">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600" />
    <span>{label}</span>
  </div>
);

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
      className={`relative z-10 w-full ${widthClass} rounded-2xl shadow-2xl animate-[slideUp_.25s_ease-out] ${
        isDarkMode ? "bg-slate-900" : "bg-white"
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
    `w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${
      isDarkMode
        ? "border-slate-700 bg-slate-800 text-slate-100"
        : "border-slate-300 bg-white text-slate-700"
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
          className={`rounded-lg px-2 py-1 text-lg leading-none transition ${
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
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
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
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
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
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              isDarkMode ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
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
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              isDarkMode ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Close
          </button>
          {canBook && (
            <button
              type="button"
              onClick={() => onBook(resource)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
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

  const headerClass = isDarkMode ? "bg-slate-900/80" : "bg-white/80";
  const shellClass = isDarkMode
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
    : "bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200";
  const panelClass = isDarkMode ? "bg-slate-900" : "bg-white";
  const panelText = isDarkMode ? "text-slate-100" : "text-slate-900";
  const subtleText = isDarkMode ? "text-slate-400" : "text-slate-500";
  const bodyText = isDarkMode ? "text-slate-300" : "text-slate-600";
  const calendarResource = detailTarget || filteredResources[0] || resources[0] || null;

  return (
    <div className={`min-h-screen p-4 transition-colors duration-300 md:p-6 ${shellClass}`}>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top bar */}
        <header className={`rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-colors duration-300 ${headerClass}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={`text-2xl font-bold ${panelText}`}>Smart Campus Resource Management</h1>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isAdmin ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {isAdmin ? "ADMIN" : "STUDENT"}
                </span>
              </div>
              <p className={`text-sm ${subtleText}`}>
                {isAdmin
                  ? "Professional admin console for full CRUD and resource control."
                  : "Read-only student view with booking UI and quick browsing."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition hover:scale-[1.02] ${
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
                    className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-cyan-700"
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={openCreate}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-emerald-700"
                  >
                    + Add Resource
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => navigate?.(isAdmin ? "/student" : "/admin")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition hover:scale-[1.02] ${
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
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`stat-skel-${index}`}
                className={`h-28 animate-pulse rounded-2xl ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
              />
            ))}
          </section>
        ) : (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((card, index) => (
              <article
                key={card.title}
                className={`rounded-2xl bg-gradient-to-r ${STAT_GRADIENTS[index % STAT_GRADIENTS.length]} p-4 text-white shadow-md ring-1 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isDarkMode ? "ring-white/10" : "ring-black/5"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl">{card.icon}</span>
                  <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold">Live</span>
                </div>
                <p className="text-sm text-white/85">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </article>
            ))}
          </section>
        )}

        {/* Charts and filters */}
        <section className={`rounded-2xl p-4 shadow-lg transition-colors duration-300 ${panelClass}`}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <ResourcesByTypeChart resources={resources} isDarkMode={isDarkMode} />
            </div>

            <div className="space-y-4">
              <h2 className={`text-lg font-bold ${panelText}`}>Search and Filters</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or location"
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-sky-400 xl:col-span-2 ${
                    isDarkMode
                      ? "border-slate-700 bg-slate-800 text-slate-100 focus:bg-slate-800"
                      : "border-slate-200 bg-slate-50 text-slate-700 focus:bg-white"
                  }`}
                />

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className={`rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-sky-400 ${
                    isDarkMode ? "border-slate-700 bg-slate-800 text-slate-100" : "border-slate-200 bg-white text-slate-700"
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
                  className={`rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-sky-400 ${
                    isDarkMode ? "border-slate-700 bg-slate-800 text-slate-100" : "border-slate-200 bg-white text-slate-700"
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
                  className={`rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-sky-400 ${
                    isDarkMode ? "border-slate-700 bg-slate-800 text-slate-100" : "border-slate-200 bg-white text-slate-700"
                  }`}
                />

                <select
                  value={capacityFilter}
                  onChange={(event) => setCapacityFilter(event.target.value)}
                  className={`rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-sky-400 ${
                    isDarkMode ? "border-slate-700 bg-slate-800 text-slate-100" : "border-slate-200 bg-white text-slate-700"
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
          <section className={`rounded-2xl p-4 shadow-lg ${panelClass}`}>
            <Spinner label="Loading resources..." />
          </section>
        )}

        {!loading && error && (
          <section className={`rounded-2xl border p-4 text-sm shadow-lg ${isDarkMode ? "border-rose-900 bg-rose-950 text-rose-200" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {error}
          </section>
        )}

        {/* Data Grid */}
        {!loading && !error && (
          <section className={`rounded-2xl p-4 shadow-lg transition-colors duration-300 ${panelClass}`}>
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
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                    className={`rounded-2xl border p-4 transition duration-200 hover:-translate-y-1 hover:shadow-md ${
                      isDarkMode ? "border-slate-700 bg-slate-800 hover:bg-slate-700" : "border-slate-200 bg-slate-50 hover:bg-white"
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <h3 className={`text-base font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>{resource.name}</h3>
                        <p className={`text-xs ${subtleText}`}>{resource.location}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => toggleFavourite(resource.id)}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-base font-bold transition ${
                            favouriteIds.includes(resource.id)
                              ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
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

                    <div className={`mb-3 space-y-1 text-sm ${bodyText}`}>
                      <p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_BADGES[resource.type]}`}>
                          <span>{TYPE_ICONS[resource.type]}</span>
                          <span>{TYPE_LABELS[resource.type]}</span>
                        </span>
                      </p>
                      <p>Capacity: {resource.capacity}</p>
                      <p>Available: {resource.availableFrom} - {resource.availableTo}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openDetails(resource)}
                        className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBook(resource)}
                        className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
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
              <div className="overflow-x-auto">
                <table className={`min-w-[1040px] w-full text-left text-sm ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>
                  <thead>
                    <tr className={`border-b text-xs uppercase tracking-wide ${isDarkMode ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                      <th className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={pageData.length > 0 && selectedIds.length === pageData.length}
                          onChange={toggleSelectAll}
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
                        className={`border-b transition duration-200 ${isDarkMode ? "border-slate-800 hover:bg-slate-800/70" : "border-slate-100 hover:bg-slate-50"}`}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(resource.id)}
                            onChange={() => toggleSelected(resource.id)}
                          />
                        </td>
                        <td className={`px-3 py-3 font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>#{resource.id}</td>
                        <td className={`px-3 py-3 font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>{resource.name}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_BADGES[resource.type]}`}>
                            <span>{TYPE_ICONS[resource.type]}</span>
                            <span>{TYPE_LABELS[resource.type]}</span>
                          </span>
                        </td>
                        <td className={`px-3 py-3 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>{resource.capacity}</td>
                        <td className={`px-3 py-3 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>{resource.location}</td>
                        <td className="px-3 py-3">
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
                            className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none transition ${
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
                              className="rounded-lg bg-sky-100 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-200"
                            >
                              Edit
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(resource)}
                              className="rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
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
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    page === 1
                      ? "cursor-not-allowed bg-slate-300 text-slate-500"
                      : isDarkMode
                        ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
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
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    page >= totalPages
                      ? "cursor-not-allowed bg-slate-300 text-slate-500"
                      : isDarkMode
                        ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
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
          <section className={`rounded-2xl p-4 shadow-lg transition-colors duration-300 ${panelClass}`}>
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
