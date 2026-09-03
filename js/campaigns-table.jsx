const { useState, useMemo, useRef, useEffect, useLayoutEffect, useId, useCallback } = React;

const PROGRAM_TYPES = ['Enterprise', 'Consumer', 'SMB', 'Partner'];
const STATUSES = ['Live', 'Draft', 'Paused', 'Ended', 'Scheduled'];
const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50];
const DEFAULT_PAGE_SIZE = 5;

const DATA_COLUMNS = [
    { id: 'name', label: 'Campaign', width: 280, minWidth: 140, sortable: true },
    { id: 'status', label: 'Status', width: 130, minWidth: 96, sortable: true },
    { id: 'startDate', label: 'Start date', width: 130, minWidth: 100, sortable: true },
    { id: 'endDate', label: 'End date', width: 130, minWidth: 100, sortable: true }
];

const FILTER_DEFS = [
    { id: 'status', label: 'Status', type: 'multi' },
    { id: 'program', label: 'Program', type: 'multi' },
    { id: 'startDate', label: 'Start date', type: 'dateRange' },
    { id: 'endDate', label: 'End date', type: 'dateRange' }
];

const CAMPAIGN_NAMES = [
    'Spring loyalty boost',
    'Q1 cardholder rewards',
    'Weekend cashback push',
    'Merchant partner promo',
    'Travel points accelerator',
    'Back-to-school offers',
    'Holiday dining deals',
    'New card welcome offer',
    'Grocery category boost',
    'Fuel savings weekend',
    'Streaming bundle promo',
    'Local retail spotlight',
    'Premium tier upgrade',
    'Small business rebate',
    'Airport lounge trial',
    'Contactless adoption',
    'Family plan incentives',
    'Wellness category push',
    'EV charging rewards',
    'Campus student offers',
    'Seasonal apparel promo',
    'Pharmacy cashback',
    'Transit fare discount',
    'Home improvement push',
    'End-of-year statement bonus'
];

function padDate(n) {
    return String(n).padStart(2, '0');
}

function formatShortDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)}`;
}

function parseInputDate(value) {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildCampaigns(count) {
    return Array.from({ length: count }, (_, index) => {
        const start = new Date(2025, index % 12, 1 + (index % 27));
        const end = new Date(start);
        end.setMonth(end.getMonth() + 3 + (index % 6));
        return {
            id: `cmp-${padDate(index + 1)}`,
            name: CAMPAIGN_NAMES[index],
            programType: PROGRAM_TYPES[index % PROGRAM_TYPES.length],
            status: STATUSES[index % STATUSES.length],
            startDate: start,
            endDate: end,
            owner: ['A. Chen', 'J. Ortiz', 'M. Patel', 'S. Kim', 'L. Brooks'][index % 5],
            budget: `$${(25 + index * 7).toLocaleString()}K`
        };
    });
}

const ALL_CAMPAIGNS = buildCampaigns(25);

const EMPTY_FILTER_VALUES = {
    status: [],
    program: [],
    startDate: { from: '', to: '' },
    endDate: { from: '', to: '' }
};

function Icon({ name, size = 16 }) {
    const props = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true
    };

    switch (name) {
        case 'upload':
            return (
                <svg {...props}>
                    <path d="M12 16V4" />
                    <path d="m7 9 5-5 5 5" />
                    <path d="M20 16.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5" />
                </svg>
            );
        case 'filter':
            return (
                <svg {...props}>
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
            );
        case 'chevron':
            return (
                <svg {...props}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            );
        case 'chevron-left':
            return (
                <svg {...props}>
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            );
        case 'chevron-right':
            return (
                <svg {...props}>
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            );
        case 'chevrons-left':
            return (
                <svg {...props}>
                    <polyline points="11 17 6 12 11 7" />
                    <polyline points="18 17 13 12 18 7" />
                </svg>
            );
        case 'chevrons-right':
            return (
                <svg {...props}>
                    <polyline points="13 17 18 12 13 7" />
                    <polyline points="6 17 11 12 6 7" />
                </svg>
            );
        case 'search':
            return (
                <svg {...props}>
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            );
        case 'search-plus':
            return (
                <svg {...props}>
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
            );
        case 'clock':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12 7 12 12 15 14" />
                </svg>
            );
        case 'trending':
            return (
                <svg {...props}>
                    <polyline points="3 17 9 11 13 15 21 7" />
                    <polyline points="14 7 21 7 21 14" />
                </svg>
            );
        case 'pencil':
            return (
                <svg {...props}>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
            );
        case 'trash':
            return (
                <svg {...props}>
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
            );
        case 'refresh':
            return (
                <svg {...props}>
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.5 9a9 9 0 0 1 14.1-3.4L23 10" />
                    <path d="M20.5 15a9 9 0 0 1-14.1 3.4L1 14" />
                </svg>
            );
        case 'x':
            return (
                <svg {...props}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            );
        case 'pause':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <line x1="10" y1="9" x2="10" y2="15" />
                    <line x1="14" y1="9" x2="14" y2="15" />
                </svg>
            );
        case 'download':
            return (
                <svg {...props}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <polyline points="9 15 12 18 15 15" />
                </svg>
            );
        case 'more':
            return (
                <svg {...props}>
                    <circle cx="12" cy="5" r="2.4" fill="currentColor" stroke="none" />
                    <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
                    <circle cx="12" cy="19" r="2.4" fill="currentColor" stroke="none" />
                </svg>
            );
        case 'sort-asc':
            return (
                <svg {...props}>
                    <polyline points="6 14 12 8 18 14" />
                </svg>
            );
        case 'sort-desc':
            return (
                <svg {...props}>
                    <polyline points="6 10 12 16 18 10" />
                </svg>
            );
        default:
            return null;
    }
}

function useClickOutside(open, onClose) {
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        function handlePointer(event) {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                onClose();
            }
        }

        function handleKey(event) {
            if (event.key === 'Escape') onClose();
        }

        document.addEventListener('mousedown', handlePointer);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handlePointer);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open, onClose]);

    return rootRef;
}

function FilterPicker({ enabledFilters, onToggleFilter, open, onToggle, onClose, callout }) {
    const rootRef = useClickOutside(open, onClose);
    const enabledCount = enabledFilters.length;

    return (
        <div className="ct-filter-picker" ref={rootRef}>
            <button
                type="button"
                className="ct-filters-btn"
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={onToggle}
                {...(callout ? { 'data-callout': callout } : {})}
            >
                <Icon name="filter" size={15} />
                Table filters
                {enabledCount > 0 ? (
                    <span className="ct-filters-count">{enabledCount}</span>
                ) : null}
                <Icon name="chevron" size={14} />
            </button>
            {open ? (
                <div className="ct-filter-menu ct-filter-picker-menu" role="menu" aria-label="Available filters">
                    <p className="ct-filter-menu-hint">Show filters for</p>
                    {FILTER_DEFS.map((filter) => {
                        const checked = enabledFilters.includes(filter.id);
                        return (
                            <label key={filter.id} className="ct-filter-option" role="menuitemcheckbox" aria-checked={checked}>
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => onToggleFilter(filter.id)}
                                />
                                <span>{filter.label}</span>
                            </label>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}

function MultiSelectFilter({ label, options, selected, onChange, open, onToggle, onClose }) {
    const rootRef = useClickOutside(open, onClose);
    const summary =
        selected.length === 0
            ? 'Any'
            : selected.length === 1
              ? selected[0]
              : `${selected.length}/${options.length}`;

    function toggleOption(option) {
        if (selected.includes(option)) {
            onChange(selected.filter((value) => value !== option));
        } else {
            onChange([...selected, option]);
        }
    }

    return (
        <div className="ct-filter-chip" ref={rootRef}>
            <button
                type="button"
                className="ct-filter-chip-btn"
                aria-expanded={open}
                aria-haspopup="listbox"
                onClick={onToggle}
            >
                <span className="ct-filter-label">{label} :</span>
                <span className="ct-filter-value">{summary}</span>
                <Icon name="chevron" size={14} />
            </button>
            {open ? (
                <div className="ct-filter-menu" role="listbox" aria-label={label} aria-multiselectable="true">
                    {options.map((option) => (
                        <label key={option} className="ct-filter-option">
                            <input
                                type="checkbox"
                                checked={selected.includes(option)}
                                onChange={() => toggleOption(option)}
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function DateRangeFilter({ label, value, onChange, open, onToggle, onClose }) {
    const rootRef = useClickOutside(open, onClose);
    const fromId = useId();
    const toId = useId();
    const hasValue = Boolean(value.from || value.to);
    const summary = !hasValue
        ? 'Any'
        : value.from && value.to
          ? `${value.from} → ${value.to}`
          : value.from
            ? `From ${value.from}`
            : `Until ${value.to}`;

    return (
        <div className="ct-filter-chip" ref={rootRef}>
            <button
                type="button"
                className="ct-filter-chip-btn"
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={onToggle}
            >
                <span className="ct-filter-label">{label} :</span>
                <span className="ct-filter-value">{summary}</span>
                <Icon name="chevron" size={14} />
            </button>
            {open ? (
                <div className="ct-filter-menu ct-filter-date-menu" role="dialog" aria-label={label}>
                    <label className="ct-date-field" htmlFor={fromId}>
                        <span>From</span>
                        <input
                            id={fromId}
                            type="date"
                            className="ct-date-input"
                            value={value.from}
                            onChange={(event) => onChange({ ...value, from: event.target.value })}
                        />
                    </label>
                    <label className="ct-date-field" htmlFor={toId}>
                        <span>To</span>
                        <input
                            id={toId}
                            type="date"
                            className="ct-date-input"
                            value={value.to}
                            onChange={(event) => onChange({ ...value, to: event.target.value })}
                        />
                    </label>
                </div>
            ) : null}
        </div>
    );
}

function inDateRange(date, range) {
    const day = startOfDay(date);
    const from = parseInputDate(range.from);
    const to = parseInputDate(range.to);
    if (from && day < startOfDay(from)) return false;
    if (to && day > startOfDay(to)) return false;
    return true;
}

function filterHasValue(filterId, values) {
    const value = values[filterId];
    if (filterId === 'status' || filterId === 'program') return value.length > 0;
    if (filterId === 'startDate' || filterId === 'endDate') return Boolean(value.from || value.to);
    return false;
}

const SMART_SEARCH_SAVED_KEY = 'hermanlex-table-saved-searches';
const SMART_SEARCH_PREVIOUS_KEY = 'hermanlex-table-previous-searches';
const POPULAR_SEARCHES = ['loyalty', 'cashback', 'Priceless', 'merchant', 'weekend'];
const DEFAULT_PREVIOUS_SEARCHES = ['loyalty', 'cashback', 'Spring'];

const DEFAULT_SAVED_SEARCHES = [
    {
        id: 'ss-1',
        name: 'Example Search Name 1',
        search: 'priceless',
        enabledFilters: ['status', 'program'],
        filterValues: {
            ...EMPTY_FILTER_VALUES,
            status: ['Live', 'Scheduled'],
            program: ['Enterprise']
        },
        lastRun: '2024-12-31'
    },
    {
        id: 'ss-2',
        name: 'Example Search Name 2',
        search: 'cashback',
        enabledFilters: ['status', 'program'],
        filterValues: {
            ...EMPTY_FILTER_VALUES,
            status: ['Live'],
            program: ['Consumer', 'SMB']
        },
        lastRun: '2024-11-18'
    },
    {
        id: 'ss-3',
        name: 'Example Search Name 3',
        search: 'loyalty',
        enabledFilters: ['status'],
        filterValues: {
            ...EMPTY_FILTER_VALUES,
            status: ['Draft', 'Paused']
        },
        lastRun: '2024-10-02'
    }
];

function cloneFilterValues(values = EMPTY_FILTER_VALUES) {
    return {
        status: [...(values.status || [])],
        program: [...(values.program || [])],
        startDate: { from: values.startDate?.from || '', to: values.startDate?.to || '' },
        endDate: { from: values.endDate?.from || '', to: values.endDate?.to || '' }
    };
}

function countActiveFilters(enabledFilters, filterValues) {
    return (enabledFilters || []).filter((id) => filterHasValue(id, filterValues)).length;
}

function buildFilterChips(enabledFilters, filterValues) {
    const chips = [];
    (enabledFilters || []).forEach((id) => {
        if (!filterHasValue(id, filterValues)) return;
        const def = FILTER_DEFS.find((item) => item.id === id);
        const label = def?.label || id;
        if (id === 'status' || id === 'program') {
            chips.push(`${label}: ${filterValues[id].join(', ')}`);
        } else if (id === 'startDate' || id === 'endDate') {
            const { from, to } = filterValues[id];
            const range = [from, to].filter(Boolean).join(' → ');
            chips.push(`${label}: ${range}`);
        }
    });
    return chips;
}

function readJsonStorage(key, fallback) {
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
    } catch (error) {
        return fallback;
    }
}

function writeJsonStorage(key, value) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // Demo storage is best-effort only.
    }
}

function loadSavedSearches() {
    const stored = readJsonStorage(SMART_SEARCH_SAVED_KEY, null);
    if (Array.isArray(stored) && stored.length > 0) return stored;
    writeJsonStorage(SMART_SEARCH_SAVED_KEY, DEFAULT_SAVED_SEARCHES);
    return DEFAULT_SAVED_SEARCHES.map((item) => ({
        ...item,
        enabledFilters: [...item.enabledFilters],
        filterValues: cloneFilterValues(item.filterValues)
    }));
}

function loadPreviousSearches() {
    const stored = readJsonStorage(SMART_SEARCH_PREVIOUS_KEY, null);
    if (Array.isArray(stored) && stored.length > 0) return stored;
    writeJsonStorage(SMART_SEARCH_PREVIOUS_KEY, DEFAULT_PREVIOUS_SEARCHES);
    return [...DEFAULT_PREVIOUS_SEARCHES];
}

function formatIsoDate(date = new Date()) {
    return `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`;
}

function ManageSavedSearchesModal({ open, onClose, onRun }) {
    const [savedSearches, setSavedSearches] = useState(() => loadSavedSearches());
    const [expandedId, setExpandedId] = useState(null);
    const [openActionId, setOpenActionId] = useState(null);
    const [sortAsc, setSortAsc] = useState(true);
    const actionMenuRef = useClickOutside(Boolean(openActionId), () => setOpenActionId(null));

    useEffect(() => {
        if (open) {
            setSavedSearches(loadSavedSearches());
            setExpandedId(null);
            setOpenActionId(null);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        function onKey(event) {
            if (event.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    const sorted = [...savedSearches].sort((a, b) => {
        const left = a.name.toLowerCase();
        const right = b.name.toLowerCase();
        if (left < right) return sortAsc ? -1 : 1;
        if (left > right) return sortAsc ? 1 : -1;
        return 0;
    });

    function persist(next) {
        setSavedSearches(next);
        writeJsonStorage(SMART_SEARCH_SAVED_KEY, next);
    }

    function runSearch(item) {
        const next = savedSearches.map((entry) =>
            entry.id === item.id ? { ...entry, lastRun: formatIsoDate() } : entry
        );
        persist(next);
        onRun({
            name: item.name,
            search: item.search || '',
            enabledFilters: [...(item.enabledFilters || [])],
            filterValues: cloneFilterValues(item.filterValues)
        });
        onClose();
    }

    function renameSearch(item) {
        const nextName = window.prompt('Rename saved search', item.name);
        if (!nextName || !nextName.trim()) return;
        persist(
            savedSearches.map((entry) =>
                entry.id === item.id ? { ...entry, name: nextName.trim() } : entry
            )
        );
        setOpenActionId(null);
    }

    function deleteSearch(item) {
        persist(savedSearches.filter((entry) => entry.id !== item.id));
        setOpenActionId(null);
        if (expandedId === item.id) setExpandedId(null);
    }

    return (
        <div className="ct-saved-overlay" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <div
                className="ct-saved-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ct-saved-title"
            >
                <button type="button" className="ct-saved-back" onClick={onClose}>
                    <span className="back-arrow" aria-hidden="true">←</span>
                    <span className="back-text">Back to primary table search</span>
                </button>
                <h2 id="ct-saved-title" className="ct-saved-title">
                    Manage saved searches
                </h2>
                <p className="ct-saved-subtitle">
                    Manage your saved searches for quick access to repeatable search terms and applied
                    filtering configurations
                </p>

                <div className="ct-saved-table-wrap">
                    <table className="ct-saved-table">
                        <thead>
                            <tr>
                                <th scope="col" className="ct-saved-col-expand">
                                    <span className="visually-hidden">Expand</span>
                                </th>
                                <th scope="col" aria-sort={sortAsc ? 'ascending' : 'descending'}>
                                    <button
                                        type="button"
                                        className="ct-saved-sort"
                                        onClick={() => setSortAsc((prev) => !prev)}
                                    >
                                        Saved search name
                                        <Icon name={sortAsc ? 'sort-asc' : 'sort-desc'} size={14} />
                                    </button>
                                </th>
                                <th scope="col">Search term</th>
                                <th scope="col">Filters</th>
                                <th scope="col">Last run</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="ct-saved-empty">
                                        No saved searches yet. Run a search, then use Save in the search menu.
                                    </td>
                                </tr>
                            ) : (
                                sorted.map((item) => {
                                    const expanded = expandedId === item.id;
                                    const chips = buildFilterChips(item.enabledFilters, item.filterValues);
                                    const filterCount = countActiveFilters(
                                        item.enabledFilters,
                                        item.filterValues
                                    );
                                    return (
                                        <React.Fragment key={item.id}>
                                            <tr className={expanded ? 'is-expanded' : undefined}>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="ct-icon-btn"
                                                        aria-expanded={expanded}
                                                        aria-label={`${expanded ? 'Collapse' : 'Expand'} filters for ${item.name}`}
                                                        onClick={() =>
                                                            setExpandedId((prev) =>
                                                                prev === item.id ? null : item.id
                                                            )
                                                        }
                                                    >
                                                        <span
                                                            className={`ct-saved-chevron${expanded ? ' is-open' : ''}`}
                                                            aria-hidden="true"
                                                        >
                                                            <Icon name="chevron" size={16} />
                                                        </span>
                                                    </button>
                                                </td>
                                                <td className="ct-saved-name">{item.name}</td>
                                                <td>
                                                    {item.search ? (
                                                        <span className="ct-saved-term">
                                                            &quot;{item.search}&quot;
                                                        </span>
                                                    ) : (
                                                        <span className="ct-muted">—</span>
                                                    )}
                                                </td>
                                                <td>{filterCount}</td>
                                                <td>{item.lastRun || '—'}</td>
                                                <td>
                                                    <div className="ct-saved-actions">
                                                        <button
                                                            type="button"
                                                            className="ct-saved-run"
                                                            onClick={() => runSearch(item)}
                                                        >
                                                            <Icon name="refresh" size={14} />
                                                            Run
                                                        </button>
                                                        <div
                                                            className="ct-saved-more-wrap"
                                                            ref={openActionId === item.id ? actionMenuRef : null}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="ct-icon-btn"
                                                                aria-label={`More actions for ${item.name}`}
                                                                aria-expanded={openActionId === item.id}
                                                                onClick={() =>
                                                                    setOpenActionId((prev) =>
                                                                        prev === item.id ? null : item.id
                                                                    )
                                                                }
                                                            >
                                                                <Icon name="more" size={16} />
                                                            </button>
                                                            {openActionId === item.id ? (
                                                                <div className="ct-saved-menu" role="menu">
                                                                    <button
                                                                        type="button"
                                                                        role="menuitem"
                                                                        onClick={() => renameSearch(item)}
                                                                    >
                                                                        <Icon name="pencil" size={14} />
                                                                        Rename
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        role="menuitem"
                                                                        onClick={() => runSearch(item)}
                                                                    >
                                                                        <Icon name="refresh" size={14} />
                                                                        Run query
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        role="menuitem"
                                                                        className="is-danger"
                                                                        onClick={() => deleteSearch(item)}
                                                                    >
                                                                        <Icon name="trash" size={14} />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expanded ? (
                                                <tr className="ct-saved-detail-row">
                                                    <td colSpan={6}>
                                                        <div className="ct-saved-detail">
                                                            <p className="ct-saved-detail-label">Filters</p>
                                                            {chips.length > 0 ? (
                                                                <div className="ct-saved-chips">
                                                                    {chips.map((chip) => (
                                                                        <span key={chip} className="ct-saved-chip">
                                                                            {chip}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="ct-muted">No filters saved with this search.</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : null}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function SmartSearch({
    id,
    value,
    onChange,
    enabledFilters = [],
    filterValues = EMPTY_FILTER_VALUES,
    onApplySaved,
    callout
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [previousSearches, setPreviousSearches] = useState(() => loadPreviousSearches());
    const rootRef = useClickOutside(menuOpen && !modalOpen, () => setMenuOpen(false));

    const canSave =
        value.trim().length > 0 ||
        enabledFilters.some((filterId) => filterHasValue(filterId, filterValues));

    const query = value.trim().toLowerCase();
    const visiblePrevious = previousSearches.filter(
        (term) => !query || term.toLowerCase().includes(query)
    );
    const visiblePopular = POPULAR_SEARCHES.filter(
        (term) => !query || term.toLowerCase().includes(query)
    );

    function rememberPrevious(term) {
        const cleaned = term.trim();
        if (!cleaned) return;
        setPreviousSearches((prev) => {
            const next = [cleaned, ...prev.filter((item) => item.toLowerCase() !== cleaned.toLowerCase())].slice(
                0,
                8
            );
            writeJsonStorage(SMART_SEARCH_PREVIOUS_KEY, next);
            return next;
        });
    }

    function applyTerm(term) {
        onChange(term);
        rememberPrevious(term);
        setMenuOpen(false);
    }

    function handleSave() {
        if (!canSave) return;
        const defaultName = value.trim() ? `Search: ${value.trim()}` : 'Filtered view';
        const name = window.prompt('Name this saved search', defaultName);
        if (!name || !name.trim()) return;

        const entry = {
            id: `ss-${Date.now()}`,
            name: name.trim(),
            search: value.trim(),
            enabledFilters: [...enabledFilters],
            filterValues: cloneFilterValues(filterValues),
            lastRun: formatIsoDate()
        };
        const next = [entry, ...loadSavedSearches()];
        writeJsonStorage(SMART_SEARCH_SAVED_KEY, next);
        if (value.trim()) rememberPrevious(value.trim());
        setMenuOpen(false);
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (value.trim()) rememberPrevious(value.trim());
            setMenuOpen(false);
        } else if (event.key === 'Escape') {
            setMenuOpen(false);
        }
    }

    return (
        <>
            <div
                className="ct-search"
                ref={rootRef}
                {...(callout ? { 'data-callout': callout } : {})}
            >
                <span className="ct-search-icon">
                    <Icon name="search" size={20} />
                </span>
                <label className="visually-hidden" htmlFor={id}>
                    Search table
                </label>
                <input
                    id={id}
                    className="ct-search-input"
                    type="search"
                    placeholder="Type to search..."
                    value={value}
                    autoComplete="off"
                    aria-expanded={menuOpen}
                    aria-controls={`${id}-menu`}
                    aria-haspopup="listbox"
                    onFocus={() => setMenuOpen(true)}
                    onClick={() => setMenuOpen(true)}
                    onChange={(event) => {
                        onChange(event.target.value);
                        setMenuOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                />

                {menuOpen ? (
                    <div className="ct-smart-menu" id={`${id}-menu`} role="listbox" aria-label="Smart search">
                        <div className="ct-smart-actions">
                            <button
                                type="button"
                                className="ct-smart-action is-accent"
                                onClick={() => {
                                    setMenuOpen(false);
                                    setModalOpen(true);
                                }}
                            >
                                <Icon name="upload" size={14} />
                                Load
                            </button>
                            <span className="ct-smart-divider" aria-hidden="true" />
                            <button
                                type="button"
                                className="ct-smart-action"
                                disabled={!canSave}
                                onClick={handleSave}
                            >
                                <Icon name="search-plus" size={14} />
                                Save
                            </button>
                        </div>

                        <div className="ct-smart-list">
                            {visiblePrevious.map((term) => (
                                <button
                                    key={`prev-${term}`}
                                    type="button"
                                    className="ct-smart-item"
                                    role="option"
                                    onClick={() => applyTerm(term)}
                                >
                                    <Icon name="clock" size={16} />
                                    <span>{term}</span>
                                </button>
                            ))}
                            {visiblePopular.map((term) => (
                                <button
                                    key={`pop-${term}`}
                                    type="button"
                                    className="ct-smart-item"
                                    role="option"
                                    onClick={() => applyTerm(term)}
                                >
                                    <Icon name="trending" size={16} />
                                    <span>{term}</span>
                                </button>
                            ))}
                            {visiblePrevious.length === 0 && visiblePopular.length === 0 ? (
                                <p className="ct-smart-empty">No matching previous or popular searches.</p>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>

            <ManageSavedSearchesModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onRun={onApplySaved}
            />
        </>
    );
}

const CALLOUT_TIP_RADIUS = 4;
const CALLOUT_COLOR = '#c45000';

const ANATOMY_CALLOUTS = [
    { n: 1, label: 'Column header', bx: 0, by: -38, ax: 0.08, ay: 0 },
    { n: 2, label: 'Rows', bx: -42, by: 0, ax: 0, ay: 0.5 },
    { n: 3, label: 'Columns', bx: 20, by: -88, ax: 1, ay: 0.5 },
    { n: 4, label: 'Title / description', bx: 0, by: -38, ax: 0.15, ay: 0, ox: 32 },
    { n: 5, label: 'Primary action', bx: 0, by: -38, ax: 0.5, ay: 0, color: '#FF8D89' },
    { n: 6, label: 'Filters', bx: -22, by: -28, ax: 0, ay: 0.5 },
    { n: 7, label: 'Search', bx: 0, by: -38, ax: 0.12, ay: 0, ox: 32 },
    { n: 8, label: 'Bulk action bar', bx: 0, by: -36, ax: 0.5, ay: 0, ox: -140 },
    { n: 9, label: 'Sorting', bx: 0, by: -34, ax: 0.2, ay: 0 },
    { n: 10, label: 'Multi-select', bx: -22, by: -28, ax: 0.5, ay: 0.5, ox: -20 },
    { n: 11, label: 'Expanding rows', bx: -22, by: -28, ax: 0.5, ay: 0.5, ox: -16 },
    { n: 12, label: 'Pagination', bx: 0, by: -36, ax: 0.5, ay: 0, ox: -64 }
];

const OPTIONAL_CALLOUTS = ANATOMY_CALLOUTS;

const ESSENTIAL_CALLOUTS = [
    { n: 1, label: 'Column header', bx: 0, by: -38, ax: 0.08, ay: 0 },
    { n: 2, label: 'Rows', bx: -42, by: 0, ax: 0, ay: 0.5 },
    { n: 3, label: 'Columns', bx: 0, by: -100, ax: 1, ay: 0.5 }
];

class CalloutBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) return null;
        return this.props.children;
    }
}

function TableCallouts({ wrapRef, layoutKey, defs = ANATOMY_CALLOUTS }) {
    const [marks, setMarks] = useState([]);

    const measure = useCallback(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;

        const wrapRect = wrap.getBoundingClientRect();
        const styles = window.getComputedStyle(wrap);
        const originX = wrapRect.left + (parseFloat(styles.borderLeftWidth) || 0);
        const originY = wrapRect.top + (parseFloat(styles.borderTopWidth) || 0);

        const next = defs.map((def) => {
            const el = wrap.querySelector(`[data-callout="${def.n}"]`);
            if (!el) return null;

            const rect = el.getBoundingClientRect();
            const tip = {
                x: rect.left - originX + rect.width * def.ax + (def.ox || 0),
                y: rect.top - originY + rect.height * def.ay + (def.oy || 0)
            };
            const badge = {
                x: tip.x + def.bx,
                y: tip.y + def.by
            };

            return {
                n: def.n,
                label: def.label,
                color: def.color || CALLOUT_COLOR,
                tip,
                badge
            };
        }).filter(Boolean);

        setMarks((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    }, [wrapRef, defs]);

    useLayoutEffect(() => {
        let cancelled = false;
        const run = () => {
            if (!cancelled) measure();
        };

        run();
        const frame = window.requestAnimationFrame(run);
        const timeout = window.setTimeout(run, 0);
        const wrap = wrapRef.current;
        const observer = wrap ? new ResizeObserver(run) : null;
        if (wrap) observer.observe(wrap);
        const scrollEl = wrap?.querySelector('.ct-table-scroll');
        scrollEl?.addEventListener('scroll', run, { passive: true });
        window.addEventListener('resize', run);

        return () => {
            cancelled = true;
            window.cancelAnimationFrame(frame);
            window.clearTimeout(timeout);
            observer?.disconnect();
            scrollEl?.removeEventListener('scroll', run);
            window.removeEventListener('resize', run);
        };
    }, [measure, layoutKey, wrapRef]);

    if (marks.length === 0) return null;

    return (
        <div className="ct-callouts" aria-hidden="true">
            <svg className="ct-callouts-svg">
                {marks.map((mark) => (
                    <g key={mark.n}>
                        <line
                            className="ct-callout-stem"
                            x1={mark.badge.x}
                            y1={mark.badge.y}
                            x2={mark.tip.x}
                            y2={mark.tip.y}
                            stroke={mark.color}
                        />
                        <circle
                            className="ct-callout-tip"
                            cx={mark.tip.x}
                            cy={mark.tip.y}
                            r={CALLOUT_TIP_RADIUS}
                            fill={mark.color}
                        />
                    </g>
                ))}
            </svg>
            {marks.map((mark) => (
                <span
                    key={mark.n}
                    className="ct-callout-badge"
                    style={{ left: mark.badge.x, top: mark.badge.y }}
                    title={mark.label}
                >
                    {mark.n}
                </span>
            ))}
        </div>
    );
}

function CampaignsTable({ showCallouts = false }) {
    const wrapRef = useRef(null);
    const searchId = useId();
    const pageInputId = useId();
    const [enabledFilters, setEnabledFilters] = useState([]);
    const [filterValues, setFilterValues] = useState(EMPTY_FILTER_VALUES);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState(() => new Set(['cmp-01', 'cmp-05']));
    const [expandedIds, setExpandedIds] = useState(() => new Set());
    const [openMenu, setOpenMenu] = useState(null);
    const [toast, setToast] = useState('');
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageInput, setPageInput] = useState('1');
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [columnWidths, setColumnWidths] = useState(() =>
        DATA_COLUMNS.reduce((acc, col) => {
            acc[col.id] = col.width;
            return acc;
        }, {})
    );

    const closeMenus = useCallback(() => setOpenMenu(null), []);

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();
        let rows = ALL_CAMPAIGNS.filter((row) => {
            if (enabledFilters.includes('program') && filterValues.program.length > 0) {
                if (!filterValues.program.includes(row.programType)) return false;
            }
            if (enabledFilters.includes('status') && filterValues.status.length > 0) {
                if (!filterValues.status.includes(row.status)) return false;
            }
            if (enabledFilters.includes('startDate')) {
                if (!inDateRange(row.startDate, filterValues.startDate)) return false;
            }
            if (enabledFilters.includes('endDate')) {
                if (!inDateRange(row.endDate, filterValues.endDate)) return false;
            }
            if (query) {
                const haystack = `${row.name} ${row.programType} ${row.status} ${row.owner}`.toLowerCase();
                if (!haystack.includes(query)) return false;
            }
            return true;
        });

        if (sortKey) {
            rows = [...rows].sort((a, b) => {
                let left;
                let right;
                if (sortKey === 'name') {
                    left = a.name.toLowerCase();
                    right = b.name.toLowerCase();
                } else if (sortKey === 'status') {
                    left = a.status.toLowerCase();
                    right = b.status.toLowerCase();
                } else if (sortKey === 'startDate') {
                    left = a.startDate.getTime();
                    right = b.startDate.getTime();
                } else if (sortKey === 'endDate') {
                    left = a.endDate.getTime();
                    right = b.endDate.getTime();
                } else {
                    return 0;
                }
                if (left < right) return sortDir === 'asc' ? -1 : 1;
                if (left > right) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return rows;
    }, [enabledFilters, filterValues, search, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);

    useEffect(() => {
        if (currentPage !== safePage) {
            setCurrentPage(safePage);
            setPageInput(String(safePage));
        }
    }, [currentPage, safePage]);

    useEffect(() => {
        setCurrentPage(1);
        setPageInput('1');
    }, [enabledFilters, filterValues, search, pageSize, sortKey, sortDir]);

    const pageStart = (safePage - 1) * pageSize;
    const pageRows = filteredRows.slice(pageStart, pageStart + pageSize);
    const pageIds = pageRows.map((row) => row.id);
    const filteredIds = filteredRows.map((row) => row.id);

    const selectedVisibleCount = pageIds.filter((id) => selectedIds.has(id)).length;
    const allVisibleSelected = pageIds.length > 0 && selectedVisibleCount === pageIds.length;
    const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

    const hasAppliedFilterValues =
        enabledFilters.some((id) => filterHasValue(id, filterValues)) || search.trim().length > 0;

    useEffect(() => {
        if (!toast) return undefined;
        const timer = window.setTimeout(() => setToast(''), 2200);
        return () => window.clearTimeout(timer);
    }, [toast]);

    function flash(message) {
        setToast(message);
    }

    function toggleEnabledFilter(filterId) {
        setEnabledFilters((prev) => {
            if (prev.includes(filterId)) {
                setFilterValues((values) => ({
                    ...values,
                    [filterId]: EMPTY_FILTER_VALUES[filterId]
                }));
                return prev.filter((id) => id !== filterId);
            }
            return [...prev, filterId];
        });
    }

    function clearFilters() {
        setFilterValues(EMPTY_FILTER_VALUES);
        setSearch('');
        setOpenMenu(null);
    }

    function applySavedSearch(config) {
        setSearch(config.search || '');
        setEnabledFilters([...(config.enabledFilters || [])]);
        setFilterValues(cloneFilterValues(config.filterValues));
        setOpenMenu(null);
        flash(`Loaded “${config.name || 'saved search'}”`);
    }

    function goToPage(page) {
        const next = Math.min(totalPages, Math.max(1, page));
        setCurrentPage(next);
        setPageInput(String(next));
    }

    function toggleSelectAllVisible() {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allVisibleSelected) {
                pageIds.forEach((id) => next.delete(id));
            } else {
                pageIds.forEach((id) => next.add(id));
            }
            return next;
        });
    }

    function selectAllFiltered() {
        setSelectedIds(new Set(filteredIds));
    }

    function toggleRow(id) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleExpanded(id) {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function handleSort(columnId) {
        if (sortKey === columnId) {
            setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
            return;
        }
        setSortKey(columnId);
        setSortDir('asc');
    }

    function startColumnResize(event, columnId) {
        event.preventDefault();
        event.stopPropagation();
        const startX = event.clientX;
        const startWidth = columnWidths[columnId];
        const minWidth = DATA_COLUMNS.find((col) => col.id === columnId)?.minWidth ?? 80;

        function onMove(moveEvent) {
            const nextWidth = Math.max(minWidth, startWidth + (moveEvent.clientX - startX));
            setColumnWidths((prev) => ({ ...prev, [columnId]: nextWidth }));
        }

        function onUp() {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.body.classList.remove('ct-is-resizing');
        }

        document.body.classList.add('ct-is-resizing');
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    function renderActiveFilter(filterId) {
        const def = FILTER_DEFS.find((item) => item.id === filterId);
        if (!def) return null;

        if (def.type === 'multi') {
            const options = filterId === 'status' ? STATUSES : PROGRAM_TYPES;
            const selected = filterId === 'status' ? filterValues.status : filterValues.program;
            return (
                <MultiSelectFilter
                    key={filterId}
                    label={def.label}
                    options={options}
                    selected={selected}
                    onChange={(next) =>
                        setFilterValues((prev) => ({
                            ...prev,
                            [filterId === 'status' ? 'status' : 'program']: next
                        }))
                    }
                    open={openMenu === filterId}
                    onToggle={() => setOpenMenu((menu) => (menu === filterId ? null : filterId))}
                    onClose={closeMenus}
                />
            );
        }

        return (
            <DateRangeFilter
                key={filterId}
                label={def.label}
                value={filterValues[filterId]}
                onChange={(next) => setFilterValues((prev) => ({ ...prev, [filterId]: next }))}
                open={openMenu === filterId}
                onToggle={() => setOpenMenu((menu) => (menu === filterId ? null : filterId))}
                onClose={closeMenus}
            />
        );
    }

    const selectedCount = selectedIds.size;
    const rangeStart = filteredRows.length === 0 ? 0 : pageStart + 1;
    const rangeEnd = Math.min(pageStart + pageSize, filteredRows.length);

    return (
        <div
            className={`ct-wrap${showCallouts ? ' ct-wrap--callouts' : ''}`}
            ref={wrapRef}
            aria-label="All Campaigns data table example"
        >
            <div className="ct-header">
                <div>
                    <h3 className="ct-title" {...(showCallouts ? { 'data-callout': '4' } : {})}>
                        All Campaigns
                    </h3>
                    <p className="ct-subtitle">
                        Manage all active campaigns or upload and create new ones
                    </p>
                </div>
                <button
                    type="button"
                    className="ct-upload"
                    onClick={() => flash('Create new — demo action')}
                    {...(showCallouts ? { 'data-callout': '5' } : {})}
                >
                    + Create new...
                </button>
            </div>

            <div className="ct-toolbar">
                <div className="ct-filters">
                    <FilterPicker
                        enabledFilters={enabledFilters}
                        onToggleFilter={toggleEnabledFilter}
                        open={openMenu === 'picker'}
                        onToggle={() => setOpenMenu((menu) => (menu === 'picker' ? null : 'picker'))}
                        onClose={closeMenus}
                        callout={showCallouts ? '6' : undefined}
                    />

                    {FILTER_DEFS.filter((def) => enabledFilters.includes(def.id)).map((def) =>
                        renderActiveFilter(def.id)
                    )}

                    {hasAppliedFilterValues ? (
                        <button type="button" className="ct-clear-filters" onClick={clearFilters}>
                            <Icon name="x" size={14} />
                            Clear all filters
                        </button>
                    ) : null}
                </div>

                <SmartSearch
                    id={searchId}
                    value={search}
                    onChange={setSearch}
                    enabledFilters={enabledFilters}
                    filterValues={filterValues}
                    onApplySaved={applySavedSearch}
                    callout={showCallouts ? '7' : undefined}
                />
            </div>

            <div
                className="ct-bulk"
                role="region"
                aria-label="Bulk actions"
                {...(showCallouts ? { 'data-callout': '8' } : {})}
            >
                <div className="ct-bulk-left">
                    <input
                        className="ct-checkbox"
                        type="checkbox"
                        checked={allVisibleSelected}
                        ref={(node) => {
                            if (node) node.indeterminate = someVisibleSelected;
                        }}
                        onChange={toggleSelectAllVisible}
                        aria-label="Select all rows on this page"
                    />
                    <span className="ct-bulk-count">
                        {selectedCount}/{ALL_CAMPAIGNS.length}
                    </span>
                    {selectedCount < filteredIds.length ? (
                        <button type="button" className="ct-select-all" onClick={selectAllFiltered}>
                            Select all {filteredIds.length}
                        </button>
                    ) : null}
                </div>

                <div className="ct-bulk-right">
                    <button
                        type="button"
                        className="ct-bulk-action"
                        disabled={selectedCount === 0}
                        onClick={() => flash(`Paused ${selectedCount} campaign(s)`)}
                    >
                        <Icon name="pause" size={20} />
                        {`Pause (${selectedCount})`}
                    </button>
                    <button
                        type="button"
                        className="ct-bulk-action"
                        disabled={selectedCount === 0}
                        onClick={() => flash(`Download PDF for ${selectedCount} row(s)`)}
                    >
                        <Icon name="download" size={20} />
                        Download (PDF)
                    </button>
                    <button
                        type="button"
                        className="ct-bulk-action"
                        aria-label="More bulk actions"
                        onClick={() => flash('More actions menu — demo')}
                    >
                        <Icon name="more" size={20} />
                    </button>
                </div>
            </div>

            <div className="ct-table-scroll">
                <table className="ct-table">
                    <colgroup>
                        <col className="ct-col-check" />
                        <col className="ct-col-expand" />
                        {DATA_COLUMNS.map((col) => (
                            <col
                                key={col.id}
                                style={{ width: columnWidths[col.id], minWidth: col.minWidth }}
                            />
                        ))}
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="ct-check-cell" scope="col">
                                <span className="visually-hidden">Select</span>
                            </th>
                            <th className="ct-expand-cell" scope="col">
                                <span className="visually-hidden">Expand</span>
                            </th>
                            {DATA_COLUMNS.map((col) => {
                                const isSorted = sortKey === col.id;
                                const ariaSort = isSorted
                                    ? sortDir === 'asc'
                                        ? 'ascending'
                                        : 'descending'
                                    : 'none';
                                return (
                                    <th
                                        key={col.id}
                                        scope="col"
                                        className={`ct-th${isSorted ? ' is-sorted' : ''}`}
                                        aria-sort={ariaSort}
                                        {...(showCallouts && col.id === 'name' ? { 'data-callout': '1' } : {})}
                                        {...(showCallouts && col.id === 'status' ? { 'data-callout': '9' } : {})}
                                    >
                                        <div className="ct-th-inner">
                                            <button
                                                type="button"
                                                className="ct-th-sort"
                                                onClick={() => handleSort(col.id)}
                                            >
                                                <span>{col.label}</span>
                                                {isSorted ? (
                                                    <Icon
                                                        name={sortDir === 'asc' ? 'sort-asc' : 'sort-desc'}
                                                        size={14}
                                                    />
                                                ) : (
                                                    <span className="ct-th-sort-placeholder" aria-hidden="true" />
                                                )}
                                            </button>
                                            <span
                                                className="ct-col-resize"
                                                role="separator"
                                                aria-orientation="vertical"
                                                aria-label={`Resize ${col.label} column`}
                                                onMouseDown={(event) => startColumnResize(event, col.id)}
                                            />
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.length === 0 ? (
                            <tr>
                                <td className="ct-empty" colSpan={2 + DATA_COLUMNS.length}>
                                    No campaigns match your filters or search.
                                </td>
                            </tr>
                        ) : (
                            pageRows.map((row, rowIndex) => {
                                const selected = selectedIds.has(row.id);
                                const expanded = expandedIds.has(row.id);
                                const statusClass = `is-${row.status.toLowerCase()}`;
                                const isSelectCalloutRow = showCallouts && rowIndex === 0;
                                const isExpandCalloutRow = showCallouts && rowIndex === 2;
                                return (
                                    <React.Fragment key={row.id}>
                                        <tr className={selected ? 'is-selected' : undefined}>
                                            <td className="ct-check-cell">
                                                <input
                                                    className="ct-checkbox"
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() => toggleRow(row.id)}
                                                    aria-label={`Select ${row.name}`}
                                                    {...(isSelectCalloutRow ? { 'data-callout': '10' } : {})}
                                                />
                                            </td>
                                            <td className="ct-expand-cell">
                                                <button
                                                    type="button"
                                                    className="ct-expand"
                                                    aria-expanded={expanded}
                                                    aria-label={`${expanded ? 'Collapse' : 'Expand'} ${row.name}`}
                                                    onClick={() => toggleExpanded(row.id)}
                                                    {...(isExpandCalloutRow ? { 'data-callout': '11' } : {})}
                                                >
                                                    <Icon name="chevron" size={14} />
                                                </button>
                                            </td>
                                            <td className="ct-cell-name">
                                                <a
                                                    className="ct-campaign-link"
                                                    href={`#${row.id}`}
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        flash(`Open ${row.name}`);
                                                    }}
                                                    {...(isSelectCalloutRow ? { 'data-callout': '2' } : {})}
                                                >
                                                    {row.name}
                                                </a>
                                            </td>
                                            <td {...(isSelectCalloutRow ? { 'data-callout': '3' } : {})}>
                                                <span className={`ct-status ${statusClass}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td>{formatShortDate(row.startDate)}</td>
                                            <td>{formatShortDate(row.endDate)}</td>
                                        </tr>
                                        {expanded ? (
                                            <tr className="ct-detail-row">
                                                <td colSpan={2 + DATA_COLUMNS.length}>
                                                    {row.programType} program · Owner {row.owner} ·
                                                    Budget {row.budget}
                                                </td>
                                            </tr>
                                        ) : null}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div
                className="ct-pagination"
                role="navigation"
                aria-label="Table pagination"
                {...(showCallouts ? { 'data-callout': '12' } : {})}
            >
                <div className="ct-page-size">
                    <label htmlFor={`${pageInputId}-size`}>Items per page</label>
                    <select
                        id={`${pageInputId}-size`}
                        className="ct-page-size-select"
                        value={pageSize}
                        onChange={(event) => setPageSize(Number(event.target.value))}
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="ct-page-meta">
                    {rangeStart}–{rangeEnd} of {filteredRows.length}
                </div>

                <div className="ct-page-controls">
                    <button
                        type="button"
                        className="ct-page-btn"
                        aria-label="First page"
                        disabled={safePage <= 1}
                        onClick={() => goToPage(1)}
                    >
                        <Icon name="chevrons-left" size={15} />
                    </button>
                    <button
                        type="button"
                        className="ct-page-btn"
                        aria-label="Previous page"
                        disabled={safePage <= 1}
                        onClick={() => goToPage(safePage - 1)}
                    >
                        <Icon name="chevron-left" size={15} />
                    </button>
                    <label className="ct-page-jump" htmlFor={pageInputId}>
                        <span className="visually-hidden">Page number</span>
                        <input
                            id={pageInputId}
                            className="ct-page-input"
                            type="number"
                            min={1}
                            max={totalPages}
                            value={pageInput}
                            onChange={(event) => setPageInput(event.target.value)}
                            onBlur={() => goToPage(parseInt(pageInput, 10) || 1)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    goToPage(parseInt(pageInput, 10) || 1);
                                }
                            }}
                        />
                        <span>of {totalPages}</span>
                    </label>
                    <button
                        type="button"
                        className="ct-page-btn"
                        aria-label="Next page"
                        disabled={safePage >= totalPages}
                        onClick={() => goToPage(safePage + 1)}
                    >
                        <Icon name="chevron-right" size={15} />
                    </button>
                    <button
                        type="button"
                        className="ct-page-btn"
                        aria-label="Last page"
                        disabled={safePage >= totalPages}
                        onClick={() => goToPage(totalPages)}
                    >
                        <Icon name="chevrons-right" size={15} />
                    </button>
                </div>
            </div>

            <div className="ct-footer">
                <span aria-live="polite">{toast}</span>
            </div>
            {showCallouts ? (
                <CalloutBoundary>
                    <TableCallouts
                        wrapRef={wrapRef}
                        defs={ANATOMY_CALLOUTS}
                        layoutKey={[
                            selectedIds.size,
                            expandedIds.size,
                            enabledFilters.join(','),
                            search,
                            pageSize,
                            currentPage,
                            sortKey,
                            sortDir,
                            toast
                        ].join('|')}
                    />
                </CalloutBoundary>
            ) : null}
        </div>
    );
}

document.querySelectorAll('#campaigns-table-root, [data-campaigns-table]').forEach((mountNode) => {
    ReactDOM.createRoot(mountNode).render(
        <CampaignsTable showCallouts={mountNode.hasAttribute('data-campaigns-table')} />
    );
});
