/**
 * @fileoverview Ponto de entrada do Widget Sales Insight Center
 * @module widget/index
 */

(function (global) {
    'use strict';

    /**
     * Namespace do Widget
     * @namespace
     */
    var SalesInsightCenter = {
        // version: '1.1.0', // Irrelevant no momento

        // Utils
        Utils: typeof PedidoUtils !== 'undefined' ? PedidoUtils : null,

        // API
        Repository: typeof PedidoRepository !== 'undefined' ? PedidoRepository : null,

        // Services
        Cache: typeof CacheService !== 'undefined' ? CacheService : null,
        Filter: typeof FilterService !== 'undefined' ? FilterService : null,
        Pagination: typeof PaginationService !== 'undefined' ? PaginationService : null,
        Report: typeof ReportService !== 'undefined' ? ReportService : null,

        // UI
        OrdersUI: typeof OrdersUI !== 'undefined' ? OrdersUI : null,
        ModalUI: typeof ModalUI !== 'undefined' ? ModalUI : null,

        /**
         * Verifica se todos os módulos essenciais foram carregados
         */
        isReady: function () {
            return !!(this.Utils &&
                this.Repository &&
                this.Cache &&
                this.Filter &&
                this.Pagination &&
                this.Report &&
                this.OrdersUI &&
                this.ModalUI);
        },

        getMissingModules: function () {
            var missing = [];
            if (!this.Utils) missing.push('PedidoUtils');
            if (!this.Repository) missing.push('PedidoRepository');
            if (!this.Cache) missing.push('CacheService');
            if (!this.Filter) missing.push('FilterService');
            if (!this.Pagination) missing.push('PaginationService');
            if (!this.Report) missing.push('ReportService');
            if (!this.OrdersUI) missing.push('OrdersUI');
            if (!this.ModalUI) missing.push('ModalUI');
            return missing;
        },

        init: function () {
            if (!this.isReady()) {
                console.error('[SalesInsightCenter] Módulos não carregados:', this.getMissingModules());
                return false;
            }
            // console.info('[SalesInsightCenter] Todos os módulos carregados com sucesso'); // Otimização: log irrelevante
            return true;
        }
    };

    // Expor namespace globalmente
    global.SalesInsightCenter = SalesInsightCenter;

})(typeof window !== 'undefined' ? window : this);
