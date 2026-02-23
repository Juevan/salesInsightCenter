/**
 * Módulo de repositório (API) para o Widget Sales Insight Center
 */
(function (global) {
    'use strict';

    var Repository = {
        /**
         * Retorna constraints padrões para os datasets de pedidos.
         */
        getDatasetConstraints: function () {
            var user = WCMAPI.userCode;
            if (user === "admin") {
                user = "POLLUX";
            }
            return [DatasetFactory.createConstraint("EXECUTIVO", user, user, ConstraintType.MUST)];
        },

        /**
         * Busca o dataset de pedidos.
         */
        getOrdersDataset: function () {
            try {
                return DatasetFactory.getDataset("ds_consulta_pedidos", null, this.getDatasetConstraints(), null);
            } catch (e) {
                console.error("[PedidoRepository] Erro ao buscar dataset de pedidos:", e);
                throw e;
            }
        },

        /**
         * Busca o dataset de tracking de uma solicitação.
         */
        getTrackingDataset: function (numSolic) {
            try {
                var c1 = DatasetFactory.createConstraint('numSolic', numSolic, numSolic, ConstraintType.MUST);
                return DatasetFactory.getDataset("ds_tracking_pedidos", null, [c1], null);
            } catch (e) {
                console.error("[PedidoRepository] Erro ao buscar dataset de tracking:", e);
                throw e;
            }
        }
    };

    global.PedidoRepository = Repository;

})(typeof window !== 'undefined' ? window : this);
