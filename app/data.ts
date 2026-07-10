export const slides = [
  {
    eyebrow: "ONBOARDING", title: "BEM-VINDO À GADS", kind: "welcome",
    subtitle: "O ponto de partida para transformar posicionamento, geração de demanda, atendimento e vendas em uma operação de crescimento mais previsível.",
    cards: [
      ["Especialistas", "em marketing e vendas"],
      ["Estratégia", "marketing, posicionamento e processo comercial trabalhando juntos"],
      ["Crescimento", "decisões baseadas em dados, acompanhamento e melhoria contínua"],
    ],
  },
  {
    eyebrow: "VISÃO GERAL", title: "O QUE VAI ACONTECER AGORA", kind: "columns",
    columns: [
      ["PRIMEIROS DIAS", "Reunião de onboarding", "Coleta de acessos", "Diagnóstico inicial", "Alinhamento da operação", "Definição das prioridades"],
      ["FASE DE CONSTRUÇÃO", "Otimização do Perfil da Empresa no Google", "Estratégias de mídias", "Estruturação das campanhas", "Configuração de rastreamento", "Preparação das ações comerciais"],
      ["FASE DE OPERAÇÃO", "Campanhas no ar", "Entrada de oportunidades", "Monitoramento", "Análise de dados", "Otimizações contínuas"],
    ],
  },
  {
    eyebrow: "NOSSA METODOLOGIA", title: "COMO FUNCIONA O CRESCIMENTO", kind: "phases",
    cards: [
      ["01 • CONSTRUIR", "Estruturamos ativos, acessos, campanhas, posicionamento e rastreamento para iniciar com uma base sólida."],
      ["02 • OTIMIZAR", "Analisamos dados, palavras-chave, anúncios, atendimento e conversão para melhorar a eficiência."],
      ["03 • ESCALAR", "Com dados suficientes e uma operação validada, buscamos mais volume, eficiência e previsibilidade."],
    ],
    quote: "ANTES DE ACELERAR, PRECISAMOS CONSTRUIR UMA OPERAÇÃO QUE POSSA SER MEDIDA, ANALISADA E MELHORADA.",
  },
  {
    eyebrow: "RESPONSABILIDADES", title: "O QUE DEPENDE DA GADS", kind: "list",
    items: ["Estratégia de marketing", "Google Ads", "Perfil da Empresa no Google", "Posicionamento orgânico", "Landing pages, quando previstas", "Monitoramento e relatórios", "Otimizações", "Análise de dados"],
    footer: "Nossa responsabilidade é estruturar, acompanhar, medir e melhorar continuamente a operação para aumentar as oportunidades comerciais da loja.",
  },
  {
    eyebrow: "RESPONSABILIDADES", title: "O QUE DEPENDE DA SUA EMPRESA", kind: "list",
    items: ["Velocidade no atendimento", "Qualidade da abordagem comercial", "Follow-up dos orçamentos", "Registro correto das oportunidades", "Retorno das informações para a GADS", "Envio de fotos, vídeos e materiais", "Atualização de preços e promoções", "Conversão dos orçamentos", "Avaliações no Google", "Recompra e relacionamento"],
    footer: "A estratégia gera oportunidades. O crescimento acontece quando marketing e vendas trabalham juntos para transformar interesse em orçamento e orçamento em venda.",
  },
  {
    eyebrow: "PROCESSO COMERCIAL", title: "O ERRO QUE FAZ SUA EMPRESA PERDER VENDAS", kind: "comparison",
    columns: [
      ["EMPRESA A • ATENDIMENTO RÁPIDO", "Lead recebido", "Resposta rápida", "Diagnóstico da necessidade", "Orçamento", "Follow-up", "Maior chance de conversão"],
      ["EMPRESA B • SEM PROCESSO", "Lead recebido", "Resposta demorada", "Atendimento genérico", "Orçamento sem acompanhamento", "Cliente compra no concorrente"],
    ],
    quote: "MESMO INVESTIMENTO. EXECUÇÃO DIFERENTE. RESULTADO DIFERENTE.",
  },
  {
    eyebrow: "INDICADORES", title: "COMO MEDIREMOS O SUCESSO", kind: "metrics",
    subtitle: "Não vamos olhar apenas faturamento. Acompanharemos os indicadores que mostram a evolução da operação.",
    items: ["Leads gerados", "Custo por lead", "Taxa de conversão", "Tempo médio de resposta", "Orçamentos enviados", "Vendas originadas", "Ticket médio", "Taxa de follow-up", "Contatos pelo Google", "Posicionamento local"],
  },
  {
    eyebrow: "GESTÃO", title: "NOSSA ROTINA DE ACOMPANHAMENTO", kind: "routine",
    cards: [
      ["ACOMPANHAMENTO", "Monitoramento das campanhas e dos principais indicadores."],
      ["OTIMIZAÇÕES", "Ajustes estratégicos baseados nos dados coletados."],
      ["RELATÓRIOS", "Apresentação clara da evolução dos principais indicadores."],
      ["REUNIÕES", "Análise dos resultados, gargalos e próximos passos."],
    ],
    footer: "A operação é acompanhada continuamente para identificar oportunidades, corrigir gargalos e direcionar os próximos movimentos.",
  },
  {
    eyebrow: "PLANO INICIAL", title: "JORNADA DOS PRIMEIROS 90 DIAS", kind: "phases",
    cards: [
      ["MÊS 1 • ESTRUTURAR", "Organizar acessos, otimizar perfil, campanhas, posicionamento, rastreamento e processos necessários."],
      ["MÊS 2 • OTIMIZAR", "Analisar dados reais e ajustar campanhas, públicos, criativos, atendimento e processo comercial."],
      ["MÊS 3 • EVOLUIR", "Identificar oportunidades, aumentar eficiência e definir os próximos movimentos com base nos dados."],
    ],
    quote: "A EVOLUÇÃO DEPENDE DOS DADOS COLETADOS E DA MATURIDADE DA OPERAÇÃO — NÃO É UMA GARANTIA AUTOMÁTICA.",
  },
  {
    eyebrow: "ALINHAMENTO FINAL", title: "COMPROMISSO ENTRE AS PARTES", kind: "commitment",
    cards: [
      ["A GADS NÃO ENTREGA APENAS ANÚNCIOS.", "Trabalhamos marketing, posicionamento, dados e processo comercial."],
      ["A EMPRESA NÃO CONTRATA APENAS CAMPANHAS.", "Está construindo uma operação de crescimento com acompanhamento estratégico."],
    ],
    quote: "MARKETING GERA OPORTUNIDADES. ATENDIMENTO TRANSFORMA OPORTUNIDADES EM VENDAS. GESTÃO TRANSFORMA RESULTADOS EM CRESCIMENTO.",
  },
] as const;

