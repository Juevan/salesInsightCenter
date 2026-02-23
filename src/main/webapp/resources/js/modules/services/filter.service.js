/**
 * Módulo de serviço de Filtros para o Widget Consulta Pedidos
 */
(function (global) {
    'use strict';

    var FilterService = {
        /**
         * Aplica filtros de busca, status e data aos dados do dataset.
         */
        applyFilters: function (columns, values, criteria) {
            var filteredValues = values || [];

            // Processo
            if (criteria.filterProcesso) {
                var valProcesso = criteria.filterProcesso;
                filteredValues = filteredValues.filter(function (row) {
                    var pr = String(row["PROCESSO"] != null ? row["PROCESSO"] : "").trim();
                    return pr === valProcesso;
                });
            }

            // Busca textual
            if (criteria.searchText) {
                var searchUpper = criteria.searchText.toUpperCase();
                filteredValues = filteredValues.filter(function (row) {
                    var solic = String(row["SOLICITACAO"] != null ? row["SOLICITACAO"] : "").trim().toUpperCase();
                    var pedido = String(row["PEDIDO"] != null ? row["PEDIDO"] : "").trim().toUpperCase();
                    var nf = String(row["NF"] != null ? row["NF"] : "").trim().toUpperCase();
                    var cliente = String(row["CLIENTE"] != null ? row["CLIENTE"] : "").trim().toUpperCase();
                    var executivo = String(row["EXECUTIVO"] != null ? row["EXECUTIVO"] : "").trim().toUpperCase();
                    return solic.indexOf(searchUpper) !== -1 ||
                        pedido.indexOf(searchUpper) !== -1 ||
                        nf.indexOf(searchUpper) !== -1 ||
                        cliente.indexOf(searchUpper) !== -1 ||
                        executivo.indexOf(searchUpper) !== -1;
                });
            }

            // Status
            if (criteria.filterStatus) {
                var valStatus = criteria.filterStatus;
                filteredValues = filteredValues.filter(function (row) {
                    var st = String(row["STATUS"] != null ? row["STATUS"] : "").trim();
                    return st === valStatus;
                });
            }

            // Intervalo de Datas
            if (criteria.dateFrom || criteria.dateTo) {
                filteredValues = filteredValues.filter(function (row) {
                    var rowYmd = PedidoUtils.parseDateToYmd(row["DATA_SOLICITACAO"]);
                    if (!rowYmd) return false;
                    if (criteria.dateFrom && rowYmd < criteria.dateFrom) return false;
                    if (criteria.dateTo && rowYmd > criteria.dateTo) return false;
                    return true;
                });
            }

            // Unificar por solicitação
            var seen = {};
            var uniqueRows = [];
            for (var r = 0; r < filteredValues.length; r++) {
                var sid = filteredValues[r]["SOLICITACAO"];
                if (sid != null && !seen[sid]) {
                    seen[sid] = true;
                    uniqueRows.push(filteredValues[r]);
                }
            }

            return uniqueRows;
        }
    };

    global.FilterService = FilterService;

})(typeof window !== 'undefined' ? window : this);
