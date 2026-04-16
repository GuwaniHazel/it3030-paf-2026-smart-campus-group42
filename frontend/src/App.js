import "bootstrap/dist/css/bootstrap.min.css";
import ResourcesPage from "./pages/ResourcesPage";

function App() {
  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand mb-0 h1">Smart Campus - Facilities Management</span>
        </div>
      </nav>

      <main>
        <ResourcesPage />
      </main>
    </div>
  );
}

export default App;
