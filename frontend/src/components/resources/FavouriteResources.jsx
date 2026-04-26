<<<<<<< HEAD
import { useMemo, useState } from "react";

const FavouriteResources = ({
  resources = [],
  favouriteIds = [],
  onToggleFavourite,
=======
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "userFavourites";

const FavouriteResources = ({
  userId = "student123",
  resources = [],
>>>>>>> Booking-management
  onQuickBook,
  isDarkMode = false,
  title = "Favourite Resources",
}) => {
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState("all");

  const toggleFavourite = (resourceId) => {
    onToggleFavourite?.(resourceId);
=======
  const [favouriteIds, setFavouriteIds] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        const initialPayload = { userId, favourites: [] };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPayload));
        setFavouriteIds([]);
        return;
      }

      const parsed = JSON.parse(raw);

      if (parsed?.userId !== userId || !Array.isArray(parsed?.favourites)) {
        const resetPayload = { userId, favourites: [] };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resetPayload));
        setFavouriteIds([]);
        return;
      }

      setFavouriteIds(parsed.favourites);
    } catch {
      const fallbackPayload = { userId, favourites: [] };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackPayload));
      setFavouriteIds([]);
    }
  }, [userId]);

  const persistFavourites = (nextFavourites) => {
    setFavouriteIds(nextFavourites);
    const payload = { userId, favourites: nextFavourites };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const toggleFavourite = (resourceId) => {
    const isFav = favouriteIds.includes(resourceId);
    const next = isFav
      ? favouriteIds.filter((id) => id !== resourceId)
      : [...favouriteIds, resourceId];

    persistFavourites(next);
>>>>>>> Booking-management
  };

  const favouriteResources = useMemo(
    () => resources.filter((resource) => favouriteIds.includes(resource.id)),
    [resources, favouriteIds]
  );

  const visibleResources = activeTab === "favourites" ? favouriteResources : resources;

  const cardClass = isDarkMode
    ? "border-slate-700 bg-slate-800 text-slate-100"
    : "border-slate-200 bg-white text-slate-900";

  const subtleText = isDarkMode ? "text-slate-400" : "text-slate-500";

  return (
    <section className={`rounded-2xl border p-4 shadow-sm ${cardClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className={`text-sm ${subtleText}`}>
            Save resources with the heart icon and quickly access them in the favourites tab.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-slate-300 p-1 text-sm dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3 py-1.5 font-semibold transition ${
              activeTab === "all"
                ? "bg-sky-600 text-white"
                : isDarkMode
                  ? "text-slate-200 hover:bg-slate-700"
                  : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            All Resources
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("favourites")}
            className={`rounded-lg px-3 py-1.5 font-semibold transition ${
              activeTab === "favourites"
                ? "bg-rose-600 text-white"
                : isDarkMode
                  ? "text-slate-200 hover:bg-slate-700"
                  : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            Favourites ({favouriteResources.length})
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {visibleResources.length === 0 && (
          <div
            className={`rounded-xl border border-dashed p-4 text-sm ${
              isDarkMode
                ? "border-slate-700 bg-slate-900 text-slate-400"
                : "border-slate-300 bg-slate-50 text-slate-500"
            }`}
          >
            {activeTab === "favourites"
              ? "No favourites yet. Tap the heart icon on a resource."
              : "No resources available."}
          </div>
        )}

        {visibleResources.map((resource) => {
          const isFavourite = favouriteIds.includes(resource.id);

          return (
            <article
              key={resource.id}
              className={`flex flex-col gap-3 rounded-xl border p-3 transition sm:flex-row sm:items-center sm:justify-between ${
                isDarkMode
                  ? "border-slate-700 bg-slate-900"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div>
                <p className="font-semibold">{resource.name}</p>
                <p className={`text-xs ${subtleText}`}>
                  {resource.location} • {resource.type} • Capacity {resource.capacity}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFavourite(resource.id)}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
                    isFavourite
                      ? "bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/50 dark:text-rose-300"
                      : isDarkMode
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                  }`}
                  aria-label={isFavourite ? `Remove ${resource.name} from favourites` : `Add ${resource.name} to favourites`}
                  title={isFavourite ? "Remove from favourites" : "Add to favourites"}
                >
                  {isFavourite ? "❤" : "♡"}
                </button>

                <button
                  type="button"
                  onClick={() => onQuickBook?.(resource)}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                >
                  Quick Book
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default FavouriteResources;
