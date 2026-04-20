import { useEffect, useState } from "react";
import ResourcesPage from "./pages/ResourcesPage";

const getPath = () => (typeof window !== "undefined" ? window.location.pathname : "/");

const LandingPage = ({ navigate }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-4 py-12">
    <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Smart Campus</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-5xl">Resource Management System</h1>
      <p className="mt-4 max-w-2xl text-sm text-slate-600 md:text-base">
        Choose a role to enter the resource dashboard.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="rounded-2xl bg-sky-600 px-6 py-5 text-left text-white transition hover:-translate-y-1 hover:bg-sky-700"
        >
          <span className="block text-sm font-semibold uppercase tracking-wide opacity-80">Admin</span>
          <span className="mt-1 block text-xl font-bold">Manage resources</span>
          <span className="mt-2 block text-sm opacity-90">Full CRUD, bulk actions, status management, CSV export.</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/student")}
          className="rounded-2xl bg-emerald-600 px-6 py-5 text-left text-white transition hover:-translate-y-1 hover:bg-emerald-700"
        >
          <span className="block text-sm font-semibold uppercase tracking-wide opacity-80">Student</span>
          <span className="mt-1 block text-xl font-bold">Browse and book</span>
          <span className="mt-2 block text-sm opacity-90">Read-only cards with booking UI.</span>
        </button>
      </div>
    </div>
  </div>
);

function App() {
  const [pathname, setPathname] = useState(getPath());

  useEffect(() => {
    const onPopState = () => setPathname(getPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (nextPath) => {
    window.history.pushState({}, "", nextPath);
    setPathname(nextPath);
  };

  if (pathname.startsWith("/admin")) {
    return <ResourcesPage role="admin" navigate={navigate} />;
  }

  if (pathname.startsWith("/student")) {
    return <ResourcesPage role="student" navigate={navigate} />;
  }

  return <LandingPage navigate={navigate} />;
}

export default App;
