import { useState } from "react";

const initialFilters = {
  type: "",
  status: "",
  location: "",
  minCapacity: "",
};

const ResourceFilter = ({ onFilter }) => {
  const [filters, setFilters] = useState(initialFilters);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (onFilter) {
      onFilter(filters);
    }
  };

  const handleClear = () => {
    setFilters(initialFilters);
    if (onFilter) {
      onFilter(initialFilters);
    }
  };

  return (
    <form className="row g-3 align-items-end" onSubmit={handleSearch}>
      <div className="col-md-3">
        <label htmlFor="type" className="form-label">
          Type
        </label>
        <input
          id="type"
          name="type"
          type="text"
          className="form-control"
          placeholder="Enter type"
          value={filters.type}
          onChange={handleChange}
        />
      </div>

      <div className="col-md-3">
        <label htmlFor="status" className="form-label">
          Status
        </label>
        <select
          id="status"
          name="status"
          className="form-select"
          value={filters.status}
          onChange={handleChange}
        >
          <option value="">All</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
        </select>
      </div>

      <div className="col-md-3">
        <label htmlFor="location" className="form-label">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          className="form-control"
          placeholder="Enter location"
          value={filters.location}
          onChange={handleChange}
        />
      </div>

      <div className="col-md-3">
        <label htmlFor="minCapacity" className="form-label">
          Min Capacity
        </label>
        <input
          id="minCapacity"
          name="minCapacity"
          type="number"
          min="0"
          className="form-control"
          placeholder="0"
          value={filters.minCapacity}
          onChange={handleChange}
        />
      </div>

      <div className="col-12 d-flex gap-2">
        <button type="submit" className="btn btn-primary">
          Search
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={handleClear}>
          Clear
        </button>
      </div>
    </form>
  );
};

export default ResourceFilter;
