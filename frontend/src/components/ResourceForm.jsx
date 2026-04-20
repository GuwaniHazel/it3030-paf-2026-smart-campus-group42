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

const initialFormData = {
    name: "",
    type: "LECTURE_HALL",
    capacity: "",
    location: "",
    status: "ACTIVE",
    availableFrom: "08:00",
    availableTo: "17:00",
    description: "",
};

const inputClassName =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

const ResourceForm = ({ resource, isOpen, onClose, onSave, isEditing = false }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setAnimateIn(false);
            return;
        }

        const timer = setTimeout(() => setAnimateIn(true), 20);
        return () => clearTimeout(timer);
    }, [isOpen]);

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
            setFormData(initialFormData);
        }

        setErrors({});
        setShowToast(false);
    }, [resource, isEditing, isOpen]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
        if (errors[name]) {
            setErrors((previous) => ({ ...previous, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Resource Name is required.";
        if (!formData.capacity || Number(formData.capacity) <= 0) {
            newErrors.capacity = "Capacity must be greater than 0.";
        }
        if (!formData.location.trim()) newErrors.location = "Location is required.";
        if (!formData.availableFrom) newErrors.availableFrom = "Available From is required.";
        if (!formData.availableTo) newErrors.availableTo = "Available To is required.";
        if (formData.availableFrom && formData.availableTo && formData.availableFrom >= formData.availableTo) {
            newErrors.availableTo = "Available To must be later than Available From.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            if (typeof onSave === "function") {
                await onSave({ ...formData, capacity: Number(formData.capacity) });
            }

            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                onClose?.();
            }, 900);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                className={`relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl transition-all duration-200 ${
                    animateIn ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
                }`}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <h2 className="text-xl font-bold text-slate-900">
                        {isEditing ? "Edit Resource" : "Add Resource"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close modal"
                    >
                        x
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Resource Name <span className="text-rose-500">*</span>
                            </label>
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
                            <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className={inputClassName}>
                                {RESOURCE_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Capacity <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                min="1"
                                value={formData.capacity}
                                onChange={handleChange}
                                className={inputClassName}
                                placeholder="e.g. 120"
                            />
                            {errors.capacity && <p className="mt-1 text-xs text-rose-600">{errors.capacity}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Location <span className="text-rose-500">*</span>
                            </label>
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
                            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className={inputClassName}>
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Available From</label>
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
                            <label className="mb-1 block text-sm font-medium text-slate-700">Available To</label>
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
                            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className={inputClassName}
                                placeholder="Optional details about this resource"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>

            {showToast && (
                <div className="pointer-events-none fixed right-4 top-4 z-[60] rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg">
                    Resource saved successfully.
                </div>
            )}
        </div>
    );
};

export default ResourceForm;