export const journey = [
  ["Onboarding", "Boas-vindas e alinhamento"], ["Construção", "Acessos, estrutura e campanhas"],
  ["Operação", "Campanhas e oportunidades"], ["Otimização", "Dados, ajustes e melhorias"],
  ["Crescimento", "Evolução e próximos movimentos"],
];

export const companyFields = [
  ["storeName", "Nome da empresa", true], ["cnpj", "CNPJ", true], ["city", "Cidade / UF", true], ["region", "Região de atuação"], ["units", "Número de unidades"], ["owner", "Nome do responsável", true], ["phone", "WhatsApp do responsável", true], ["email", "E-mail do responsável", true], ["meetingDate", "Data da reunião de onboarding"], ["gadsOwner", "Responsável GADS pelo projeto"], ["commercialPhone", "Número comercial que receberá os leads", true], ["commercialEmail", "E-mail comercial"], ["site", "Site atual"], ["instagram", "Instagram"], ["notes", "Observações da reunião", false, "textarea"],
] as const;

export const commercialFields = [
  ["products", "Principais produtos vendidos"], ["brands", "Marcas comercializadas"], ["priorityAudience", "Público prioritário"], ["priorityRegion", "Região prioritária"], ["averageTicket", "Ticket médio aproximado"], ["differentials", "Diferenciais da loja"], ["competitors", "Principais concorrentes"], ["challenges", "Principais dificuldades comerciais"], ["goal", "Meta ou objetivo principal do projeto"],
] as const;

export const audiences = ["Consumidor final", "Pintores", "Arquitetos", "Construtoras", "Condomínios", "Empresas", "Outros"];
export const assets = ["Perfil da Empresa no Google", "Google Ads", "Página do Facebook", "Instagram", "WhatsApp comercial"];
export const statuses = ["Pendente", "Solicitado", "Recebido", "Sem acesso", "Não se aplica"];
