/**
 * Widget Sales Insight Center - Main Application Logic
 */
var SalesInsightWidget = SuperWidget.extend({
    loader: null,

    init: function () {
        if (!SalesInsightCenter.init()) return;

        this.loader = typeof FLUIGC !== "undefined" && FLUIGC.loading ?
            FLUIGC.loading("#salesInsightCenterWidgetWrap", { textMessage: "Carregando..." }) : null;

        this.bindEvents();
        this.render();
    },

    bindEvents: function () {
        var self = this;

        // Buscar
        var bttnBuscar = document.getElementById("bttn_buscar");
        if (bttnBuscar) bttnBuscar.onclick = function (e) { e.preventDefault(); self.search(); };

        var searchInput = document.getElementById("searchSolicitacao");
        if (searchInput) searchInput.onkeypress = function (e) { if (e.key === "Enter") { e.preventDefault(); self.search(); } };

        // Limpar Geral
        var bttnLimpar = document.getElementById("bttn_limpar");
        if (bttnLimpar) bttnLimpar.onclick = function (e) { e.preventDefault(); self.clearAll(); };

        // Toggle Painel Filtros
        var bttnFiltros = document.getElementById("bttn_filtros");
        if (bttnFiltros) bttnFiltros.onclick = function (e) {
            e.preventDefault();
            var panel = document.getElementById("filterPanel");
            if (panel) panel.style.display = panel.style.display === "none" ? "block" : "none";
        };

        // Limpar Filtros
        var bttnLimparFiltros = document.getElementById("bttn_limpar_filtros");
        if (bttnLimparFiltros) bttnLimparFiltros.onclick = function (e) { e.preventDefault(); self.clearFilters(); };

        // Eventos de filtro
        var onFilterChange = function () { self.search(); };
        ['filterProcesso', 'filterStatus', 'filterDateFrom', 'filterDateTo'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.onchange = onFilterChange;
        });

        // Click na tabela (Event Delegation)
        var tableBody = document.getElementById("datasetBody");
        if (tableBody) tableBody.onclick = function (event) {
            var tr = event.target.closest("tr");
            if (!tr || !tr.id || tr.classList.contains("columns-table")) return;
            if (event.target.closest("a")) return;
            event.preventDefault();
            self.showTracking(tr.id);
        };

        // Relatório
        var bttnReport = document.getElementById("bttn_download");
        if (bttnReport) bttnReport.onclick = function (e) { e.preventDefault(); self.generateReport(); };

    },

    /**
     * Coleta critérios dos inputs de filtro.
     */
    getCriteria: function () {
        var searchInput = document.getElementById("searchSolicitacao");
        var processoSelect = document.getElementById("filterProcesso");
        var statusSelect = document.getElementById("filterStatus");
        var dateFromInput = document.getElementById("filterDateFrom");
        var dateToInput = document.getElementById("filterDateTo");

        return {
            searchText: (searchInput ? searchInput.value : "").trim(),
            filterProcesso: (processoSelect ? processoSelect.value : "").trim(),
            filterStatus: (statusSelect ? statusSelect.value : "").trim(),
            dateFrom: (dateFromInput ? dateFromInput.value : "").trim(),
            dateTo: (dateToInput ? dateToInput.value : "").trim()
        };
    },

    search: function () {
        PaginationService.currentPage = 1;
        this.render();
    },

    clearAll: function () {
        var search = document.getElementById("searchSolicitacao");
        if (search) search.value = "";
        this.clearFilters();
    },

    clearFilters: function () {
        ['filterProcesso', 'filterStatus', 'filterDateFrom', 'filterDateTo'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.value = "";
        });
        this.search();
    },

    showTracking: function (id) {
        ModalUI.openTracking(id);
    },

    generateReport: function () {
        var cache = CacheService.getCache();
        if (!cache) return;
        var filtered = FilterService.applyFilters(cache.columns, cache.values, this.getCriteria());
        ReportService.generateExcel(cache.columns, filtered);
    },

    render: function () {
        var self = this;
        var body = document.getElementById("datasetBody");
        if (!body) return;

        body.setAttribute("aria-busy", "true");
        if (this.loader) this.loader.show();

        // Delay para evitar bloqueio da UI
        setTimeout(function () {
            try {
                var cache = CacheService.getCache();

                // Se cache existe e não expirou, usa ele. Se expirou, agenda atualização mas usa o que tem.
                if (cache && cache.columns && cache.columns.length >= 19) {
                    if (CacheService.isExpired(cache)) {
                        CacheService.scheduleUpdate(function () {
                            OrdersUI.updateCacheLabel("cacheLastUpdateWrap", CacheService.getCache().updatedAt);
                        });
                    }
                    self._displayData(cache.columns, cache.values);
                } else {
                    // Sem cache, busca direto
                    var dataset = PedidoRepository.getOrdersDataset();
                    if (dataset && dataset.columns && dataset.values) {
                        CacheService.setCache(dataset.columns, dataset.values);
                        self._displayData(dataset.columns, dataset.values);
                    } else {
                        throw new Error("Dataset retornado está vazio ou inválido.");
                    }
                }
            } catch (e) {
                console.error("[SalesInsightWidget] Erro crítico no render:", e);
                var detail = e.message ? " (" + e.message + ")" : "";
                OrdersUI.showMessage("datasetBody", "error", "Erro ao carregar os dados. Tente novamente." + detail);
            } finally {
                if (self.loader) self.loader.hide();
            }
        }, 0);
    },

    _displayData: function (columns, values) {
        var cache = CacheService.getCache();
        OrdersUI.updateCacheLabel("cacheLastUpdateWrap", cache ? cache.updatedAt : null);

        // Otimização: Popula filtros apenas no carregamento inicial
        var statusSelect = document.getElementById("filterStatus");
        if (statusSelect && statusSelect.options.length <= 1) {
            OrdersUI.populateFilterOptions("filterStatus", columns, values, "STATUS");
            OrdersUI.populateFilterOptions("filterProcesso", columns, values, "PROCESSO");
        }

        var filtered = FilterService.applyFilters(columns, values, this.getCriteria());
        PaginationService.init(filtered.length, PaginationService.currentPage);

        OrdersUI.renderGrid("datasetBody", columns, filtered);

        var self = this;
        OrdersUI.renderPagination("paginationControls", {
            onBack: function () { if (PaginationService.previousPage()) self.render(); },
            onNext: function () { if (PaginationService.nextPage()) self.render(); },
            onGoTo: function (n) { if (PaginationService.goToPage(n)) self.render(); }
        });
    }
});
