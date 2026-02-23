/**
 * Módulo de serviço de Paginação para o Widget Sales Insight Center
 */
(function (global) {
    'use strict';

    var PaginationService = {
        currentPage: 1,
        limitPerPage: 10,
        totalPages: 0,

        init: function (totalRows, currentPage) {
            this.totalPages = Math.ceil(totalRows / this.limitPerPage);
            this.currentPage = currentPage || 1;
        },

        getStart: function () {
            return (this.currentPage - 1) * this.limitPerPage;
        },

        getEnd: function (totalRows) {
            var end = this.getStart() + this.limitPerPage;
            return end > totalRows ? totalRows : end;
        },

        hasNext: function () {
            return this.currentPage < this.totalPages;
        },

        hasPrevious: function () {
            return this.currentPage > 1;
        },

        nextPage: function () {
            if (this.hasNext()) {
                this.currentPage++;
                return true;
            }
            return false;
        },

        previousPage: function () {
            if (this.hasPrevious()) {
                this.currentPage--;
                return true;
            }
            return false;
        },

        goToPage: function (page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                return true;
            }
            return false;
        }
    };

    global.PaginationService = PaginationService;

})(typeof window !== 'undefined' ? window : this);
