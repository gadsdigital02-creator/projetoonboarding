const CONFIG = {
  CLIENTS_FOLDER_ID: "1bShH7AtL8TU173BvMtkWWmAq3zSv9Bw6",
  TOKEN: "gads-8f2c7e51-4c9b-47fb-a8de-63f4e0e1a942",
};

function doGet() {
  return json_({ ok: true, service: "GADS Onboarding" });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    if (payload.token !== CONFIG.TOKEN) throw new Error("Token inválido.");

    const storeName = sanitizeName_(payload.session?.company?.storeName);
    if (!storeName) throw new Error("Nome da loja não informado.");

    const clientsFolder = DriveApp.getFolderById(CONFIG.CLIENTS_FOLDER_ID);
    const existing = clientsFolder.getFoldersByName(storeName);
    const clientFolder = existing.hasNext() ? existing.next() : clientsFolder.createFolder(storeName);

    const summary = {
      savedAt: new Date().toISOString(),
      folderId: clientFolder.getId(),
      ...payload.session,
    };
    ["onboarding.json", "DADOS DO ONBOARDING.json"].forEach(function(fileName) {
      const files = clientFolder.getFilesByName(fileName);
      while (files.hasNext()) files.next().setTrashed(true);
    });
    clientFolder.createFile("DADOS DO ONBOARDING.json", JSON.stringify(toPortuguese_(summary), null, 2), MimeType.PLAIN_TEXT);
    createResumoHtml_(clientFolder, summary);

    return json_({ ok: true, folderId: clientFolder.getId(), folderUrl: clientFolder.getUrl() });
  } catch (error) {
    return json_({ ok: false, error: String(error.message || error) });
  }
}

