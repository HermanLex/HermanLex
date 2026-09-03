/* Table guide — focused skeleton demos (reuses campaigns-table.jsx pieces) */

const GUIDE_PAGE_SIZE = 3;
const ROW_ACTION_OPTIONS = ['Edit', 'Duplicate', 'Archive', 'Delete'];

function focusRegions(focus) {
    if (focus instanceof Set) return focus;
    if (!focus || focus === 'overview' || focus === 'none') return new Set();
    return new Set([focus]);
}

function getGuideDefaults(focus) {
    const regions = focusRegions(focus);
    const defaults = {};

    if (regions.has('filters')) {
        defaults.enabledFilters = ['program', 'status'];
        defaults.filterValues = {
            ...EMPTY_FILTER_VALUES,
            program: ['Enterprise'],
            status: ['Live', 'Draft', 'Paused', 'Ended']
        };
    }
    if (regions.has('expand')) {
        defaults.expandedIds = new Set(['cmp-01']);
    }
    if (regions.has('select') || regions.has('bulk')) {
        defaults.selectedIds = new Set(['cmp-01', 'cmp-02']);
    }
    if (regions.has('sorting')) {
        defaults.sortKey = 'name';
        defaults.sortDir = 'asc';
    }

    return defaults;
}

function isGuideRegionActive(focus, region) {
    const regions = focusRegions(focus);
    if (regions.has(region)) return true;
    if (regions.has('select') && (region === 'bulk' || region === 'select-col')) return true;
    return false;
}

function GuideSkActivate({ region, focus, onActivate, className = '', style, children, label }) {
    const active = isGuideRegionActive(focus, region);
    const interactive = typeof onActivate === 'function' && focus instanceof Set && !active;

    if (!interactive) {
        if (className || style) {
            return (
                <div className={className} style={style}>
                    {children}
                </div>
            );
        }
        return <>{children}</>;
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onActivate(region);
        }
    }

    const regionLabel = label || `Turn on ${region.replace(/-/g, ' ')}`;

    return (
        <div
            role="button"
            tabIndex={0}
            className={`ct-sk-activate${className ? ` ${className}` : ''}`}
            style={style}
            onClick={() => onActivate(region)}
            onKeyDown={handleKeyDown}
            aria-label={regionLabel}
        >
            {children}
        </div>
    );
}

function GuideSkBone({ className = '', style }) {
    return <span className={`ct-sk-bone ${className}`.trim()} style={style} aria-hidden="true" />;
}

function GuideSkHeader({ focus, onActivate }) {
    return (
        <div className="ct-header ct-guide-sk">
            <GuideSkActivate region="title" focus={focus} onActivate={onActivate} className="ct-sk-heading">
                <GuideSkBone className="ct-sk-title" />
                <GuideSkBone className="ct-sk-subtitle" />
            </GuideSkActivate>
            <GuideSkActivate region="primary" focus={focus} onActivate={onActivate}>
                <GuideSkBone className="ct-sk-cta" />
            </GuideSkActivate>
        </div>
    );
}

function GuideSkToolbar({ focus, onActivate }) {
    return (
        <div className="ct-toolbar ct-guide-sk">
            <GuideSkActivate region="filters" focus={focus} onActivate={onActivate} className="ct-filters">
                <GuideSkBone className="ct-sk-pill-md" />
                <GuideSkBone className="ct-sk-pill-md" style={{ width: 108 }} />
            </GuideSkActivate>
            <GuideSkActivate region="search" focus={focus} onActivate={onActivate}>
                <GuideSkBone className="ct-sk-pill-lg" />
            </GuideSkActivate>
        </div>
    );
}

function GuideSkBulkBar({ focus, onActivate }) {
    return (
        <GuideSkActivate
            region="bulk"
            focus={focus}
            onActivate={onActivate}
            className="ct-bulk ct-guide-sk"
            label="Turn on bulk action bar"
        >
            <GuideSkBone className="ct-sk-pill-md" style={{ width: 120 }} />
            <GuideSkBone className="ct-sk-pill-md" style={{ width: 180 }} />
        </GuideSkActivate>
    );
}

