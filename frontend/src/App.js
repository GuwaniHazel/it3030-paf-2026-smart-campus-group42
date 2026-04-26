// frontend/src/App.js
import { useLocation, useNavigate } from "react-router-dom";
import ResourcesPage from "./pages/ResourcesPage";
import HomePage from "./pages/HomePage";
import AboutUsPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUs";
import TicketsPage from "./pages/TicketsPage";
<<<<<<< HEAD
=======
import BookingsPage from "./pages/BookingsPage";
>>>>>>> Booking-management
import Layout from "./components/layout/Layout";

const PlaceholderPage = ({ title, description, navigate }) => (
  <div className="bg-slate-100 p-6 dark:bg-slate-950">
    <div className="mx-auto mt-16 max-w-2xl rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-900">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">{description}</p>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Back to Home
        </button>
      </div>
    </div>
  </div>
);

<<<<<<< HEAD
const BookingManagementPage = ({ navigate }) => (
  <PlaceholderPage
    title="Booking Management"
    description="This is a placeholder page for Module B. Booking workflows will be implemented here."
    navigate={navigate}
  />
);
=======
// Module B – Booking Management is now fully implemented.
>>>>>>> Booking-management

const NotificationsPage = ({ navigate }) => (
  <PlaceholderPage
    title="Notifications"
    description="This is a placeholder page for Module D. Real-time notifications will be implemented here."
    navigate={navigate}
  />
);

const LoginPage = ({ navigate }) => (
  <PlaceholderPage
    title="Authentication"
    description="This is a placeholder page for Module E. Login and authentication features will be implemented here."
    navigate={navigate}
  />
);

function App() {
  const location = useLocation();
  const routeNavigate = useNavigate();
  const pathname = location.pathname;

  const navigate = (nextPath) => {
    routeNavigate(nextPath);
  };

  let content = <HomePage navigate={navigate} />;

  if (pathname.startsWith("/admin")) {
    content = <ResourcesPage role="admin" navigate={navigate} />;
  }

  if (pathname.startsWith("/student")) {
    content = <ResourcesPage role="student" navigate={navigate} />;
  }

  if (pathname.startsWith("/bookings")) {
<<<<<<< HEAD
    content = <BookingManagementPage navigate={navigate} />;
=======
    content = <BookingsPage />;
>>>>>>> Booking-management
  }

  if (pathname.startsWith("/tickets")) {
    content = <TicketsPage navigate={navigate} />;
  }

  if (pathname.startsWith("/notifications")) {
    content = <NotificationsPage navigate={navigate} />;
  }

  if (pathname.startsWith("/login")) {
    content = <LoginPage navigate={navigate} />;
  }

  if (pathname.startsWith("/about")) {
    content = <AboutUsPage />;
  }

  if (pathname.startsWith("/contact")) {
    content = <ContactUsPage />;
  }

  return <Layout>{content}</Layout>;
}

export default App;