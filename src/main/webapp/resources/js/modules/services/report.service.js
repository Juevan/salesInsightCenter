/**
 * Módulo de serviço de Relatórios para o Widget Sales Insight Center
 */
(function (global) {
    'use strict';

    var ReportService = {
        /**
         * Gera o relatório Excel baseado nos dados atuais e filtros.
         */
        generateExcel: function (columns, filteredValues) {
            var orderColumns = [
                "SOLICITACAO", "PEDIDO", "CLIENTE", "NF", "FORMA PAGAMENTO",
                "TABELA PRECO", "QUANT", "BONIF", "DESCONTO", "TOTAL",
                "EXECUTIVO(A)", "DATA", "EMISSAO", "EXPEDICAO", "ENTREGA", "STATUS"
            ];

            try {
                if (typeof XLSX === "undefined") {
                    throw new Error("Biblioteca XLSX não carregada.");
                }

                var worksheet = XLSX.utils.json_to_sheet(filteredValues, { header: orderColumns });
                var workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Insight de Vendas");
                XLSX.writeFile(workbook, "sales_insight_report.xlsx");
            } catch (e) {
                console.error("[ReportService] Erro ao gerar Excel:", e);
                // Fallback ou notificação poderia vir aqui
            }
        }
    };

    global.ReportService = ReportService;

})(typeof window !== 'undefined' ? window : this);
