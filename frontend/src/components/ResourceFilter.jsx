// src/components/resources/ResourceFilters.jsx
import { useState, useEffect } from 'react';

const RESOURCE_TYPES = [
    'All Types',
    'LECTURE_HALL',
    'LAB',
    'AUDITORIUM',
    'MEETING_ROOM',
    'EQUIPMENT',
    'OTHER',
];

const STATUS_OPTIONS = [
    'All Status',
    'ACTIVE',
    'OUT_OF_SERVICE',
    'MAINTENANCE',
];

const ResourceFilters = ({ onFilterChange, initialFilters = {} }) => {
    const [filters, setFilters] = useState({
        search: initialFilters.search || '',
        type: initialFilters.type || 'All Types',
        status: initialFilters.status || 'All Status',
        minCapacity: initialFilters.minCapacity || '',
        location: initialFilters.location || '',
        dateFrom: initialFilters.dateFrom || '',
        dateTo: initialFilters.dateTo || '',
    });

    const [isExpanded, setIsExpanded] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const activeFilters = {};
        
        if (filters.search) activeFilters.search = filters.search;
        if (filters.type !== 'All Types') activeFilters.type = filters.type;
        if (filters.status !== 'All Status') activeFilters.status = filters.status;
        if (filters.minCapacity) activeFilters.minCapacity = filters.minCapacity;
        if (filters.location) activeFilters.location = filters.location;
        if (filters.dateFrom) activeFilters.dateFrom = filters.dateFrom;
        if (filters.dateTo) activeFilters.dateTo = filters.dateTo;
        
        onFilterChange(activeFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            search: '',
            type: 'All Types',
            status: 'All Status',
            minCapacity: '',
            location: '',
            dateFrom: '',
            dateTo: '',
        };
        setFilters(resetFilters);
        onFilterChange({});
    };

    return (
        <div className="filters-container">
            <form onSubmit={handleSubmit}>
                {/* Basic Search Row */}
                <div className="filters-basic">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            name="search"
                            placeholder="Search by name or location..."
                            value={filters.search}
                            onChange={handleChange}
                            className="search-input"
                        />
                    </div>
                    
                    <select name="type" value={filters.type} onChange={handleChange} className="filter-select">
                        {RESOURCE_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    
                    <select name="status" value={filters.status} onChange={handleChange} className="filter-select">
                        {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    
                    <button type="button" className="expand-btn" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? '▲ Less Filters' : '▼ More Filters'}
                    </button>
                    
                    <button type="submit" className="apply-btn">Apply Filters</button>
                    <button type="button" className="reset-btn" onClick={handleReset}>Reset</button>
                </div>

                {/* Expanded Filters */}
                {isExpanded && (
                    <div className="filters-advanced">
                        <div className="filter-group">
                            <label>Min Capacity</label>
                            <input
                                type="number"
                                name="minCapacity"
                                placeholder="e.g., 30"
                                value={filters.minCapacity}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="filter-group">
                            <label>Location</label>
                            <input
                                type="text"
                                name="location"
                                placeholder="e.g., Floor 2"
                                value={filters.location}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="filter-group">
                            <label>Available From</label>
                            <input
                                type="date"
                                name="dateFrom"
                                value={filters.dateFrom}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="filter-group">
                            <label>Available To</label>
                            <input
                                type="date"
                                name="dateTo"
                                value={filters.dateTo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default ResourceFilters;