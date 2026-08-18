/* Table guide — focused skeleton demos (reuses campaigns-table.jsx pieces) */

const GUIDE_PAGE_SIZE = 3;
const ROW_ACTION_OPTIONS = ['Edit', 'Duplicate', 'Archive', 'Delete'];

function getGuideDefaults(focus) {
    switch (focus) {
        case 'filters':
            return {
                enabledFilters: ['program', 'status'],
                filterValues: {
                    ...EMPTY_FILTER_VALUES,
                    program: ['Enterprise'],
                    status: ['Live', 'Draft', 'Paused', 'Ended']
                }
            };
        case 'select':
        case 'bulk':
            return { selectedIds: new Set(['cmp-01', 'cmp-02']) };
        case 'sorting':
            return { sortKey: 'name', sortDir: 'asc' };
        default:
            return {};
    }
}

function isGuideRegionActive(focus, region) {
    if (focus === region) return true;
    if (focus === 'select' && (region === 'bulk' || region === 'select-col')) return true;
    return false;
}

function GuideSkBone({ className = '', style }) {
    return <span className={`ct-sk-bone ${className}`.trim()} style={style} aria-hidden="true" />;
}

function GuideSkHeader() {
    return (
        <div className="ct-header ct-guide-sk">
            <div>
                <GuideSkBone className="ct-sk-title" />
                <GuideSkBone className="ct-sk-subtitle" />
            </div>
            <GuideSkBone className="ct-sk-cta" />
        </div>
    );
}

function GuideSkToolbar() {
    return (
        <div className="ct-toolbar ct-guide-sk">
            <div className="ct-filters">
                <GuideSkBone className="ct-sk-pill-md" />
                <GuideSkBone className="ct-sk-pill-md" style={{ width: 108 }} />
            </div>
            <GuideSkBone className="ct-sk-pill-lg" />
        </div>
    );
}

function GuideSkBulkBar() {
    return (
        <div className="ct-bulk ct-guide-sk" aria-hidden="true">
            <GuideSkBone className="ct-sk-pill-md" style={{ width: 120 }} />
            <GuideSkBone className="ct-sk-pill-md" style={{ width: 180 }} />
        </div>
    );
}

function GuideSkTableRows({ withActions = false }) {
    return (
        <>
            {Array.from({ length: GUIDE_PAGE_SIZE }, (_, index) => (
                <tr key={index} className="ct-guide-sk-row">
                    <td><GuideSkBone className="ct-sk-sq" /></td>
                    <td><GuideSkBone className="ct-sk-sq" /></td>
                    <td><GuideSkBone className="ct-sk-name" /></td>
                    <td className="ct-guide-sk-hide-sm"><GuideSkBone className="ct-sk-mid" /></td>
                    <td><GuideSkBone className="ct-sk-mid" /></td>
                    {withActions ? (
                        <td><GuideSkBone className="ct-sk-sq" /></td>
                    ) : (
                        <td><GuideSkBone className="ct-sk-sq" /></td>
                    )}
                </tr>
            ))}
        </>
    );
}