function GuideSkTableRows({ withActions = false, withExpand = false, focus, onActivate }) {
    return (
        <>
            {Array.from({ length: GUIDE_PAGE_SIZE }, (_, index) => (
                <tr key={index} className="ct-guide-sk-row">
                    <td>
                        <GuideSkActivate region="select" focus={focus} onActivate={onActivate} label="Turn on multi-select">
                            <GuideSkBone className="ct-sk-sq" />
                        </GuideSkActivate>
                    </td>
                    {withExpand ? (
                        <td className="ct-expand-cell">
                            <GuideSkActivate region="expand" focus={focus} onActivate={onActivate} label="Turn on expanding rows">
                                <GuideSkBone className="ct-sk-sq" />
                            </GuideSkActivate>
                        </td>
                    ) : null}
                    <td><GuideSkBone className="ct-sk-name" /></td>
                    <td className="ct-guide-sk-hide-sm"><GuideSkBone className="ct-sk-mid" /></td>
                    <td><GuideSkBone className="ct-sk-mid" /></td>
                    <td><GuideSkBone className="ct-sk-mid" /></td>
                    {withActions ? (
                        <td><GuideSkBone className="ct-sk-sq" /></td>
                    ) : null}
                </tr>
            ))}
        </>
    );
}

function GuideSkPagination({ focus, onActivate }) {
    return (
        <GuideSkActivate
            region="pagination"
            focus={focus}
            onActivate={onActivate}
            className="ct-pagination ct-guide-sk"
            label="Turn on pagination"
        >
            <div className="ct-page-size">
                <GuideSkBone className="ct-sk-pill-sm" />
                <GuideSkBone className="ct-sk-pill-xs" />
            </div>
            <div className="ct-page-controls">
                <GuideSkBone className="ct-sk-sq-sm" />
                <GuideSkBone className="ct-sk-sq-sm" />
                <GuideSkBone className="ct-sk-sq-sm" />
                <GuideSkBone className="ct-sk-sq-sm" />
            </div>
        </GuideSkActivate>
    );
}

