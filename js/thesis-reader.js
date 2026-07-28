(function () {
    'use strict';

    var PDF_URL = 'docs/thesis.pdf';
    var MIN_SCALE = 0.6;
    var MAX_SCALE = 2.4;
    var SCALE_STEP = 0.15;

    var statusEl = document.getElementById('thesisStatus');
    var pagesEl = document.getElementById('thesisPages');
    var viewportEl = document.getElementById('thesisViewport');
    var pageInput = document.getElementById('thesisPageInput');
    var pageTotal = document.getElementById('thesisPageTotal');
    var prevBtn = document.getElementById('thesisPrev');
    var nextBtn = document.getElementById('thesisNext');
    var zoomInBtn = document.getElementById('thesisZoomIn');
    var zoomOutBtn = document.getElementById('thesisZoomOut');
    var pageControls = document.querySelector('.thesis-page-controls');
    var zoomControls = document.querySelector('.thesis-zoom-controls');

    if (!window.pdfjsLib || !pagesEl || !viewportEl) {
        if (statusEl) {
            statusEl.innerHTML =
                'Unable to load the PDF reader. <a href="' + PDF_URL + '" target="_blank" rel="noopener noreferrer">Open the thesis PDF</a> instead.';
        }
        return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    var pdfDoc = null;
    var scale = 1;
    var currentPage = 1;
    var rendering = Object.create(null);
    var rendered = Object.create(null);
    var pageObserver = null;
    var updatingFromScroll = false;
    var readyForScrollTracking = false;
    var visibleRatios = Object.create(null);

    function setStatus(message, isError) {
        if (!statusEl) return;
        statusEl.hidden = !message;
        statusEl.textContent = message || '';
        statusEl.classList.toggle('is-error', !!isError);
    }

    function fitScale() {
        var width = viewportEl.clientWidth || window.innerWidth;
        // Approximate A4 width at 72dpi; leave side padding for the reader chrome
        var target = Math.max(280, width - 48);
        return Math.min(1.35, Math.max(0.7, target / 612));
    }

    function updatePageUI() {
        if (!pdfDoc) return;
        pageInput.value = String(currentPage);
        pageInput.max = String(pdfDoc.numPages);
        pageTotal.textContent = '/ ' + pdfDoc.numPages;
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= pdfDoc.numPages;
    }

    function scrollToPage(pageNumber, behavior) {
        var page = pagesEl.querySelector('[data-page-number="' + pageNumber + '"]');
        if (!page) return;
        updatingFromScroll = true;
        page.scrollIntoView({ behavior: behavior || 'smooth', block: 'start' });
        window.setTimeout(function () {
            updatingFromScroll = false;
        }, 400);
    }

    function goToPage(pageNumber) {
        if (!pdfDoc) return;
        var next = Math.min(pdfDoc.numPages, Math.max(1, pageNumber | 0));
        currentPage = next;
        updatePageUI();
        scrollToPage(next, 'smooth');
        renderPage(next);
        if (next > 1) renderPage(next - 1);
        if (next < pdfDoc.numPages) renderPage(next + 1);
    }

    function renderPage(pageNumber) {
        if (!pdfDoc || rendering[pageNumber] || rendered[pageNumber]) return;

        var wrapper = pagesEl.querySelector('[data-page-number="' + pageNumber + '"]');
        if (!wrapper) return;

        rendering[pageNumber] = true;

        pdfDoc.getPage(pageNumber).then(function (page) {
            var viewport = page.getViewport({ scale: scale });
            var canvas = wrapper.querySelector('canvas');
            var context = canvas.getContext('2d', { alpha: false });
            var outputScale = window.devicePixelRatio || 1;

            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = Math.floor(viewport.width) + 'px';
            canvas.style.height = Math.floor(viewport.height) + 'px';

            wrapper.style.width = Math.floor(viewport.width) + 'px';
            wrapper.style.minHeight = Math.floor(viewport.height) + 'px';

            var transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

            return page
                .render({
                    canvasContext: context,
                    viewport: viewport,
                    transform: transform
                })
                .promise.then(function () {
                    rendered[pageNumber] = true;
                    wrapper.classList.add('is-rendered');
                    wrapper.removeAttribute('aria-busy');
                });
        }).catch(function () {
            wrapper.classList.add('is-error');
            wrapper.setAttribute('aria-label', 'Failed to load page ' + pageNumber);
        }).finally(function () {
            delete rendering[pageNumber];
        });
    }

    function clearPages() {
        if (pageObserver) {
            pageObserver.disconnect();
            pageObserver = null;
        }
        rendering = Object.create(null);
        rendered = Object.create(null);
        visibleRatios = Object.create(null);
        readyForScrollTracking = false;
        pagesEl.innerHTML = '';
    }

    function buildPlaceholders() {
        var frag = document.createDocumentFragment();
        for (var i = 1; i <= pdfDoc.numPages; i++) {
            var page = document.createElement('article');
            page.className = 'thesis-page';
            page.dataset.pageNumber = String(i);
            page.setAttribute('aria-label', 'Page ' + i + ' of ' + pdfDoc.numPages);
            page.setAttribute('aria-busy', 'true');

            var canvas = document.createElement('canvas');
            page.appendChild(canvas);
            frag.appendChild(page);
        }
        pagesEl.appendChild(frag);

        pageObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    var num = parseInt(entry.target.dataset.pageNumber, 10);
                    if (entry.isIntersecting) {
                        renderPage(num);
                        visibleRatios[num] = entry.intersectionRatio;
                    } else {
                        delete visibleRatios[num];
                    }
                });

                if (!readyForScrollTracking || updatingFromScroll) return;

                var bestPage = currentPage;
                var bestRatio = -1;
                Object.keys(visibleRatios).forEach(function (key) {
                    var ratio = visibleRatios[key];
                    var pageNum = parseInt(key, 10);
                    if (ratio > bestRatio || (ratio === bestRatio && pageNum < bestPage)) {
                        bestRatio = ratio;
                        bestPage = pageNum;
                    }
                });

                if (bestRatio >= 0 && bestPage !== currentPage) {
                    currentPage = bestPage;
                    updatePageUI();
                }
            },
            {
                root: viewportEl,
                rootMargin: '600px 0px 600px 0px',
                threshold: [0, 0.15, 0.35, 0.55, 0.75]
            }
        );

        Array.prototype.forEach.call(pagesEl.children, function (el) {
            pageObserver.observe(el);
        });
    }

    function rerenderVisible() {
        var keepPage = currentPage;
        clearPages();
        buildPlaceholders();
        currentPage = keepPage;
        updatePageUI();
        renderPage(keepPage);
        if (keepPage > 1) renderPage(keepPage - 1);
        if (pdfDoc && keepPage < pdfDoc.numPages) renderPage(keepPage + 1);
        scrollToPage(keepPage, 'auto');
        window.setTimeout(function () {
            readyForScrollTracking = true;
        }, 250);
    }

    function setZoom(nextScale) {
        scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
        zoomInBtn.disabled = scale >= MAX_SCALE - 0.001;
        zoomOutBtn.disabled = scale <= MIN_SCALE + 0.001;
        rerenderVisible();
    }

    prevBtn.addEventListener('click', function () {
        goToPage(currentPage - 1);
    });

    nextBtn.addEventListener('click', function () {
        goToPage(currentPage + 1);
    });

    zoomInBtn.addEventListener('click', function () {
        setZoom(scale + SCALE_STEP);
    });

    zoomOutBtn.addEventListener('click', function () {
        setZoom(scale - SCALE_STEP);
    });

    pageInput.addEventListener('change', function () {
        goToPage(parseInt(pageInput.value, 10) || 1);
    });

    pageInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            goToPage(parseInt(pageInput.value, 10) || 1);
            pageInput.blur();
        }
    });

    viewportEl.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight' || event.key === 'PageDown') {
            event.preventDefault();
            goToPage(currentPage + 1);
        } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
            event.preventDefault();
            goToPage(currentPage - 1);
        } else if (event.key === '+' || event.key === '=') {
            event.preventDefault();
            setZoom(scale + SCALE_STEP);
        } else if (event.key === '-') {
            event.preventDefault();
            setZoom(scale - SCALE_STEP);
        }
    });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
            if (!pdfDoc) return;
            var fitted = fitScale();
            // Only auto-refit when user hasn't zoomed far from the fit baseline
            if (Math.abs(scale - fitted) < 0.2) {
                scale = fitted;
                rerenderVisible();
            }
        }, 200);
    });

    setStatus('Loading thesis…');

    pdfjsLib
        .getDocument({
            url: PDF_URL,
            withCredentials: false
        })
        .promise.then(function (pdf) {
            pdfDoc = pdf;
            scale = fitScale();
            pageControls.hidden = false;
            zoomControls.hidden = false;
            setStatus('');
            buildPlaceholders();
            updatePageUI();
            renderPage(1);
            if (pdf.numPages > 1) renderPage(2);
            window.setTimeout(function () {
                readyForScrollTracking = true;
            }, 250);
        })
        .catch(function () {
            setStatus('', false);
            if (statusEl) {
                statusEl.hidden = false;
                statusEl.classList.add('is-error');
                statusEl.innerHTML =
                    'Could not load the thesis reader. <a href="' +
                    PDF_URL +
                    '" target="_blank" rel="noopener noreferrer">Open or download the PDF</a>.';
            }
        });
})();
