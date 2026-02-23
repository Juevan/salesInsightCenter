function defineStructure() {
    addColumn("SOLICITACAO");
    addColumn("CLIENTE");
    addColumn("COORDENADOR");
    addColumn("GERENTE");
    addColumn("EXECUTIVO");
    addColumn("CONDICAO_PAGAMENTO");
    addColumn("TABELA_PRECOS");
    addColumn("UNIDADE_VENDIDAS");
    addColumn("PROCESSO");
    addColumn("CIRURGIA");
    addColumn("PEDIDO");
    addColumn("NF");
    addColumn("DATA_SOLICITACAO");
    addColumn("EMISSAO");
    addColumn("EXPEDICAO");
    addColumn("ENTREGA");
    addColumn("TOTAL");
    addColumn("DESCONTO");
    addColumn("STATUS");
    addColumn("ITENS");
    setKey(["SOLICITACAO"]);
}

function onSync(lastSyncDate) {
    log.info('####### SINCRONIZANDO PEDIDOS ######')
    var dataset = DatasetBuilder.newDataset();

    dataset.addColumn("SOLICITACAO");
    dataset.addColumn("CLIENTE");
    dataset.addColumn("COORDENADOR");
    dataset.addColumn("GERENTE");
    dataset.addColumn("EXECUTIVO");
    dataset.addColumn("CONDICAO_PAGAMENTO");
    dataset.addColumn("TABELA_PRECOS");
    dataset.addColumn("UNIDADE_VENDIDAS");
    dataset.addColumn("PROCESSO");
    dataset.addColumn("CIRURGIA");
    dataset.addColumn("PEDIDO");
    dataset.addColumn("NF");
    dataset.addColumn("DATA_SOLICITACAO");
    dataset.addColumn("EMISSAO");
    dataset.addColumn("EXPEDICAO");
    dataset.addColumn("ENTREGA");
    dataset.addColumn("TOTAL");
    dataset.addColumn("DESCONTO");
    dataset.addColumn("STATUS");
    dataset.addColumn("ITENS");

    var clientService = fluigAPI.getAuthorizeClientService();

    var data = {
        companyId: getValue('WKCompany') + '',
        serviceCode: 'ProtheusAPI',
        endpoint: 'POLW010?CUSRFLUIG=',
        method: 'get',
        timeoutService: '200',
    };
    try {
        var vo = clientService.invoke(JSON.stringify(data));
    } catch (err) {
        log.error('####### Erro na requisição: [' + err.message + '] ######')
        throw err.message;
    }

    if (vo.getResult() == null || vo.getResult().isEmpty()) throw "Nenhum item retornado do Protheus.";

    var json = JSON.parse(vo.getResult());
    var pedidosAgrupados = agruparPedidos(json)
    var itensNovos = {};

    log.info('####### Pedidos agrupados: [' + pedidosAgrupados.length + '] ######')
    pedidosAgrupados.forEach(function (item) {
        itensNovos[item.SOLIC] = true;
        dataset.addOrUpdateRow([
            item.SOLIC,
            item.CLI,
            item.COORD,
            item.GEREN,
            item.REPRES,
            item.COND,
            item.TAB,
            item.UNID,
            item.PROCESSO,
            item.CIRURGIA,
            item.PED,
            item.NF,
            item.DATA,
            item.EMISSAO,
            item.EXP,
            item.ENTR,
            item.VLR_VENDA,
            item.VLR_DESC,
            item.STATUS,
            JSON.stringify(item.ITENS)
        ]);
    })

    var olderDataset = DatasetFactory.getDataset("ds_consulta_pedidos", null, null, null);

    if (olderDataset && olderDataset.rowsCount > 0) {
        log.info('####### Verificando itens para deletar: [' + olderDataset.rowsCount + '] ######')
        for (var index = 0; index < olderDataset.rowsCount; index++) {
            var SOLICITACAO = olderDataset.getValue(index, "SOLICITACAO").trim();
            if (!itensNovos[SOLICITACAO]) {
                dataset.deleteRow([SOLICITACAO]); // só deleta se não existir mais no novo
            }
        }
    }

    return dataset;


}

function onMobileSync(user) {
    // todos os campos definidos na estrutura
    var fields = ["SOLICITACAO", "CLIENTE", "COORDENADOR", "GERENTE", "EXECUTIVO", "CONDICAO_PAGAMENTO", "TABELA_PRECOS", "UNIDADE_VENDIDAS", "PROCESSO", "CIRURGIA", "PEDIDO", "NF", "DATA_SOLICITACAO", "EMISSAO", "EXPEDICAO", "ENTREGA", "TOTAL", "DESCONTO", "STATUS", "ITENS"];
    var constraints = [];      // sem restrições adicionais
    var sortingFields = [];    // sem ordenação específica

    return {
        fields: fields,
        constraints: constraints,
        sortingFields: sortingFields
    };
}

function agruparPedidos(jsonOriginal) {
    const registros = jsonOriginal.POLW010;

    const agrupado = {};

    registros.forEach(linha => {
        const solic = linha.SOLIC;

        if (!agrupado[solic]) {
            agrupado[solic] = {
                SOLIC: solic,
                CLI: normalizeString(linha.CLI),
                COORD: normalizeString(linha.COORD),
                GEREN: normalizeString(linha.GEREN),
                STATUS: normalizeString(linha.STATUS),
                ENTR: linha.ENTR,
                VLR_VENDA: linha.VLR_VENDA,
                VLR_DESC: linha.VLR_DESC,
                UNID: linha.UNID,
                PROCESSO: normalizeString(linha.PROCESSO),
                CIRURGIA: linha.CIRURGIA,
                PED: linha.PED,
                EMISSAO: linha.EMISSAO,
                TAB: normalizeString(linha.TAB),
                COND: normalizeString(linha.COND),
                DATA: linha.DATA,
                NF: linha.NF,
                REPRES: normalizeString(linha.REPRES),
                EXP: linha.EXP,
                ITENS: []
            };
        }

        // Adiciona o item no array de itens
        agrupado[solic].ITENS.push({
            ITEM: (agrupado[solic].ITENS.length + 1).toString(),
            PROD: linha.PROD,
            DESCPROD: normalizeString(linha.DESCPROD),
            OPERACAO: normalizeString(linha.OPERACAO) == "BONIFICAO" ? "BONIFICAÇÃO" : normalizeString(linha.OPERACAO),
            QUANT: linha.QUANT,
            VLR_ITEM: linha.VLR_ITEM,
            TOT_ITEM: linha.TOT_ITEM
        });
    });

    return Object.values(agrupado);
}

function obterParametro(constraints, campo) {
    var valor = "";
    if ((constraints != null) && (constraints.length > 0)) {
        constraints.forEach(function (con) {
            if (con.getFieldName().trim().toUpperCase() == campo.trim().toUpperCase()) {
                valor = con.getInitialValue();
                return false; // Sai do loop forEach
            }
        });
    }
    return valor;
}

function normalizeString(str) {
    if (!str) return "";
    str = String(str);
    str = str.trim().replace(/\s+/g, " ");
    str = str.replace(/[\u0000-\u001F\u007F]/g, "");
    str = str.replace(/[?]/g, "");
    try {
        str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    } catch (e) {
        var mapAcentos = {
            'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
            'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
            'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
            'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
            'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
            'ç': 'c', 'ñ': 'n'
        };
        str = str.replace(/[\s\S]/g, function (c) { return mapAcentos[c] || c; });
    }
    str = str.replace(/[^\x20-\x7EÀ-ÿ]/g, "");
    return str;
}