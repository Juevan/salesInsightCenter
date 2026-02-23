/**
 * Módulo de utilitários para o Widget Sales Insight Center
 */
(function (global) {
    'use strict';

    var Utils = {
        /**
         * Normaliza data (DD/MM/YYYY ou YYYY-MM-DD) para YYYY-MM-DD para comparação.
         */
        parseDateToYmd: function (str) {
            if (!str || typeof str !== "string") return null;
            str = str.trim();
            if (str.length === 10 && str.charAt(4) === "-" && str.charAt(7) === "-") return str;
            var parts = str.split(/[/\-.]/);
            if (parts.length >= 3) {
                var d = parseInt(parts[0], 10);
                var m = parseInt(parts[1], 10);
                var y = parseInt(parts[2], 10);
                if (parts[0].length === 4) { y = parseInt(parts[0], 10); m = parseInt(parts[1], 10); d = parseInt(parts[2], 10); }
                if (y > 0 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
                    return y + "-" + ("0" + m).slice(-2) + "-" + ("0" + d).slice(-2);
                }
            }
            return null;
        },

        /**
         * Escapa HTML para exibição segura em células de tabela.
         */
        escapeHtml: function (str) {
            if (str == null) return "";
            str = String(str);
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
        },

        /**
         * Gera link para visualizar a solicitação no portal.
         */
        generatorLinkSolic: function (numSolic) {
            var url = WCMAPI.serverURL;
            var id = String(numSolic || "").replace(/^0+/, '');
            url += '/portal/p/00001/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=' + id;
            return url;
        },

        /**
         * Formata o timestamp de última atualização do cache.
         */
        formatCacheUpdatedAt: function (timestamp) {
            if (!timestamp) return "";
            var d = new Date(timestamp);
            var day = ("0" + d.getDate()).slice(-2);
            var month = ("0" + (d.getMonth() + 1)).slice(-2);
            var year = d.getFullYear();
            var h = ("0" + d.getHours()).slice(-2);
            var m = ("0" + d.getMinutes()).slice(-2);
            return day + "/" + month + "/" + year + " " + h + ":" + m;
        }
    };

    global.PedidoUtils = Utils;

})(typeof window !== 'undefined' ? window : this);
