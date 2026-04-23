// src/components/resources/BookingCalendar.jsx
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const THEME_STORAGE_KEY = 'booking-calendar-theme';

const BookingCalendar = ({ resourceId, resourceName, bookings = [] }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [bookedDates, setBookedDates] = useState([]);
    const [selectedSlotBookings, setSelectedSlotBookings] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === 'dark') return true;
        if (storedTheme === 'light') return false;

        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    });

    useEffect(() => {
        // Convert bookings to dates with safe parsing for partial or malformed data.
        const safeBookings = Array.isArray(bookings) ? bookings : [];
        const dates = safeBookings
            .map((booking) => {
                const parsedDate = booking?.date ? new Date(booking.date) : null;
                const hasValidDate = parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime());
                const startTime = typeof booking?.startTime === 'string' && booking.startTime.trim()
                    ? booking.startTime
                    : '00:00';
                const endTime = typeof booking?.endTime === 'string' && booking.endTime.trim()
                    ? booking.endTime
                    : startTime;

                if (!hasValidDate) {
                    return null;
                }

                return {
                    date: parsedDate,
                    startTime,
                    endTime,
                    user: booking?.userName || booking?.user || 'Unknown User',
                };
            })
            .filter(Boolean);
        setBookedDates(dates);
    }, [bookings]);

    useEffect(() => {
        setSelectedSlotBookings(getBookingsForDate(selectedDate));
    }, [bookedDates, selectedDate]);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', isDarkMode);
        root.style.colorScheme = isDarkMode ? 'dark' : 'light';

        window.localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const isDateBooked = (date) => {
        return bookedDates.some(booking => 
            booking.date.toDateString() === date.toDateString()
        );
    };

    const getBookingsForDate = (date) => {
        return bookedDates.filter(booking => 
            booking.date.toDateString() === date.toDateString()
        );
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    const toggleTheme = () => {
        setIsDarkMode((current) => !current);
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            if (isDateBooked(date)) {
                return 'rounded-lg !bg-rose-200 !text-rose-900 dark:!bg-rose-950/70 dark:!text-rose-100';
            }
        }
        return 'rounded-lg';
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month' && isDateBooked(date)) {
            return <div className="mt-1 text-[10px] leading-none">●</div>;
        }
        return null;
    };

    const calendarClassName = [
        'w-full border-0 bg-transparent text-slate-900 dark:text-slate-100',
        '[&_.react-calendar__navigation]:mb-4',
        '[&_.react-calendar__navigation]:flex',
        '[&_.react-calendar__navigation]:items-center',
        '[&_.react-calendar__navigation]:gap-2',
        '[&_.react-calendar__navigation_button]:min-h-10',
        '[&_.react-calendar__navigation_button]:rounded-xl',
        '[&_.react-calendar__navigation_button]:border',
        '[&_.react-calendar__navigation_button]:border-slate-200',
        '[&_.react-calendar__navigation_button]:bg-slate-100',
        '[&_.react-calendar__navigation_button]:px-3',
        '[&_.react-calendar__navigation_button]:py-2',
        '[&_.react-calendar__navigation_button]:text-slate-700',
        '[&_.react-calendar__navigation_button]:transition-colors',
        'dark:[&_.react-calendar__navigation_button]:border-slate-700',
        'dark:[&_.react-calendar__navigation_button]:bg-slate-800',
        'dark:[&_.react-calendar__navigation_button]:text-slate-100',
        '[&_.react-calendar__navigation_button:enabled:hover]:bg-slate-200',
        'dark:[&_.react-calendar__navigation_button:enabled:hover]:bg-slate-700',
        '[&_.react-calendar__navigation_button:enabled:focus]:bg-slate-200',
        'dark:[&_.react-calendar__navigation_button:enabled:focus]:bg-slate-700',
        '[&_.react-calendar__navigation__label]:flex-1',
        '[&_.react-calendar__navigation__label]:font-semibold',
        '[&_.react-calendar__navigation__label]:text-slate-900',
        'dark:[&_.react-calendar__navigation__label]:text-slate-100',
        '[&_.react-calendar__month-view__weekdays]:mb-3',
        '[&_.react-calendar__month-view__weekdays]:text-xs',
        '[&_.react-calendar__month-view__weekdays]:font-semibold',
        '[&_.react-calendar__month-view__weekdays]:uppercase',
        '[&_.react-calendar__month-view__weekdays]:tracking-[0.2em]',
        '[&_.react-calendar__month-view__weekdays_abbr]:no-underline',
        '[&_.react-calendar__month-view__weekdays_abbr]:text-slate-500',
        'dark:[&_.react-calendar__month-view__weekdays_abbr]:text-slate-400',
        '[&_.react-calendar__month-view__days]:gap-1',
        '[&_.react-calendar__tile]:min-h-12',
        '[&_.react-calendar__tile]:rounded-xl',
        '[&_.react-calendar__tile]:border',
        '[&_.react-calendar__tile]:border-transparent',
        '[&_.react-calendar__tile]:text-sm',
        '[&_.react-calendar__tile]:font-medium',
        '[&_.react-calendar__tile]:text-slate-700',
        '[&_.react-calendar__tile]:transition-colors',
        '[&_.react-calendar__tile]:duration-200',
        '[&_.react-calendar__tile:enabled:hover]:border-sky-300',
        '[&_.react-calendar__tile:enabled:hover]:bg-sky-50',
        '[&_.react-calendar__tile:enabled:hover]:text-sky-700',
        'dark:[&_.react-calendar__tile:enabled:hover]:border-sky-700',
        'dark:[&_.react-calendar__tile:enabled:hover]:bg-sky-950/40',
        'dark:[&_.react-calendar__tile:enabled:hover]:text-sky-100',
        '[&_.react-calendar__tile:enabled:focus]:bg-sky-50',
        'dark:[&_.react-calendar__tile:enabled:focus]:bg-sky-950/40',
        '[&_.react-calendar__tile--now]:border-sky-400',
        '[&_.react-calendar__tile--now]:bg-sky-100',
        '[&_.react-calendar__tile--now]:text-sky-800',
        'dark:[&_.react-calendar__tile--now]:border-sky-500',
        'dark:[&_.react-calendar__tile--now]:bg-sky-950/60',
        'dark:[&_.react-calendar__tile--now]:text-sky-100',
        '[&_.react-calendar__tile--active]:!bg-sky-600',
        '[&_.react-calendar__tile--active]:!border-sky-600',
        '[&_.react-calendar__tile--active]:!text-white',
        'dark:[&_.react-calendar__tile--active]:!bg-sky-500',
        'dark:[&_.react-calendar__tile--active]:!border-sky-500',
        'dark:[&_.react-calendar__tile--active]:!text-slate-950',
        '[&_.react-calendar__tile--hasActive]:bg-sky-50',
        'dark:[&_.react-calendar__tile--hasActive]:bg-sky-950/30',
        '[&_.react-calendar__tile--disabled]:cursor-not-allowed',
        '[&_.react-calendar__tile--disabled]:text-slate-300',
        'dark:[&_.react-calendar__tile--disabled]:text-slate-700',
        '[&_.react-calendar__month-view__days__day--weekend]:text-rose-500',
        'dark:[&_.react-calendar__month-view__days__day--weekend]:text-rose-300',
    ].join(' ');

    return (
        <div className={`rounded-2xl border p-6 shadow-xl transition-colors duration-300 ${isDarkMode ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                        Booking calendar
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                        📅 {resourceName}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Red dates are already booked. Click a day to inspect reservations.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={toggleTheme}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:focus:ring-offset-slate-950"
                    aria-pressed={isDarkMode}
                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    <span>{isDarkMode ? '☀️' : '🌙'}</span>
                    <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
                </button>
            </div>
            
            <div className={`mt-6 rounded-2xl border p-4 shadow-sm transition-colors duration-300 ${isDarkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50'}`}>
                <Calendar
                    onChange={handleDateClick}
                    value={selectedDate}
                    tileClassName={tileClassName}
                    tileContent={tileContent}
                    minDate={new Date()}
                    className={calendarClassName}
                />
            </div>

            {selectedSlotBookings.length > 0 && (
                <div className={`mt-6 border-t pt-5 transition-colors duration-300 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Bookings for {selectedDate.toDateString()}
                    </h4>
                    <ul className="mt-4 space-y-3">
                        {selectedSlotBookings.map((booking, idx) => (
                            <li
                                key={idx}
                                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"
                            >
                                <span className="font-semibold text-sky-700 dark:text-sky-300">
                                    {booking.startTime} - {booking.endTime}
                                </span>
                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                    👤 {booking.user}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default BookingCalendar;