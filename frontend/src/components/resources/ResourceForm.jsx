import { useEffect, useState } from "react";

const RESOURCE_TYPES = [
  { label: "Lecture Hall", value: "LECTURE_HALL" },
  { label: "Lab", value: "LAB" },
  { label: "Auditorium", value: "AUDITORIUM" },
  { label: "Meeting Room", value: "MEETING_ROOM" },
  { label: "Equipment", value: "EQUIPMENT" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Out of Service", value: "OUT_OF_SERVICE" },
  { label: "Maintenance", value: "MAINTENANCE" },
];

const initialData = {
  name: "",
  type: "LECTURE_HALL",
  capacity: "",
  location: "",
  status: "ACTIVE",
  availableFrom: "08:00",
  availableTo: "17:00",
  description: "",
};

const getInputClassName = (isDarkMode) =>
  `w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${
    isDarkMode
      ? "border-slate-700 bg-slate-800 text-slate-100"
      : "border-slate-300 bg-white text-slate-700"
  }`;

const ResourceForm = ({ isOpen, isEditing, resource, onClose, onSave, isDarkMode = false }) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (resource && isEditing) {
      setFormData({
        name: resource.name || "",
        type: resource.type || "LECTURE_HALL",
        capacity: resource.capacity || "",
        location: resource.location || "",
        status: resource.status || "ACTIVE",
        availableFrom: resource.availableFrom || "08:00",
        availableTo: resource.availableTo || "17:00",
        description: resource.description || "",
      });
    } else {
      setFormData(initialData);
    }
    setErrors({});
  }, [isOpen, isEditing, resource]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: "" }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Resource name is required.";
    if (!formData.capacity || Number(formData.capacity) <= 0) {
      nextErrors.capacity = "Capacity must be greater than 0.";
    }
    if (!formData.location.trim()) nextErrors.location = "Location is required.";
    if (!formData.availableFrom) nextErrors.availableFrom = "Available from is required.";
    if (!formData.availableTo) nextErrors.availableTo = "Available to is required.";
    if (formData.availableFrom >= formData.availableTo) {
      nextErrors.availableTo = "Available To must be later than Available From.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        capacity: Number(formData.capacity),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputClassName = getInputClassName(isDarkMode);
  const labelClassName = isDarkMode ? "text-slate-300" : "text-slate-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 backdrop-blur-sm ${
          isDarkMode ? "bg-slate-950/70" : "bg-slate-900/55"
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      <div className={`relative z-10 w-full max-w-2xl rounded-2xl shadow-2xl transition duration-200 animate-[fadeIn_.2s_ease-out] ${
        isDarkMode ? "bg-slate-900" : "bg-white"
      }`}>
        <div className={`flex items-center justify-between border-b px-5 py-4 ${
          isDarkMode ? "border-slate-800" : "border-slate-200"
        }`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
            {isEditing ? "Edit Resource" : "Add Resource"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-2 py-1 transition ${
              isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={`mb-1 block text-sm font-medium ${labelClassName}`}>Resource Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClassName}
                placeholder="e.g. Main Lecture Hall"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
            </div>

            <div>
              <label className={`mb-1 block text-sm font-medium ${labelClassName}`}>Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className={inputClassName}>
                {RESOURCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`mb-1 block text-sm font-medium ${labelClassName}`}>Capacity *</label>
              <input
                type="number"
                min="1"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className={inputClassName}
              />
              {errors.capacity && <p className="mt-1 text-xs text-rose-600">{errors.capacity}</p>}
            </div>

            <div>
              <label className={`mb-1 block text-sm font-medium ${labelClassName}`}>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Building and floor"
              />
              {errors.location && <p className="mt-1 text-xs text-rose-600">{errors.location}</p>}
            </div>

            <div>
              <label className={`mb-1 block text-sm font-medium ${labelClassName}`}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClassName}>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`mb-1 block text-sm font-medium ${labelClassName}`}>Available From</label>
              <input
                type="time"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
                className={inputClassName}
              />
              {errors.availableFrom && <p className="mt-1 text-xs text-rose-600">{errors.availableFrom}</p>}
            </div>

            <div>
              <label className={`mb-1 block text-sm font-medium ${labelClassName}`}>Available To</label>
              <input
                type="time"
                name="availableTo"
                value={formData.availableTo}
                onChange={handleChange}
                className={inputClassName}
              />
              {errors.availableTo && <p className="mt-1 text-xs text-rose-600">{errors.availableTo}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className={`mb-1 block text-sm font-medium ${labelClassName}`}>Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Optional notes"
              />
            </div>
          </div>

          <div className={`flex items-center justify-end gap-2 border-t pt-4 ${
            isDarkMode ? "border-slate-800" : "border-slate-200"
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                isDarkMode
                  ? "border-slate-700 text-slate-100 hover:bg-slate-800"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceForm;
