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

const CALLOUT_BADGE_RADIUS = 11;

const OPTIONAL_CALLOUTS = [
    { n: 1, label: 'Title header', bx: 0, by: -38, ax: 0.15, ay: 0 },
    { n: 2, label: 'Primary action', bx: 0, by: -38, ax: 0.5, ay: 0 },
    { n: 3, label: 'Filters', bx: 0, by: -38, ax: 0.22, ay: 0 },
    { n: 4, label: 'Search', bx: 0, by: -38, ax: 0.12, ay: 0.5 },
    { n: 5, label: 'Bulk action bar', bx: 0, by: -36, ax: 0.5, ay: 0 },
    { n: 6, label: 'Sorting', bx: 0, by: -34, ax: 0.2, ay: 0 },
    { n: 7, label: 'Multi-select', bx: -22, by: -28, ax: 0.5, ay: 0.5 },
    { n: 8, label: 'Expanding rows', bx: 22, by: -28, ax: 0.5, ay: 0.5 },
    { n: 9, label: 'Pagination', bx: 0, by: -36, ax: 0.5, ay: 0 }
];

function pointerPoints(badge, tip) {
    const dx = tip.x - badge.x;
    const dy = tip.y - badge.y;
    const len = Math.hypot(dx, dy);
    if (len < CALLOUT_BADGE_RADIUS + 6) return null;

    const ux = dx / len;
    const uy = dy / len;
    const startX = badge.x + ux * (CALLOUT_BADGE_RADIUS - 1);
    const startY = badge.y + uy * (CALLOUT_BADGE_RADIUS - 1);
    const px = -uy;
    const py = ux;
    const half = 3.5;

    return [
        `${startX + px * half},${startY + py * half}`,
        `${startX - px * half},${startY - py * half}`,
        `${tip.x},${tip.y}`
    ].join(' ');
}

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

function TableCallouts({ wrapRef, layoutKey }) {
    const [marks, setMarks] = useState([]);

    const measure = useCallback(() => {
        const wrap = wrapRef.current || document.querySelector('.ct-wrap--callouts');
        if (!wrap) return;

        const wrapRect = wrap.getBoundingClientRect();
        const styles = window.getComputedStyle(wrap);
        const originX = wrapRect.left + (parseFloat(styles.borderLeftWidth) || 0);
        const originY = wrapRect.top + (parseFloat(styles.borderTopWidth) || 0);

        const next = OPTIONAL_CALLOUTS.map((def) => {
            const el = wrap.querySelector(`[data-callout="${def.n}"]`);
            if (!el) return null;

            const rect = el.getBoundingClientRect();
            const tip = {
                x: rect.left - originX + rect.width * def.ax,
                y: rect.top - originY + rect.height * def.ay
            };
            const badge = {
                x: tip.x + def.bx,
                y: tip.y + def.by
            };

            return {
                n: def.n,
                label: def.label,
                tip,
                badge,
                points: pointerPoints(badge, tip)
            };
        }).filter(Boolean);

        setMarks((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    }, [wrapRef]);

    useLayoutEffect(() => {
        let cancelled = false;
        const run = () => {
            if (!cancelled) measure();
        };

        run();
        const frame = window.requestAnimationFrame(run);
        const timeout = window.setTimeout(run, 0);
        const wrap = wrapRef.current || document.querySelector('.ct-wrap--callouts');
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
                {marks.map((mark) =>
                    mark.points ? (
                        <polygon key={mark.n} className="ct-callout-pointer" points={mark.points} />
                    ) : null
                )}
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
                    <h3 className="ct-title" {...(showCallouts ? { 'data-callout': '1' } : {})}>
                        All Campaigns
                    </h3>
                    <p className="ct-subtitle">
                        Manage all active campaigns or upload and create new ones
                    </p>
                </div>
                <button
                    type="button"
                    className="ct-upload"
                    onClick={() => flash('Upload new — demo action')}
                    {...(showCallouts ? { 'data-callout': '2' } : {})}
                >
                    <Icon name="upload" size={16} />
                    Upload new
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
                        callout={showCallouts ? '3' : undefined}
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

                <div className="ct-search" {...(showCallouts ? { 'data-callout': '4' } : {})}>
                    <span className="ct-search-icon">
                        <Icon name="search" size={20} />
                    </span>
                    <label className="visually-hidden" htmlFor={searchId}>
                        Search table
                    </label>
                    <input
                        id={searchId}
                        className="ct-search-input"
                        type="search"
                        placeholder="Search table"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
            </div>

            <div
                className="ct-bulk"
                role="region"
                aria-label="Bulk actions"
                {...(showCallouts ? { 'data-callout': '5' } : {})}
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
                                        {...(showCallouts && col.id === 'name' ? { 'data-callout': '6' } : {})}
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
                                const isCalloutRow = showCallouts && rowIndex === 0;
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
                                                    {...(isCalloutRow ? { 'data-callout': '7' } : {})}
                                                />
                                            </td>
                                            <td className="ct-expand-cell">
                                                <button
                                                    type="button"
                                                    className="ct-expand"
                                                    aria-expanded={expanded}
                                                    aria-label={`${expanded ? 'Collapse' : 'Expand'} ${row.name}`}
                                                    onClick={() => toggleExpanded(row.id)}
                                                    {...(isCalloutRow ? { 'data-callout': '8' } : {})}
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
                                                >
                                                    {row.name}
                                                </a>
                                            </td>
                                            <td>
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
                {...(showCallouts ? { 'data-callout': '9' } : {})}
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
