# Sales Insight Center Widget

O **Sales Insight Center** é um widget para a plataforma Fluig desenvolvido para fornecer uma visão centralizada e inteligente sobre o status das solicitações de vendas, pedidos e o rastreamento logístico (tracking).

## 🚀 Funcionalidades Principais

- **Painel de Vendas**: Visualização rápida das solicitações em andamento com status atualizado.
- **Filtros Avançados**: Busca por texto (Solicitação, Pedido, NF, Cliente ou Executivo), filtro por Processo, Status e Intervalo de Datas.
- **Histórico de Tracking**: Modal detalhado com a linha do tempo das etapas do pedido (Solicitação, Pagamento, Produção, Entrega, etc.).
- **Sistema de Cache Inteligente**: Carregamento otimizado com expiração fixa a cada 15 minutos (00, 15, 30, 45) para garantir performance e dados sincronizados.
- **Relatórios**: Geração de relatórios em Excel diretamente da visualização atual.
- **Interface Premium**: Design limpo e responsivo utilizando o Fluig Style Guide e CSS modular.

## 📁 Estrutura do Projeto

O projeto segue uma arquitetura modular para facilitar a manutenção:

```text
salesInsightCenter/
├── src/main/resources/
│   ├── view.ftl                # Template principal do widget
│   └── edit.ftl                # Template de edição do widget
└── src/main/webapp/resources/
    ├── css/
    │   └── modules/            # CSS dividido por responsabilidade (table, modal, filters)
    └── js/
        ├── modules/
        │   ├── api/            # Comunicação com datasets (PedidoRepository)
        │   ├── services/       # Lógica de negócio (Cache, Filter, Pagination, Report)
        │   └── ui/             # Manipulação de DOM (OrdersUI, ModalUI)
        ├── salesInsightCenter.main.js  # Lógica principal do widget (SuperWidget)
        └── salesInsightCenter.index.js # Inicialização e carga de módulos
```

## 🛠️ Tecnologias Utilizadas

- **Fluig Style Guide**: Padronização visual e componentes UI.
- **Vanilla JavaScript (ES5/ES6)**: Lógica de front-end sem dependências pesadas.
- **Modular CSS**: Estilização escalável e organizada.
- **XLSX.js**: Biblioteca para geração de relatórios Excel no client-side.
- **Dataset Factory (Fluig)**: Integração com dados do Protheus e processos Fluig.

## ⚙️ Configuração de Cache

O widget utiliza `localStorage` para persistir os resultados do dataset `ds_consulta_pedidos`. A expiração ocorre automaticamente em janelas de 15 minutos sincronizadas com o relógio:
- 00:00, 00:15, 00:30, 00:45 ...

Se o usuário acessar o painel e os dados em cache forem de um "slot" de tempo anterior, uma nova requisição é feita em segundo plano para atualizar as informações sem bloquear a interface.

---
*Desenvolvido para POLLUX - Insight de Vendas e Logística.*