function GuideSkPagination() {
    return (
        <div className="ct-pagination ct-guide-sk" aria-hidden="true">
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
        </div>
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

function TableGuideDemo({ focus, title, subtitle, asHeading = false }) {
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
    const [expandedIds, setExpandedIds] = useState(() => new Set());
    const [openMenu, setOpenMenu] = useState(null);
    const [openRowMenu, setOpenRowMenu] = useState(null);
    const [toast, setToast] = useState('');
    const [pageSize, setPageSize] = useState(10);
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
    const showActionsCol = focus === 'actions';
    const tableColSpan = 2 + DATA_COLUMNS.length + (showActionsCol ? 1 : 0);

    return (
        <div className="ct-wrap ct-wrap--guide" data-focus={focus} aria-label="Table guide demo">
            {isGuideRegionActive(focus, 'title') || isGuideRegionActive(focus, 'primary') ? (
                <div className={`ct-header${isGuideRegionActive(focus, 'title') || isGuideRegionActive(focus, 'primary') ? ' is-guide-active' : ''}`}>
                    {isGuideRegionActive(focus, 'title') ? (
                        <div>
                            <TitleTag className="ct-title">{displayTitle}</TitleTag>
                            <p className="ct-subtitle">{displaySubtitle}</p>
                        </div>
                    ) : (
                        <div className="ct-guide-sk">
                            <GuideSkBone className="ct-sk-title" />
                            <GuideSkBone className="ct-sk-subtitle" />
                        </div>
                    )}
                    {isGuideRegionActive(focus, 'primary') ? (
                        <button
                            type="button"
                            className="ct-upload"
                            onClick={() => flash('Upload new — demo action')}
                        >
                            <Icon name="upload" size={16} />
                            Upload new
                        </button>
                    ) : (
                        <GuideSkBone className="ct-sk-cta" />
                    )}
                </div>
            ) : (
                <GuideSkHeader />
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
                        <div className="ct-filters ct-guide-sk">
                            <GuideSkBone className="ct-sk-pill-md" />
                        </div>
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
                        <GuideSkBone className="ct-sk-pill-lg" />
                    )}
                </div>
            ) : (
                <GuideSkToolbar />
            )}

            {isGuideRegionActive(focus, 'bulk') || isGuideRegionActive(focus, 'select') ? (
                <div className="ct-bulk is-guide-active" role="region" aria-label="Bulk actions">
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
                    {focus === 'bulk' ? (
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
                    ) : null}
                </div>
            ) : (
                <GuideSkBulkBar />
            )}

            <div className={`ct-table-scroll${isGuideRegionActive(focus, 'expand') || isGuideRegionActive(focus, 'select') || isGuideRegionActive(focus, 'actions') || isGuideRegionActive(focus, 'sorting') ? ' is-guide-active' : ''}`}>
                <table className="ct-table">
                    <colgroup>
                        <col className="ct-col-check" />
                        <col className="ct-col-expand" />
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
                            <th className="ct-expand-cell" scope="col">
                                <span className="visually-hidden">Expand</span>
                            </th>
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
                                    <th scope="col"><GuideSkBone className="ct-sk-mid" style={{ width: '56%' }} /></th>
                                    <th scope="col" className="ct-guide-sk-hide-sm"><GuideSkBone className="ct-sk-mid" style={{ width: '48%' }} /></th>
                                    <th scope="col"><GuideSkBone className="ct-sk-mid" style={{ width: '48%' }} /></th>
                                    <th scope="col"><GuideSkBone className="ct-sk-mid" style={{ width: '48%' }} /></th>
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
                        {focus === 'expand' || focus === 'select' || focus === 'actions' ? (
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
                                                    <GuideSkBone className="ct-sk-sq" />
                                                )}
                                            </td>
                                            <td className="ct-expand-cell">
                                                {focus === 'expand' ? (
                                                    <button
                                                        type="button"
                                                        className="ct-expand"
                                                        aria-expanded={expanded}
                                                        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${row.name}`}
                                                        onClick={() => toggleExpanded(row.id)}
                                                    >
                                                        <Icon name="chevron" size={14} />
                                                    </button>
                                                ) : (
                                                    <GuideSkBone className="ct-sk-sq" />
                                                )}
                                            </td>
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
                                        {expanded && focus === 'expand' ? (
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
                            <GuideSkTableRows withActions={showActionsCol} />
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
                <GuideSkPagination />
            )}

            <div className="ct-footer">
                <span aria-live="polite">{toast}</span>
            </div>
        </div>
    );
}

const ESSENTIAL_ROW_COUNT = 5;

function EssentialTableDemo({ label }) {
    const rows = ALL_CAMPAIGNS.slice(0, ESSENTIAL_ROW_COUNT);

    return (
        <div
            className="ct-wrap ct-wrap--guide ct-wrap--essential"
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
                                <th key={col.id} scope="col">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id}>
                                <td className="ct-cell-name">
                                    <a
                                        className="ct-campaign-link"
                                        href={`#${row.id}`}
                                        onClick={(event) => event.preventDefault()}
                                    >
                                        {row.name}
                                    </a>
                                </td>
                                <td>
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
        </div>
    );
}

document.querySelectorAll('[data-table-skeleton]').forEach((host) => {
    const root = ReactDOM.createRoot(host);
    const focus = host.getAttribute('data-focus') || 'title';

    if (focus === 'essential') {
        root.render(<EssentialTableDemo label={host.getAttribute('data-label') || undefined} />);
        return;
    }

    root.render(
        <TableGuideDemo
            focus={focus}
            title={host.getAttribute('data-title') || undefined}
            subtitle={host.getAttribute('data-subtitle') || undefined}
            asHeading={host.hasAttribute('data-as-heading')}
        />
    );
});