function sanitizeName_(value) {
  return String(value || "").trim().replace(/[\\/:*?"<>|#%{}]/g, "-").substring(0, 120);
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function createResumoDoc_(folder, data) {
  const name = "RESUMO DO ONBOARDING - " + sanitizeName_(data.company.storeName);
  const oldDocs = folder.getFilesByName(name);
  while (oldDocs.hasNext()) oldDocs.next().setTrashed(true);

  const doc = DocumentApp.create(name);
  const body = doc.getBody();
  body.clear();
  body.setMarginTop(36).setMarginBottom(36).setMarginLeft(42).setMarginRight(42);

  const title = body.appendParagraph("GADS | ONBOARDING DE CLIENTE");
  title.setHeading(DocumentApp.ParagraphHeading.TITLE);
  title.editAsText().setForegroundColor("#FF4D00");
  body.appendParagraph(data.company.storeName || "Cliente").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph("Resumo gerado em " + formatDate_(data.savedAt)).editAsText().setForegroundColor("#777777");
  body.appendHorizontalRule();

  appendSection_(body, "DADOS DA EMPRESA", data.company, {
    storeName:"Nome da loja", cnpj:"CNPJ", city:"Cidade / UF", region:"Região de atuação", units:"Número de unidades",
    owner:"Responsável da loja", phone:"WhatsApp do responsável", email:"E-mail do responsável", meetingDate:"Data da reunião",
    gadsOwner:"Responsável GADS", commercialPhone:"WhatsApp comercial", commercialEmail:"E-mail comercial",
    site:"Site", instagram:"Instagram", notes:"Observações da reunião"
  });

  appendSection_(body, "INFORMAÇÕES COMERCIAIS", data.commercial || {}, {
    products:"Principais produtos vendidos", brands:"Marcas comercializadas", priorityAudience:"Público prioritário",
    priorityRegion:"Região prioritária", averageTicket:"Ticket médio aproximado", differentials:"Diferenciais da loja",
    competitors:"Principais concorrentes", challenges:"Principais dificuldades comerciais", goal:"Objetivo principal do projeto"
  });

  const audienceTitle = body.appendParagraph("PÚBLICOS ATENDIDOS");
  audienceTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  audienceTitle.editAsText().setForegroundColor("#FF4D00");
  body.appendParagraph((data.audiences || []).length ? data.audiences.join(" • ") : "Não informado");

  const accessTitle = body.appendParagraph("ACESSOS E ATIVOS");
  accessTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  accessTitle.editAsText().setForegroundColor("#FF4D00");
  const accessRows = [["Ativo", "Status", "E-mail ou ID", "Observação"]];
  Object.keys(data.access || {}).forEach(function(asset) {
    const item = data.access[asset] || {};
    accessRows.push([asset, item.status || "Pendente", item.id || "—", item.note || "—"]);
  });
  const table = body.appendTable(accessRows);
  for (let c = 0; c < table.getRow(0).getNumCells(); c++) {
    table.getRow(0).getCell(c).setBackgroundColor("#202020");
    table.getRow(0).getCell(c).editAsText().setBold(true).setForegroundColor("#FFFFFF");
  }
  for (let r = 1; r < table.getNumRows(); r++) {
    const status = table.getRow(r).getCell(1).getText();
    if (status === "Recebido") table.getRow(r).getCell(1).setBackgroundColor("#D9EAD3");
    if (status === "Pendente" || status === "Solicitado") table.getRow(r).getCell(1).setBackgroundColor("#FCE5CD");
  }

  const received = Object.keys(data.access || {}).filter(function(key) { return ["Recebido", "Não se aplica"].indexOf(data.access[key].status) >= 0; }).length;
  const receivedText = body.appendParagraph("ACESSOS RECEBIDOS: " + received + " DE " + Object.keys(data.access || {}).length);
  receivedText.editAsText().setBold(true).setForegroundColor("#FF4D00");
  body.appendHorizontalRule();
  body.appendParagraph("GADS Assessoria e Negócios Digitais • Documento gerado automaticamente pela apresentação de onboarding.").editAsText().setForegroundColor("#777777").setFontSize(9);
  doc.saveAndClose();
  DriveApp.getFileById(doc.getId()).moveTo(folder);
}

function appendSection_(body, title, values, labels) {
  const heading = body.appendParagraph(title);
  heading.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  heading.editAsText().setForegroundColor("#FF4D00");
  const rows = [];
  Object.keys(labels).forEach(function(key) { if (values[key]) rows.push([labels[key], String(values[key])]); });
  if (!rows.length) { body.appendParagraph("Não informado"); return; }
  const table = body.appendTable(rows);
  for (let r = 0; r < table.getNumRows(); r++) {
    table.getRow(r).getCell(0).setBackgroundColor("#F2F2F2").editAsText().setBold(true);
  }
}

function formatDate_(value) {
  return Utilities.formatDate(new Date(value), Session.getScriptTimeZone() || "America/Sao_Paulo", "dd/MM/yyyy 'às' HH:mm");
}

function createResumoHtml_(folder, data) {
  const fileName = "RESUMO DO ONBOARDING - " + sanitizeName_(data.company.storeName) + ".html";
  const old = folder.getFilesByName(fileName);
  while (old.hasNext()) old.next().setTrashed(true);
  const labels = {
    storeName:"Nome da loja", cnpj:"CNPJ", city:"Cidade / UF", region:"Região de atuação", units:"Número de unidades",
    owner:"Responsável da loja", phone:"WhatsApp do responsável", email:"E-mail do responsável", meetingDate:"Data da reunião",
    gadsOwner:"Responsável GADS", commercialPhone:"WhatsApp comercial", commercialEmail:"E-mail comercial", site:"Site", instagram:"Instagram", notes:"Observações"
  };
  const commercialLabels = {
    products:"Principais produtos", brands:"Marcas comercializadas", priorityAudience:"Público prioritário", priorityRegion:"Região prioritária",
    averageTicket:"Ticket médio aproximado", differentials:"Diferenciais da loja", competitors:"Principais concorrentes",
    challenges:"Dificuldades comerciais", goal:"Objetivo principal"
  };
  function rows_(values, map) {
    return Object.keys(map).filter(function(k){ return values && values[k]; }).map(function(k){ return "<tr><th>"+escape_(map[k])+"</th><td>"+escape_(values[k])+"</td></tr>"; }).join("") || "<tr><td>Não informado</td></tr>";
  }
  const accessRows = Object.keys(data.access || {}).map(function(asset){
    const a = data.access[asset] || {}; const cls = a.status === "Recebido" ? "ok" : (a.status === "Pendente" || a.status === "Solicitado" ? "warn" : "");
    return "<tr><td>"+escape_(asset)+"</td><td><span class='status "+cls+"'>"+escape_(a.status || "Pendente")+"</span></td><td>"+escape_(a.id || "—")+"</td><td>"+escape_(a.note || "—")+"</td></tr>";
  }).join("");
  const html = "<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>Resumo do Onboarding</title><style>"+
    "body{margin:0;background:#0a0a0a;color:#eee;font:14px Arial,sans-serif}main{max-width:1000px;margin:40px auto;background:#111;border:1px solid #333;padding:42px}header{border-left:6px solid #ff4d00;padding-left:22px;margin-bottom:36px}header small,h2{color:#ff4d00;letter-spacing:.14em}h1{font-size:36px;margin:8px 0}h2{font-size:14px;margin-top:34px}table{width:100%;border-collapse:collapse;background:#161616}th,td{padding:13px;text-align:left;border:1px solid #333}th{width:28%;color:#aaa}.access th{width:auto;background:#222;color:#fff}.status{padding:5px 9px;border-radius:20px;background:#444}.status.ok{background:#164d35;color:#8aefbe}.status.warn{background:#5a3517;color:#ffbd80}.audience{padding:14px;background:#181818;border-left:3px solid #ff4d00}footer{margin-top:36px;color:#777;font-size:11px;border-top:1px solid #333;padding-top:18px}@media(max-width:700px){main{margin:0;padding:20px}h1{font-size:26px}th,td{display:block;width:auto!important}}</style></head><body><main>"+
    "<header><small>GADS • ONBOARDING DE CLIENTE</small><h1>"+escape_(data.company.storeName || "Cliente")+"</h1><p>Resumo gerado em "+escape_(formatDate_(data.savedAt))+"</p></header>"+
    "<h2>DADOS DA EMPRESA</h2><table>"+rows_(data.company, labels)+"</table>"+
    "<h2>INFORMAÇÕES COMERCIAIS</h2><table>"+rows_(data.commercial || {}, commercialLabels)+"</table>"+
    "<h2>PÚBLICOS ATENDIDOS</h2><p class='audience'>"+escape_((data.audiences || []).join(" • ") || "Não informado")+"</p>"+
    "<h2>ACESSOS E ATIVOS</h2><table class='access'><tr><th>Ativo</th><th>Status</th><th>E-mail ou ID</th><th>Observação</th></tr>"+accessRows+"</table>"+
    "<footer>GADS Assessoria e Negócios Digitais • Documento gerado automaticamente.</footer></main></body></html>";
  folder.createFile(fileName, html, MimeType.HTML);
}

function escape_(value) {
  return String(value == null ? "" : value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");
}

function toPortuguese_(data) {
  const companyLabels = {
    storeName:"Nome da empresa", cnpj:"CNPJ", city:"Cidade / UF", region:"Região de atuação", units:"Número de unidades",
    owner:"Nome do responsável", phone:"WhatsApp do responsável", email:"E-mail do responsável", meetingDate:"Data da reunião de onboarding",
    gadsOwner:"Responsável GADS pelo projeto", commercialPhone:"Número comercial que receberá os leads", commercialEmail:"E-mail comercial",
    site:"Site atual", instagram:"Instagram", notes:"Observações da reunião"
  };
  const commercialLabels = {
    products:"Principais produtos vendidos", brands:"Marcas comercializadas", priorityAudience:"Público prioritário",
    priorityRegion:"Região prioritária", averageTicket:"Ticket médio aproximado", differentials:"Diferenciais da empresa",
    competitors:"Principais concorrentes", challenges:"Principais dificuldades comerciais", goal:"Objetivo principal do projeto"
  };
  function translate_(values, labels) {
    const result = {};
    Object.keys(labels).forEach(function(key) { result[labels[key]] = values && values[key] ? values[key] : "Não informado"; });
    return result;
  }
  const accesses = {};
  Object.keys(data.access || {}).forEach(function(asset) {
    const item = data.access[asset] || {};
    accesses[asset] = {
      "Status": item.status || "Pendente",
      "E-mail ou ID": item.id || "Não informado",
      "Observação": item.note || "Não informado"
    };
  });
  return {
    "Data de salvamento": formatDate_(data.savedAt),
    "Dados da empresa": translate_(data.company || {}, companyLabels),
    "Informações comerciais": translate_(data.commercial || {}, commercialLabels),
    "Acessos e ativos": accesses,
    "Onboarding finalizado em": data.finalized ? formatDate_(data.finalized) : "Ainda não finalizado"
  };
}
