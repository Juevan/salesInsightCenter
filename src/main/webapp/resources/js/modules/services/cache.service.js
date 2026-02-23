/**
 * Módulo de serviço de Cache para o Widget Sales Insight Center
 */
(function (global) {
    'use strict';

    var CACHE_KEY = "salesInsightCenterCache";
    var CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

    var CacheService = {
        getCache: function () {
            try {
                var raw = localStorage.getItem(CACHE_KEY);
                if (!raw) return null;
                var obj = JSON.parse(raw);
                if (!obj || !obj.columns || !obj.values) return null;
                obj.expiresAt = obj.expiresAt || 0;
                obj.updatedAt = obj.updatedAt || 0;
                return obj;
            } catch (e) {
                return null;
            }
        },

        setCache: function (columns, values) {
            try {
                var now = Date.now();
                var payload = {
                    columns: columns,
                    values: values || [],
                    updatedAt: now,
                    expiresAt: now + CACHE_TTL_MS
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
            } catch (e) { }
        },

        scheduleUpdate: function (callback) {
            var run = function () {
                try {
                    var dataset = PedidoRepository.getOrdersDataset();
                    if (dataset && dataset.columns && dataset.values) {
                        CacheService.setCache(dataset.columns, dataset.values);
                        if (callback) callback();
                    }
                } catch (e) { }
            };
            if (typeof requestIdleCallback !== "undefined") {
                requestIdleCallback(run, { timeout: 2000 });
            } else {
                setTimeout(run, 0);
            }
        },

        /**
         * Verifica se o cache expirou baseando-se em janelas de 15 minutos fixas 
         * (Ex: 08:00, 08:15, 08:30, 08:45).
         */
        isExpired: function (cache) {
            if (!cache || !cache.updatedAt) return true;

            var now = new Date();
            var lastUpdate = new Date(cache.updatedAt);

            // Se o dia mudou, expira.
            if (now.toDateString() !== lastUpdate.toDateString()) return true;

            // Calcula qual seria o próximo slot de atualização após o último update
            // Slots: 0, 15, 30, 45
            var lastMinutes = lastUpdate.getMinutes();
            var currentMinutes = now.getMinutes();

            var lastSlot = Math.floor(lastMinutes / 15);
            var currentSlot = Math.floor(currentMinutes / 15);

            // Hora mudou ou Slot de 15 min mudou
            if (now.getHours() !== lastUpdate.getHours()) return true;
            if (currentSlot > lastSlot) return true;

            return false;
        }
    };

    global.CacheService = CacheService;

})(typeof window !== 'undefined' ? window : this);
