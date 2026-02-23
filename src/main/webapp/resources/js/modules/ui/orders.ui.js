/**
 * Módulo de Interface (UI) para o Widget Sales Insight Center
 */
(function (global) {
    'use strict';

    var OrdersUI = {
        /**
         * Retorna a estrutura HTML de um pill de status.
         */
        getStatusPill: function (statusValue) {
            var s = (statusValue && statusValue.trim) ? statusValue.trim() : '';
            var label, cssClass;
            switch (s) {
                case "CANCELADO": label = "Cancelado"; cssClass = "status-pill--cancelado"; break;
                case "VALIDACAO DE PAGAMENTO": label = "Validação de pagamento"; cssClass = "status-pill--validacao"; break;
                case "AGUARDANDO DISPONIBILIDADE": label = "Aguardando disponibilidade"; cssClass = "status-pill--aguardando"; break;
                case "APROVACAO COMERCIAL": label = "Aprovação comercial"; cssClass = "status-pill--aprovacao"; break;
                case "EM SEPARACAO": label = "Em separação"; cssClass = "status-pill--separacao"; break;
                case "AGUARDANDO FATURAMENTO": label = "Aguardando faturamento"; cssClass = "status-pill--faturamento"; break;
                case "PEDIDO ENVIADO": label = "Pedido enviado"; cssClass = "status-pill--enviado"; break;
                case "ENTREGA REALIZADA": label = "Entrega realizada"; cssClass = "status-pill--entregue"; break;
                case "ANALISE DE CREDITO": label = "Análise de crédito"; cssClass = "status-pill--credito"; break;
                case "REPROVADO": label = "Reprovado"; cssClass = "status-pill--reprovado"; break;
                default: label = "—"; cssClass = "status-pill--default"; break;
            }
            return '<span class="status-pill ' + cssClass + '">' + label + '</span>';
        },

        /**
         * Renderiza a grade de pedidos no corpo do widget.
         */
        renderGrid: function (containerId, columns, uniqueRows) {
            var body = document.getElementById(containerId);
            if (!body) return;

            if (uniqueRows.length === 0) {
                this.showMessage(containerId, "empty", "Nenhum pedido encontrado.");
                return;
            }

            // Mapeamento de colunas para exibição e dimensionamento
            var gridConfig = [
                { key: "STATUS", label: "Status" },
                { key: "SOLICITACAO", label: "Solicitação" },
                { key: "DATA_SOLICITACAO", label: "Data" },
                { key: "CLIENTE", label: "Cliente" },
                { key: "EXECUTIVO", label: "Executivo" },
                { key: "PROCESSO", label: "Processo" }
            ];

            var start = PaginationService.getStart();
            var end = PaginationService.getEnd(uniqueRows.length);

            var parts = ["<table class='table'><tr class='columns-table'>"];
            for (var i = 0; i < gridConfig.length; i++) {
                var col = gridConfig[i];
                var colClass = "col-" + col.key.toLowerCase().replace(/_/g, "-");
                parts.push("<th class='", colClass, "'>", PedidoUtils.escapeHtml(col.label || col.key), "</th>");
            }
            parts.push("</tr>");

            for (var j = start; j < end; j++) {
                var row = uniqueRows[j];
                var rowId = row["SOLICITACAO"] || "";
                parts.push("<tr id='", PedidoUtils.escapeHtml(rowId), "'>");

                for (var k = 0; k < gridConfig.length; k++) {
                    var col = gridConfig[k];
                    var cellVal = row[col.key] != null ? row[col.key] : "";
                    var colClass = "col-" + col.key.toLowerCase().replace(/_/g, "-");

                    if (col.key === "STATUS") {
                        parts.push("<td class='row ", colClass, "'>", OrdersUI.getStatusPill(cellVal), "</td>");
                    } else if (col.key === "SOLICITACAO") {
                        var link = PedidoUtils.generatorLinkSolic(cellVal);
                        parts.push("<td class='row ", colClass, "'><a href='", PedidoUtils.escapeHtml(link), "'>", PedidoUtils.escapeHtml(cellVal), "</a></td>");
                    } else {
                        parts.push("<td class='row ", colClass, "'>", PedidoUtils.escapeHtml(cellVal), "</td>");
                    }
                }
                parts.push("</tr>");
            }
            parts.push("</table>");

            body.setAttribute("aria-busy", "false");
            body.innerHTML = parts.join("");
        },

        /**
         * Exibe uma mensagem no corpo do widget (erro, vazio, carregando).
         */
        showMessage: function (containerId, type, text) {
            var body = document.getElementById(containerId);
            if (!body) return;
            body.setAttribute("aria-busy", "false");
            body.setAttribute("aria-live", "polite");
            var cls = type === "error" ? "body-message body-message--error" :
                type === "loading" ? "body-message body-message--loading" :
                    "body-message body-message--empty";
            body.innerHTML = "<div class='" + cls + "'>" + PedidoUtils.escapeHtml(text) + "</div>";
        },

        /**
         * Atualiza a label de última atualização do cache.
         */
        updateCacheLabel: function (containerId, timestamp) {
            var el = document.getElementById(containerId);
            if (!el) return;
            if (timestamp) {
                el.textContent = "Última atualização: " + PedidoUtils.formatCacheUpdatedAt(timestamp);
                el.style.display = "";
            } else {
                el.style.display = "none";
            }
        },

        /**
         * Popula as opções de um filtro select.
         */
        populateFilterOptions: function (selectId, columns, values, columnName) {
            var sel = document.getElementById(selectId);
            if (!sel || !columns || !values || values.length === 0) return;

            var colKey = columnName || "STATUS";
            var optionsSet = {};
            for (var i = 0; i < values.length; i++) {
                var val = values[i][colKey];
                if (val != null && String(val).trim() !== "") optionsSet[String(val).trim()] = true;
            }
            var optionsList = Object.keys(optionsSet).sort();
            var currentValue = sel.value;

            sel.innerHTML = "<option value=\"\">Todos</option>";
            for (var j = 0; j < optionsList.length; j++) {
                var opt = document.createElement("option");
                opt.value = optionsList[j];
                opt.textContent = optionsList[j];
                if (opt.value === currentValue) opt.selected = true;
                sel.appendChild(opt);
            }
        },

        /**
         * Renderiza os controles de paginação.
         */
        renderPagination: function (containerId, callbacks) {
            var navigation = document.getElementById(containerId);
            if (!navigation) return;

            navigation.innerHTML = "";

            // Voltar
            var listPrev = document.createElement("li");
            var linkPrev = document.createElement("a");
            linkPrev.href = "javascript:void(0)";
            linkPrev.innerHTML = "«";
            listPrev.appendChild(linkPrev);
            listPrev.onclick = function (e) { e.preventDefault(); callbacks.onBack(); };
            navigation.appendChild(listPrev);

            // Páginas (limite de 5)
            var startPage = Math.max(1, PaginationService.currentPage - 2);
            var endPage = Math.min(PaginationService.totalPages, PaginationService.currentPage + 2);

            for (var i = startPage; i <= endPage; i++) {
                (function (pageIndex) {
                    var listPage = document.createElement("li");
                    var linkPage = document.createElement("a");
                    linkPage.href = "javascript:void(0)";
                    linkPage.innerHTML = pageIndex;
                    if (pageIndex === PaginationService.currentPage) listPage.classList.add('active');
                    listPage.appendChild(linkPage);
                    listPage.onclick = function (e) { e.preventDefault(); callbacks.onGoTo(pageIndex); };
                    navigation.appendChild(listPage);
                })(i);
            }

            // Próximo
            var listNext = document.createElement("li");
            var linkNext = document.createElement("a");
            linkNext.href = "javascript:void(0)";
            linkNext.innerHTML = "»";
            listNext.appendChild(linkNext);
            listNext.onclick = function (e) { e.preventDefault(); callbacks.onNext(); };
            navigation.appendChild(listNext);
        }
    };

    global.OrdersUI = OrdersUI;

})(typeof window !== 'undefined' ? window : this);
