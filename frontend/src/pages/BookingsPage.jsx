import { useState } from "react";
import { FaCalendarAlt, FaChartBar, FaPlusCircle, FaUserShield } from "react-icons/fa";
import CreateBooking from "./CreateBooking";
import MyBookings from "./MyBookings";
import AdminBookings from "./AdminBookings";
import BookingDashboard from "./BookingDashboard";

const TABS = [
  { id: "create",    label: "New Booking",  icon: FaPlusCircle },
  { id: "my",        label: "My Bookings",  icon: FaCalendarAlt },
  { id: "admin",     label: "Admin Desk",   icon: FaUserShield },
  { id: "dashboard", label: "Analytics",    icon: FaChartBar },
];

const BookingsPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-cyan-50/60 py-8 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-10">

            <div>
              <span className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300">
                Booking Management
              </span>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Book campus resources, simply and instantly.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                Request lecture halls, labs, and equipment. Admins approve or reject bookings with a reason, and you can track every request in real time.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "border-cyan-600 bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
                          : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
                      }`}
                    >
                      <Icon className="text-xs" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Instant requests" value="24/7" note="Submit bookings any time" />
              <StatCard label="Tracking"         value="Live" note="See status changes instantly" />
              <StatCard label="Roles"            value="2 views" note="Student and admin workflows" />
              <StatCard label="Resources"        value="1 hub" note="Halls, labs, equipment & more" />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:p-8">
          {activeTab === "create"    && <CreateBooking onSuccess={() => setActiveTab("my")} />}
          {activeTab === "my"        && <MyBookings />}
          {activeTab === "admin"     && <AdminBookings />}
          {activeTab === "dashboard" && <BookingDashboard />}
        </section>

      </div>
    </div>
  );
};

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{note}</p>
    </div>
  );
}

export default BookingsPage;
