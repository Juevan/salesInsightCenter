/**
 * Módulo de Interface (UI) para Modais do Widget Sales Insight Center
 */
(function (global) {
    'use strict';

    var ModalUI = {
        STEPS: [
            "SOLICITACAO",
            "PAGAMENTO VALIDADO",
            "GERACAO DO PEDIDO",
            "SEPARACAO",
            "NOTA FISCAL EMITIDA",
            "ENVIO",
            "ENTREGA"
        ],



        /**
         * Abre o modal de tracking da solicitação.
         */
        openTracking: function (numSolic) {
            var loadingHTML =
                '<div class="text-center fs-v-margin-large">' +
                '<i class="fluigicon fluigicon-loading fluigicon-md"></i>' +
                '<p class="fs-v-margin-small-top">Carregando histórico...</p>' +
                '</div>';

            var modal = FLUIGC.modal({
                title: 'Histórico #' + numSolic,
                content: loadingHTML,
                id: 'fluig-modal-tracking',
                size: 'full'
            });

            var self = this;
            setTimeout(function () {
                try {
                    // 1. Obter dados do pedido (Essencial para o Modal)
                    var dsOrders = CacheService.getCache() || PedidoRepository.getOrdersDataset();
                    var pedidoRow = self._getPedidoRow(dsOrders, numSolic);

                    if (!pedidoRow) {
                        throw new Error("Pedido não encontrado no cache.");
                    }

                    // 2. Tentar obter Timeline (Opcional - Não deve travar o modal)
                    var timelineHTML = "";
                    try {
                        var dsTracking = PedidoRepository.getTrackingDataset(numSolic);
                        self._enrichTrackingData(dsTracking, pedidoRow);
                        timelineHTML = self._generateTimelineHTML(dsTracking, pedidoRow);
                    } catch (errTimeline) {
                        console.error("Erro ao carregar timeline:", errTimeline);
                        timelineHTML = '<div class="alert alert-info" role="alert">' +
                            '<i class="flaticon flaticon-info icon-sm"></i> ' +
                            'Não foi possível carregar o fluxo de etapas no momento.' +
                            '</div>';
                    }

                    // 3. Gerar Dashboard e Itens (Sempre disponíveis via pedidoRow)
                    var dashboardHTML = self._generateDashboardHTML(pedidoRow);
                    var itemsHTML = '';
                    try {
                        var itensJson = (pedidoRow && pedidoRow['ITENS']) ? JSON.parse(pedidoRow['ITENS']) : [];
                        itemsHTML = self._generateItensTableHTML(itensJson);
                    } catch (e) {
                        itemsHTML = '<div class="alert alert-warning" role="alert">Erro ao processar os itens desta solicitação.</div>';
                    }

                    var logoUrl = WCMAPI.serverURL + '/portal/api/servlet/image/00001/custom/logo_image.png';
                    var status = (pedidoRow && pedidoRow.STATUS) ? String(pedidoRow.STATUS).trim() : "-";
                    var total = (pedidoRow && pedidoRow.TOTAL) ? String(pedidoRow.TOTAL).trim() : "-";
                    var qtd = (pedidoRow && pedidoRow.UNIDADE_VENDIDAS) ? String(pedidoRow.UNIDADE_VENDIDAS).trim() : "-";

                    var headerHTML =
                        '<div class="row fs-v-margin-small">' +
                        '<div class="col-sm-4 col-xs-12 fs-v-margin-small-bottom text-center-xs">' +
                        '<img src="' + logoUrl + '" style="max-height: 42px; width: auto;" alt="Logo" class="fs-v-margin-xsmall-top">' +
                        '</div>' +
                        '<div class="col-sm-8 col-xs-12 text-right text-center-xs">' +
                        '<h3 class="fs-no-margin fs-txt-bold">Solicitação #' + numSolic + '</h3>' +
                        '<div class="header-info-badges fs-v-margin-xsmall-top">' +
                        '<span class="fs-txt-bold fs-display-block-xs">Qtd: ' + PedidoUtils.escapeHtml(qtd) + '</span>' +
                        '<span class="fs-txt-bold fs-display-block-xs fs-sm-margin-left">Valor Total: ' + PedidoUtils.escapeHtml(total) + '</span>' +
                        '<span class="label label-info fs-sm-margin-left label-status-header">' + PedidoUtils.escapeHtml(status) + '</span>' +
                        '</div>' +
                        '</div>' +
                        '</div><hr>';

                    var contentHTML = '<div class="modal-tracking-content">' +
                        '<div class="panel panel-primary">' +
                        '<div class="panel-heading">' +
                        '<h3 class="panel-title">' +
                        '<a class="collapse-icon up" data-toggle="collapse" href="#collapse-resumo">' +
                        '<i class="flaticon flaticon-info icon-sm"></i> Resumo do Pedido' +
                        '</a>' +
                        '</h3>' +
                        '</div>' +
                        '<div id="collapse-resumo" class="panel-collapse collapse in">' +
                        '<div class="panel-body">' +
                        headerHTML +
                        dashboardHTML +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="panel panel-default">' +
                        '<div class="panel-heading">' +
                        '<h3 class="panel-title">' +
                        '<a class="collapse-icon" data-toggle="collapse" href="#collapse-etapas">' +
                        '<i class="flaticon flaticon-route-outline icon-sm"></i> Fluxo de Etapas' +
                        '</a>' +
                        '</h3>' +
                        '</div>' +
                        '<div id="collapse-etapas" class="panel-collapse collapse in">' +
                        '<div class="panel-body">' + timelineHTML + '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="panel panel-default">' +
                        '<div class="panel-heading">' +
                        '<h3 class="panel-title">' +
                        '<a class="collapse-icon" data-toggle="collapse" href="#collapse-itens">' +
                        '<i class="flaticon flaticon-box icon-sm"></i> Itens Solicitados' +
                        '</a>' +
                        '</h3>' +
                        '</div>' +
                        '<div id="collapse-itens" class="panel-collapse collapse in">' +
                        '<div class="panel-body">' + itemsHTML + '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';

                    var contentEl = document.querySelector('#fluig-modal-tracking .modal-body') ||
                        document.querySelector('#fluig-modal-tracking [class*="fluig-modal-body"]') ||
                        document.querySelector('#fluig-modal-tracking .fluig-modal-content');
                    if (contentEl) contentEl.innerHTML = contentHTML;
                } catch (e) {
                    console.error("Erro fatal ao abrir modal:", e);
                    var errEl = document.querySelector('#fluig-modal-tracking .modal-body');
                    if (errEl) errEl.innerHTML = '<div class="alert alert-danger" role="alert">' +
                        '<strong>Erro:</strong> Não foi possível carregar os detalhes desta solicitação.</div>';
                }
            }, 0);

            return modal;
        },

        _getPedidoRow: function (dataset, numSolic) {
            if (!dataset || !dataset.values) return null;
            return dataset.values.filter(function (item) { return item.SOLICITACAO === numSolic; })[0] || null;
        },

        _enrichTrackingData: function (dsTracking, pedidoRow) {
            if (!dsTracking.values || !pedidoRow) return;
            dsTracking.values.forEach(function (item) {
                if (item.STEP === "ENVIO              ") {
                    item.DATA = pedidoRow.EXPEDICAO || item.DATA;
                }
                if (item.STEP === "ENTREGA            ") {
                    item.DATA = pedidoRow.ENTREGA || item.DATA;
                }
            });
        },

        _generateTimelineHTML: function (dataset, pedidoRow) {
            var self = this;
            var timelineHTML = '<ul class="steps">';
            var processedSteps = dataset.values.map(function (item) {
                return {
                    step: item.STEP.trim(),
                    date: item.DATA.trim(),
                    time: item.HORA ? item.HORA.trim() : '',
                    responsible: item.RESP ? item.RESP.trim() : ''
                };
            });

            var status = (pedidoRow && pedidoRow.STATUS) ? String(pedidoRow.STATUS).trim().toUpperCase() : "";
            var isCancelled = (status === "CANCELADO" || status === "REPROVADO");

            var currentStepIndex = -1;
            processedSteps.forEach(function (item) {
                var stepIndex = self.STEPS.indexOf(item.step);
                if (stepIndex !== -1) currentStepIndex = Math.max(currentStepIndex, stepIndex);
            });

            this.STEPS.forEach(function (step, index) {
                var stepDetails = processedSteps.find(function (item) { return item.step === step; });

                var stepClass = 'step-item';
                var iconClass = '';

                if (index <= currentStepIndex) {
                    stepClass += ' done';
                    iconClass = 'fa-check';
                } else if (index === currentStepIndex + 1) {
                    if (isCancelled) {
                        stepClass += ' cancelled';
                        iconClass = 'fa-times';
                    } else {
                        stepClass += ' active';
                        iconClass = 'fa-clock-o';
                    }
                } else {
                    stepClass += ' future';
                    iconClass = '';
                }

                var stepLabel = step.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); });

                var detailsHtml = '';
                if (stepDetails) {
                    detailsHtml = '<div class="step-details"><span class="step-date"><i class="fa fa-calendar-alt"></i> ' +
                        PedidoUtils.escapeHtml(stepDetails.date) + (stepDetails.time ? ' ' + PedidoUtils.escapeHtml(stepDetails.time) : '') + '</span>';
                    if (stepDetails.responsible) detailsHtml += '<span class="step-resp"><i class="fa fa-user"></i> ' + PedidoUtils.escapeHtml(stepDetails.responsible) + '</span>';
                    detailsHtml += '</div>';
                }

                var iconHTML = iconClass ? '<i class="fa ' + iconClass + '"></i>' : '';

                timelineHTML += '<li class="' + stepClass + '">' +
                    '<span class="step-bullet">' + iconHTML + '</span>' +
                    '<span class="step-label"><span class="step-name">' + PedidoUtils.escapeHtml(stepLabel) + '</span>' + detailsHtml + '</span></li>';
            });

            return timelineHTML + '</ul>';
        },

        _generateDashboardHTML: function (pedidoRow) {
            if (!pedidoRow) return '<p class="text-muted italic">Dados não disponíveis.</p>';

            var processo = (pedidoRow.PROCESSO || "").trim().toUpperCase();
            var isVendaDireta = (processo === "VENDA DIRETA");
            var isVendaConsignada = (processo === "VENDA CONSIGNADA");

            var fields = [
                { k: 'CLIENTE', l: 'Cliente', size: 12 },
                { k: 'COORDENADOR', l: 'Coordenador', size: 4 },
                { k: 'GERENTE', l: 'Gerente', size: 4 },
                { k: 'EXECUTIVO', l: 'Executivo(a)', size: 4 },
                { k: 'PROCESSO', l: 'Processo', size: 4 },
                { k: 'PEDIDO', l: 'Pedido', size: 4 },
                { k: 'NF', l: 'NF', size: 4 },
                { k: 'CONDICAO_PAGAMENTO', l: 'Condição de Pagamento', size: 6 },
                { k: 'TABELA_PRECOS', l: 'Tabela de Preço', size: 6 },

                // Datas no final
                { k: 'DATA_SOLICITACAO', l: 'Data Solicitação', size: 3 },
                { k: 'EMISSAO', l: 'Emissão', size: 3 },
                { k: 'EXPEDICAO', l: 'Expedição', size: 3 }
            ];

            // Lógica condicional de datas
            if (isVendaDireta) {
                fields.push({ k: 'ENTREGA', l: 'Data Entrega', size: 3 });
            } else if (isVendaConsignada) {
                fields.push({ k: 'CIRURGIA', l: 'Data Cirurgia', size: 3 });
            } else {
                // Caso existam outros processos, mostramos ambos se preenchidos
                fields.push({ k: 'ENTREGA', l: 'Entrega', size: 3 });
                fields.push({ k: 'CIRURGIA', l: 'Cirurgia', size: 3 });
            }

            var html = '<div class="row">';
            fields.forEach(function (f) {
                var val = (pedidoRow[f.k] != null && String(pedidoRow[f.k]).trim() !== '') ? String(pedidoRow[f.k]).trim() : '-';
                var labelClass = (f.k === 'CLIENTE') ? 'fs-txt-bold text-primary' : 'fs-txt-bold';

                html += '<div class="col-md-' + f.size + ' col-sm-6 fs-v-margin-xsmall">' +
                    '<label class="' + labelClass + '">' + PedidoUtils.escapeHtml(f.l) + '</label>' +
                    '<p class="form-control-static">' + PedidoUtils.escapeHtml(val) + '</p>' +
                    '</div>';
            });
            html += '</div>';
            return html;
        },

        _generateItensTableHTML: function (itensArray) {
            if (!itensArray || itensArray.length === 0) {
                return '<p class="text-muted italic">Nenhum item encontrado para esta solicitação.</p>';
            }
            var cols = ['ITEM', 'PROD', 'DESCPROD', 'OPERACAO', 'QUANT', 'VLR_ITEM', 'TOT_ITEM'];
            var labels = { ITEM: 'Item', PROD: 'Produto', DESCPROD: 'Descrição', OPERACAO: 'Operação', QUANT: 'Qtd', VLR_ITEM: 'Valor Unit.', TOT_ITEM: 'Total' };

            var html = '<div class="table-responsive"><table class="table table-striped table-bordered table-condensed"><thead><tr>';
            cols.forEach(function (c) { html += '<th class="fs-txt-bold">' + labels[c] + '</th>'; });
            html += '</tr></thead><tbody>';
            itensArray.forEach(function (row) {
                html += '<tr>';
                cols.forEach(function (c) {
                    var val = row[c] != null ? String(row[c]).trim() : '';
                    html += '<td>' + PedidoUtils.escapeHtml(val) + '</td>';
                });
                html += '</tr>';
            });
            return html + '</tbody></table></div>';
        }
    };

    global.ModalUI = ModalUI;

})(typeof window !== 'undefined' ? window : this);