function RowActionsMenu({ rowName, open, onToggle, onClose, onSelect }) {
    const rootRef = useClickOutside(open, onClose);

    return (
        <div className="ct-row-actions is-guide-active" ref={rootRef}>
            <button
                type="button"
                className="ct-row-actions-btn"
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={`Actions for ${rowName}`}
                onClick={onToggle}
            >
                <Icon name="more" size={18} />
            </button>
            {open ? (
                <div className="ct-row-actions-menu" role="menu" aria-label={`Actions for ${rowName}`}>
                    {ROW_ACTION_OPTIONS.map((label) => (
                        <button
                            key={label}
                            type="button"
                            className="ct-row-actions-item"
                            role="menuitem"
                            onClick={() => onSelect(label)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function TableGuideDemo({ focus, title, subtitle, asHeading = false, onActivateRegion, leading }) {
    const searchId = useId();
    const pageInputId = useId();
    const defaults = getGuideDefaults(focus);
    const displayTitle = title || 'All Campaigns';
    const displaySubtitle =
        subtitle || 'Manage all active campaigns or upload and create new ones';

    const [enabledFilters, setEnabledFilters] = useState(() => defaults.enabledFilters || []);
    const [filterValues, setFilterValues] = useState(() => defaults.filterValues || EMPTY_FILTER_VALUES);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState(() => defaults.selectedIds || new Set());
    const [expandedIds, setExpandedIds] = useState(() => defaults.expandedIds || new Set());
    const [openMenu, setOpenMenu] = useState(null);
    const [openRowMenu, setOpenRowMenu] = useState(null);
    const [toast, setToast] = useState('');
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageInput, setPageInput] = useState('1');
    const [sortKey, setSortKey] = useState(defaults.sortKey || null);
    const [sortDir, setSortDir] = useState(defaults.sortDir || 'asc');

    const closeMenus = useCallback(() => {
        setOpenMenu(null);
        setOpenRowMenu(null);
    }, []);

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
    const pageStart = (safePage - 1) * pageSize;
    const pageRows = filteredRows.slice(pageStart, pageStart + pageSize).slice(0, GUIDE_PAGE_SIZE);
    const pageIds = pageRows.map((row) => row.id);
    const filteredIds = filteredRows.map((row) => row.id);

    const selectedVisibleCount = pageIds.filter((id) => selectedIds.has(id)).length;
    const allVisibleSelected = pageIds.length > 0 && selectedVisibleCount === pageIds.length;
    const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;
    const selectedCount = selectedIds.size;
    const hasAppliedFilterValues =
        enabledFilters.some((id) => filterHasValue(id, filterValues)) || search.trim().length > 0;
    const rangeStart = filteredRows.length === 0 ? 0 : pageStart + 1;
    const rangeEnd = Math.min(pageStart + pageSize, filteredRows.length);

    useEffect(() => {
        if (!toast) return undefined;
        const timer = window.setTimeout(() => setToast(''), 2200);
        return () => window.clearTimeout(timer);
    }, [toast]);

    const prevRegionsRef = useRef(null);
    useEffect(() => {
        if (!(focus instanceof Set)) return undefined;

        const prev = prevRegionsRef.current;
        prevRegionsRef.current = new Set(focus);
        if (!prev) return undefined;

        const added = new Set([...focus].filter((id) => !prev.has(id)));
        if (added.size === 0) return undefined;

        const nextDefaults = getGuideDefaults(added);
        if (nextDefaults.enabledFilters) setEnabledFilters(nextDefaults.enabledFilters);
        if (nextDefaults.filterValues) setFilterValues(nextDefaults.filterValues);
        if (nextDefaults.selectedIds) setSelectedIds(nextDefaults.selectedIds);
        if (nextDefaults.expandedIds) setExpandedIds(nextDefaults.expandedIds);
        if (nextDefaults.sortKey) {
            setSortKey(nextDefaults.sortKey);
            setSortDir(nextDefaults.sortDir || 'asc');
        }
        return undefined;
    }, [focus]);

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

    const TitleTag = asHeading ? 'h2' : 'h3';
    const showActionsCol = isGuideRegionActive(focus, 'actions');
    const showExpandCol = isGuideRegionActive(focus, 'expand');
    const showExpandSk = Boolean(onActivateRegion) && !showExpandCol;
    const tableColSpan = (showExpandCol ? 2 : 1) + DATA_COLUMNS.length + (showActionsCol ? 1 : 0);
    const focusAttr = focus instanceof Set ? ([...focus].join(' ') || 'overview') : focus;

    return (
        <div className="ct-wrap ct-wrap--guide" data-focus={focusAttr} aria-label="Table guide demo">
            {leading || null}
            {isGuideRegionActive(focus, 'title') || isGuideRegionActive(focus, 'primary') ? (
                <div className={`ct-header${isGuideRegionActive(focus, 'title') || isGuideRegionActive(focus, 'primary') ? ' is-guide-active' : ''}`}>
                    {isGuideRegionActive(focus, 'title') ? (
                        <div>
                            <TitleTag className="ct-title">{displayTitle}</TitleTag>
                            <p className="ct-subtitle">{displaySubtitle}</p>
                        </div>
                    ) : (
                        <GuideSkActivate region="title" focus={focus} onActivate={onActivateRegion} className="ct-sk-heading">
                            <GuideSkBone className="ct-sk-title" />
                            <GuideSkBone className="ct-sk-subtitle" />
                        </GuideSkActivate>
                    )}
                    {isGuideRegionActive(focus, 'primary') ? (
                        <button
                            type="button"
                            className="ct-upload"
                            onClick={() => flash('Create new — demo action')}
                        >
                            + Create new...
                        </button>
                    ) : (
                        <GuideSkActivate region="primary" focus={focus} onActivate={onActivateRegion}>
                            <GuideSkBone className="ct-sk-cta" />
                        </GuideSkActivate>
                    )}
                </div>
            ) : (
                <GuideSkHeader focus={focus} onActivate={onActivateRegion} />
            )}

            {isGuideRegionActive(focus, 'filters') || isGuideRegionActive(focus, 'search') ? (
                <div className="ct-toolbar is-guide-active">
                    {isGuideRegionActive(focus, 'filters') ? (
                        <div className="ct-filters">
                            <FilterPicker
                                enabledFilters={enabledFilters}
                                onToggleFilter={toggleEnabledFilter}
                                open={openMenu === 'picker'}
                                onToggle={() => setOpenMenu((menu) => (menu === 'picker' ? null : 'picker'))}
                                onClose={closeMenus}
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
                    ) : (
                        <GuideSkActivate region="filters" focus={focus} onActivate={onActivateRegion} className="ct-filters ct-guide-sk">
                            <GuideSkBone className="ct-sk-pill-md" />
                        </GuideSkActivate>
                    )}

                    {isGuideRegionActive(focus, 'search') ? (
                        <div className="ct-search">
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
                    ) : (
                        <GuideSkActivate region="search" focus={focus} onActivate={onActivateRegion}>
                            <GuideSkBone className="ct-sk-pill-lg" />
                        </GuideSkActivate>
                    )}
                </div>
            ) : (
                <GuideSkToolbar focus={focus} onActivate={onActivateRegion} />
            )}

            {isGuideRegionActive(focus, 'bulk') || isGuideRegionActive(focus, 'select') ? (
                <div className="ct-bulk is-guide-active" role="region" aria-label="Bulk actions">
                    {isGuideRegionActive(focus, 'select') || !(focus instanceof Set) ? (
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
                    ) : (
                        <div className="ct-bulk-left" />
                    )}
                    {isGuideRegionActive(focus, 'bulk') ? (
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
                                disabled={selectedCount === 0 && isGuideRegionActive(focus, 'select')}
                                onClick={() => flash(`Download PDF for ${isGuideRegionActive(focus, 'select') ? `${selectedCount} row(s)` : 'table'}`)}
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
                    ) : null}
                </div>
            ) : (
                <GuideSkBulkBar focus={focus} onActivate={onActivateRegion} />
            )}

            <div className={`ct-table-scroll${isGuideRegionActive(focus, 'expand') || isGuideRegionActive(focus, 'select') || isGuideRegionActive(focus, 'actions') || isGuideRegionActive(focus, 'sorting') ? ' is-guide-active' : ''}`}>
                <table className="ct-table">
                    <colgroup>
                        <col className="ct-col-check" />
                        {showExpandCol || showExpandSk ? <col className="ct-col-expand" /> : null}
                        {DATA_COLUMNS.map((col) => (
                            <col key={col.id} style={{ width: col.width, minWidth: col.minWidth }} />
                        ))}
                        {showActionsCol ? <col className="ct-col-actions" /> : null}
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="ct-check-cell" scope="col">
                                <span className="visually-hidden">Select</span>
                            </th>
                            {showExpandCol || showExpandSk ? (
                                <th className="ct-expand-cell" scope="col">
                                    <span className="visually-hidden">Expand</span>
                                </th>
                            ) : null}
                            {isGuideRegionActive(focus, 'sorting') ? (
                                DATA_COLUMNS.map((col) => {
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
                                            </div>
                                        </th>
                                    );
                                })
                            ) : (
                                <>
                                    <th scope="col">
                                        <GuideSkActivate region="sorting" focus={focus} onActivate={onActivateRegion}>
                                            <GuideSkBone className="ct-sk-mid" style={{ width: '56%' }} />
                                        </GuideSkActivate>
                                    </th>
                                    <th scope="col" className="ct-guide-sk-hide-sm">
                                        <GuideSkActivate region="sorting" focus={focus} onActivate={onActivateRegion}>
                                            <GuideSkBone className="ct-sk-mid" style={{ width: '48%' }} />
                                        </GuideSkActivate>
                                    </th>
                                    <th scope="col">
                                        <GuideSkActivate region="sorting" focus={focus} onActivate={onActivateRegion}>
                                            <GuideSkBone className="ct-sk-mid" style={{ width: '48%' }} />
                                        </GuideSkActivate>
                                    </th>
                                    <th scope="col">
                                        <GuideSkActivate region="sorting" focus={focus} onActivate={onActivateRegion}>
                                            <GuideSkBone className="ct-sk-mid" style={{ width: '48%' }} />
                                        </GuideSkActivate>
                                    </th>
                                </>
                            )}
                            {showActionsCol ? (
                                <th className="ct-actions-cell" scope="col">
                                    <span className="visually-hidden">Actions</span>
                                </th>
                            ) : null}
                        </tr>
                    </thead>
                    <tbody>
                        {isGuideRegionActive(focus, 'expand') || isGuideRegionActive(focus, 'select') || isGuideRegionActive(focus, 'actions') ? (
                            pageRows.map((row) => {
                                const selected = selectedIds.has(row.id);
                                const expanded = expandedIds.has(row.id);
                                const statusClass = `is-${row.status.toLowerCase()}`;
                                return (
                                    <React.Fragment key={row.id}>
                                        <tr className={selected ? 'is-selected' : undefined}>
                                            <td className="ct-check-cell">
                                                {isGuideRegionActive(focus, 'select-col') ? (
                                                    <input
                                                        className="ct-checkbox"
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() => toggleRow(row.id)}
                                                        aria-label={`Select ${row.name}`}
                                                    />
                                                ) : (
                                                    <GuideSkActivate
                                                        region="select"
                                                        focus={focus}
                                                        onActivate={onActivateRegion}
                                                        label="Turn on multi-select"
                                                    >
                                                        <GuideSkBone className="ct-sk-sq" />
                                                    </GuideSkActivate>
                                                )}
                                            </td>
                                            {showExpandCol ? (
                                                <td className="ct-expand-cell">
                                                    <button
                                                        type="button"
                                                        className="ct-expand"
                                                        aria-expanded={expanded}
                                                        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${row.name}`}
                                                        onClick={() => toggleExpanded(row.id)}
                                                    >
                                                        <Icon name="chevron" size={14} />
                                                    </button>
                                                </td>
                                            ) : null}
                                            <td className="ct-cell-name">
                                                <GuideSkBone className="ct-sk-name" />
                                            </td>
                                            <td className="ct-guide-sk-hide-sm">
                                                <GuideSkBone className="ct-sk-mid" />
                                            </td>
                                            <td><GuideSkBone className="ct-sk-mid" /></td>
                                            <td><GuideSkBone className="ct-sk-mid" /></td>
                                            {showActionsCol ? (
                                                <td className="ct-actions-cell">
                                                    <RowActionsMenu
                                                        rowName={row.name}
                                                        open={openRowMenu === row.id}
                                                        onToggle={() =>
                                                            setOpenRowMenu((current) =>
                                                                current === row.id ? null : row.id
                                                            )
                                                        }
                                                        onClose={() => setOpenRowMenu(null)}
                                                        onSelect={(label) => {
                                                            flash(`${label} — ${row.name}`);
                                                            setOpenRowMenu(null);
                                                        }}
                                                    />
                                                </td>
                                            ) : null}
                                        </tr>
                                        {expanded && isGuideRegionActive(focus, 'expand') ? (
                                            <tr className="ct-detail-row">
                                                <td colSpan={tableColSpan}>
                                                    {row.programType} program · Owner {row.owner} · Budget{' '}
                                                    {row.budget}
                                                </td>
                                            </tr>
                                        ) : null}
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <GuideSkTableRows
                                withActions={showActionsCol}
                                withExpand={showExpandSk}
                                focus={focus}
                                onActivate={onActivateRegion}
                            />
                        )}
                    </tbody>
                </table>
            </div>

            {isGuideRegionActive(focus, 'pagination') ? (
                <div className="ct-pagination is-guide-active" role="navigation" aria-label="Table pagination">
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
                                        goToPage(parseInt(pageInput, 10) || 1);
                                    }
                                }}
                            />
                            <span>/ {totalPages}</span>
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
            ) : (
                <GuideSkPagination focus={focus} onActivate={onActivateRegion} />
            )}

            <div className="ct-footer">
                <span aria-live="polite">{toast}</span>
            </div>
        </div>
    );
}

const ESSENTIAL_ROW_COUNT = 3;

function EssentialTableDemo({ label }) {
    const wrapRef = useRef(null);
    const rows = ALL_CAMPAIGNS.slice(0, ESSENTIAL_ROW_COUNT);

    return (
        <div
            className="ct-wrap ct-wrap--guide ct-wrap--essential ct-wrap--callouts"
            ref={wrapRef}
            data-focus="essential"
            aria-label={label || 'Essential data table'}
        >
            <div className="ct-table-scroll is-guide-active">
                <table className="ct-table">
                    <colgroup>
                        {DATA_COLUMNS.map((col) => (
                            <col key={col.id} style={{ width: col.width, minWidth: col.minWidth }} />
                        ))}
                    </colgroup>
                    <thead>
                        <tr>
                            {DATA_COLUMNS.map((col) => (
                                <th
                                    key={col.id}
                                    scope="col"
                                    {...(col.id === 'name' ? { 'data-callout': '1' } : {})}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={row.id}>
                                <td className="ct-cell-name">
                                    <a
                                        className="ct-campaign-link"
                                        href={`#${row.id}`}
                                        onClick={(event) => event.preventDefault()}
                                        {...(rowIndex === 0 ? { 'data-callout': '2' } : {})}
                                    >
                                        {row.name}
                                    </a>
                                </td>
                                <td {...(rowIndex === 0 ? { 'data-callout': '3' } : {})}>
                                    <span className={`ct-status is-${row.status.toLowerCase()}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td>{formatShortDate(row.startDate)}</td>
                                <td>{formatShortDate(row.endDate)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <CalloutBoundary>
                <TableCallouts wrapRef={wrapRef} defs={ESSENTIAL_CALLOUTS} layoutKey="essential" />
            </CalloutBoundary>
        </div>
    );
}

const COVER_OPTIONAL_FEATURES = [
    { id: 'title', label: 'Title / description' },
    { id: 'primary', label: 'Primary action' },
    { id: 'filters', label: 'Filters' },
    { id: 'search', label: 'Search' },
    { id: 'bulk', label: 'Bulk action bar' },
    { id: 'sorting', label: 'Sorting' },
    { id: 'select', label: 'Multi-select' },
    { id: 'expand', label: 'Expanding rows' },
    { id: 'pagination', label: 'Pagination' }
];

function CoverFeatureToggle({ id, label, checked, onToggle }) {
    const inputId = useId();

    return (
        <li>
            <label className="callout-legend-item cover-feature-toggle" htmlFor={inputId}>
                <span className="cover-toggle">
                    <input
                        id={inputId}
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(id)}
                    />
                    <span className="cover-toggle-ui" aria-hidden="true" />
                </span>
                <span>{label}</span>
            </label>
        </li>
    );
}

function CoverMasterToggle({ mode, onToggle }) {
    const inputId = useId();
    const inputRef = useRef(null);
    const label = mode === 'all' ? 'All on' : mode === 'none' ? 'All off' : 'Some on';

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = mode === 'some';
        }
    }, [mode]);

    return (
        <li className="cover-feature-master">
            <label className="callout-legend-item cover-feature-toggle" htmlFor={inputId}>
                <span className="cover-toggle cover-toggle--master">
                    <input
                        ref={inputRef}
                        id={inputId}
                        type="checkbox"
                        checked={mode === 'all'}
                        onChange={onToggle}
                        aria-checked={mode === 'some' ? 'mixed' : mode === 'all'}
                        aria-label={`Toggle all optional features (${label})`}
                    />
                    <span className="cover-toggle-ui" aria-hidden="true" />
                </span>
                <span>{label}</span>
            </label>
        </li>
    );
}

function CoverTablePlayground({ label }) {
    const [activeRegions, setActiveRegions] = useState(() => new Set());

    const enabledCount = COVER_OPTIONAL_FEATURES.filter((feature) =>
        activeRegions.has(feature.id)
    ).length;
    const masterMode =
        enabledCount === 0
            ? 'none'
            : enabledCount === COVER_OPTIONAL_FEATURES.length
              ? 'all'
              : 'some';

    function toggleRegion(id) {
        setActiveRegions((prev) => {
            const next = new Set(prev);
            const turningOff = next.has(id);

            if (turningOff) {
                next.delete(id);
                if (id === 'bulk') next.delete('select');
            } else {
                next.add(id);
                if (id === 'select') next.add('bulk');
            }

            return next;
        });
    }

    function toggleAllFeatures() {
        setActiveRegions((prev) => {
            const allOn = COVER_OPTIONAL_FEATURES.every((feature) => prev.has(feature.id));
            if (allOn) return new Set();
            return new Set(COVER_OPTIONAL_FEATURES.map((feature) => feature.id));
        });
    }

    function activateRegion(id) {
        setActiveRegions((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            if (id === 'select') next.add('bulk');
            return next;
        });
    }

    return (
        <div className="cover-table-playground" aria-label={label || 'Interactive table skeleton'}>
            <TableGuideDemo
                focus={activeRegions}
                title="Clear descriptive table titles..."
                subtitle="Improve scanability and help users understand what to expect in the table below"
                asHeading
                onActivateRegion={activateRegion}
                leading={
                    <ul className="callout-legend cover-feature-toggles" aria-label="Optional table features">
                        <CoverMasterToggle mode={masterMode} onToggle={toggleAllFeatures} />
                        {COVER_OPTIONAL_FEATURES.map((feature) => (
                            <CoverFeatureToggle
                                key={feature.id}
                                id={feature.id}
                                label={feature.label}
                                checked={activeRegions.has(feature.id)}
                                onToggle={toggleRegion}
                            />
                        ))}
                    </ul>
                }
            />
        </div>
    );
}

document.querySelectorAll('[data-table-skeleton]').forEach((host) => {
    if (host.dataset.mounted === 'true') return;
    host.dataset.mounted = 'true';
    const root = ReactDOM.createRoot(host);
    const focus = host.getAttribute('data-focus') || 'title';

    if (focus === 'essential') {
        root.render(<EssentialTableDemo label={host.getAttribute('data-label') || undefined} />);
        return;
    }

    if (focus === 'overview' || focus === 'playground' || host.id === 'cover-table-skeleton') {
        root.render(
            <CoverTablePlayground label={host.getAttribute('data-label') || undefined} />
        );
        return;
    }

    root.render(
        <TableGuideDemo
            focus={focus === 'none' ? 'overview' : focus}
            title={host.getAttribute('data-title') || undefined}
            subtitle={host.getAttribute('data-subtitle') || undefined}
            asHeading={host.hasAttribute('data-as-heading')}
        />
    );
});
