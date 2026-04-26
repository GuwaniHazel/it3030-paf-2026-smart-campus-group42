// frontend/src/App.js
import { useLocation, useNavigate } from "react-router-dom";
import ResourcesPage from "./pages/ResourcesPage";
import HomePage from "./pages/HomePage";
import AboutUsPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUs";
import TicketsPage from "./pages/TicketsPage";
import BookingsPage from "./pages/BookingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import LoginPage from "./pages/LoginPage";
import OAuth2SuccessPage from "./pages/OAuth2SuccessPage";
import Layout from "./components/layout/Layout";

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

  // ── Booking Management (all booking sub-pages live inside BookingsPage) ──
  if (pathname.startsWith("/bookings")) {
    content = <BookingsPage />;
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

  if (pathname.startsWith("/oauth2/success")) {
    content = <OAuth2SuccessPage navigate={navigate} />;
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
