<div id="SalesInsightWidget_${instanceId}" class="super-widget wcm-widget-class fluig-style-guide"
  data-params="SalesInsightWidget.instance()">


  <div class="panel">
    <div id="salesInsightCenterWidgetWrap" class="panel panel-primary" style="position: relative;">
      <div class="panel-heading" id="title">Painel de Vendas</div>

      <div class="search-bar">
        <div class="search-bar-field">
          <label for="searchSolicitacao" class="sr-only">Buscar</label>
          <div class="input-group">
            <input type="text" id="searchSolicitacao" class="form-control" placeholder="Solicitação, pedido, NF ou cliente..." maxlength="100" />
            <span class="input-group-btn">
              <button type="button" id="bttn_buscar" class="btn btn-primary btn-icon" title="Buscar">
                <i class="fa fa-search"></i>
              </button>
            </span>
          </div>
        </div>
        <div class="search-bar-actions">
          <button type="button" id="bttn_filtros" class="btn btn-default btn-icon" title="Filtros"><i class="fa fa-filter"></i></button>
          <button type="button" id="bttn_limpar" class="btn btn-default btn-icon" title="Limpar"><i class="fa fa-eraser"></i></button>
          <button type="button" id="bttn_download" class="btn btn-default btn-icon" title="Download"><i class="fa fa-download"></i></button>
        </div>
      </div>
      <div class="filter-panel" id="filterPanel" style="display: none;">
        <div class="filter-panel-row">
          <div class="filter-group">
            <label for="filterProcesso">Processo</label>
            <select id="filterProcesso" class="form-control">
              <option value="">Todos</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="filterStatus">Status</label>
            <select id="filterStatus" class="form-control">
              <option value="">Todos</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="filterDateFrom">Data de</label>
            <input type="date" id="filterDateFrom" class="form-control" />
          </div>
          <div class="filter-group">
            <label for="filterDateTo">Data até</label>
            <input type="date" id="filterDateTo" class="form-control" />
          </div>
        </div>
      </div>
      <div class="cache-info" id="cacheLastUpdateWrap" aria-live="polite"></div>

      <div class="panel-body" id="datasetBody" role="region" aria-label="Tabela de pedidos">

      </div>

      <div class="divPagination">
        <ul class="pages" id="paginationControls">
        </ul>
      </div>

    </div>
  </div>

  <script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</div>