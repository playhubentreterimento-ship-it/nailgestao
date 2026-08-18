"use client";

import { useState, useEffect } from "react";
import {
  Cake,
  MessageSquare,
  Gift,
  Sparkles,
  Settings,
  Copy,
  ExternalLink,
  Send,
  Check,
  Calendar,
  Search,
  ChevronRight,
  X,
  RefreshCw,
  Heart,
  Tag
} from "lucide-react";

const DEFAULT_TEMPLATE = "Parabéns, {nome}! 🎉🎂 O Studio Selma Gloor deseja um novo ano abençoado e repleto de conquistas! Como presente especial de aniversário, preparamos para você: {brinde}! Responda essa mensagem para agendar o seu momento especial conosco! 💕💅";

const TEMPLATE_PRESETS = [
  {
    title: "Carinhoso & Exclusivo (Recomendado)",
    text: "Parabéns, {nome}! 🎉🎂 O Studio Selma Gloor deseja um novo ano abençoado! Como presente especial de aniversário, preparamos para você: {brinde}! Responda essa mensagem para agendar o seu momento especial! 💕💅"
  },
  {
    title: "Desconto Especial de Mês",
    text: "Feliz Aniversário, {nome}! 🥳✨ Para comemorar seu dia especial, liberamos um presente exclusivo para você no Studio Selma Gloor: {brinde}! Válido durante todo este mês. Vamos agendar seu horário?"
  },
  {
    title: "Especial Nails & Beleza",
    text: "Parabéns, {nome}! 💅👑 No mês do seu aniversário, você merece brilhar ainda mais! O Studio Selma Gloor preparou um mimo exclusivo para você: {brinde}. Clique aqui e agende seu dia de princesa!"
  }
];

const GIFT_PRESETS = [
  "Cupom 15% OFF",
  "Spa dos Pés Grátis",
  "Esmaltação em Gel de Mimo",
  "Desconto de R$ 30,00",
  "Design de Sobrancelha de Brinde"
];

export default function AniversariantesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  
  // Configuração do Brinde e Template
  const [giftType, setGiftType] = useState("Cupom 15% OFF");
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_TEMPLATE);
  const [showConfigModal, setShowConfigModal] = useState(false);
  
  // Modal de Envio Personalizado por Cliente
  const [sendingClient, setSendingClient] = useState<any>(null);
  const [customMsg, setCustomMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSendingApi, setIsSendingApi] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(false);

  // Carregar dados e configurações salvas
  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Carregar configurações de localStorage se existirem
    const savedGift = localStorage.getItem("birthday_gift_type");
    const savedTemplate = localStorage.getItem("birthday_msg_template");
    if (savedGift) setGiftType(savedGift);
    if (savedTemplate) setMessageTemplate(savedTemplate);
  }, []);

  const saveSettings = (newGift: string, newTemplate: string) => {
    setGiftType(newGift);
    setMessageTemplate(newTemplate);
    localStorage.setItem("birthday_gift_type", newGift);
    localStorage.setItem("birthday_msg_template", newTemplate);
    setShowConfigModal(false);
  };

  // Filtrar clientes aniversariantes
  const filteredClients = clients.filter((c) => {
    if (!c.birthDate) return false;
    const parts = c.birthDate.split("-");
    const month = parts[1];
    const matchMonth = selectedMonth === "all" || month === selectedMonth;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.whatsapp?.includes(search);
    return matchMonth && matchSearch;
  });

  // Gerar mensagem formatada para uma cliente
  const buildMessageForClient = (cli: any) => {
    let msg = messageTemplate || DEFAULT_TEMPLATE;
    msg = msg.replace(/\{nome\}/g, cli.name || "Cliente");
    msg = msg.replace(/\{brinde\}/g, giftType || "Presente Especial");
    msg = msg.replace(/\{salao\}/g, "Studio Selma Gloor");
    return msg;
  };

  // Abrir modal de envio individual
  const handleOpenSendModal = (cli: any) => {
    setSendingClient(cli);
    setCustomMsg(buildMessageForClient(cli));
    setCopied(false);
    setApiSuccess(false);
  };

  // Enviar via WhatsApp Web / App (Direct Link)
  const handleSendWhatsAppWeb = (cli: any, textToSend: string) => {
    const rawPhone = (cli.whatsapp || cli.phone || "").replace(/\D/g, "");
    const formattedPhone = rawPhone.length <= 11 ? `55${rawPhone}` : rawPhone;
    const encodedText = encodeURIComponent(textToSend);
    window.open(`https://wa.me/${formattedPhone}?text=${encodedText}`, "_blank");
  };

  // Enviar via API do Sistema
  const handleSendViaApi = async () => {
    if (!sendingClient) return;
    setIsSendingApi(true);
    try {
      await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SEND_DIRECT",
          phone: sendingClient.whatsapp || sendingClient.phone,
          messageText: customMsg,
        }),
      });
      setApiSuccess(true);
      setTimeout(() => setApiSuccess(false), 4000);
    } catch (e) {
      alert("Não foi possível enviar via API. Use a opção de abrir no WhatsApp Web!");
    } finally {
      setIsSendingApi(false);
    }
  };

  // Copiar mensagem para a área de transferência
  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const monthNames = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  const currentMonthLabel = monthNames.find((m) => m.value === selectedMonth)?.label || "Mês Selecionado";

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl flex items-center gap-2">
            <span>🎂</span> Aniversariantes do Mês
          </h2>
          <p className="text-xs text-slate-600 dark:text-rose-200 font-medium mt-1">
            Felicite suas clientes com brindes personalizados e envie mensagens carinhosas via WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setShowConfigModal(true)}
          className="flex items-center justify-center space-x-2 rounded-2xl bg-[#6B1615] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#801B1A] transition-all"
        >
          <Gift className="h-4 w-4 text-amber-300" />
          <span>Configurar Brinde & Mensagem</span>
        </button>
      </div>

      {/* Card Informativo do Brinde Atual */}
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50/80 via-rose-50/50 to-amber-50/80 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-sm">
              🎁
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Brinde de Aniversário Configurado:
                </span>
                <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-black text-amber-900">
                  {giftType}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Modelo da Mensagem: </span>
                "{messageTemplate.replace(/\{nome\}/g, "Maria").replace(/\{brinde\}/g, giftType)}"
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowConfigModal(true)}
            className="self-start md:self-auto flex items-center space-x-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 shadow-2xs hover:bg-amber-100 dark:bg-slate-800 dark:text-amber-200"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Editar Brinde</span>
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-rose-600" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Selecione o Mês:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6B1615] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">Todos os Meses</option>
            {monthNames.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou fone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6B1615] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Lista de Clientes Aniversariantes */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🎂</span> Clientes Aniversariantes de {selectedMonth === "all" ? "Todos os Meses" : currentMonthLabel}
            <span className="ml-2 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-extrabold text-rose-800">
              {filteredClients.length}
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-medium text-slate-500">
            Carregando lista de aniversariantes...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
            <Cake className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />
            <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-400">
              Nenhuma cliente cadastrada fazendo aniversário em {selectedMonth === "all" ? "qualquer mês" : currentMonthLabel}.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Dica: Verifique a data de nascimento no cadastro das suas clientes em "Clientes & CRM".
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((cli) => {
              const birthDayMonth = cli.birthDate
                ? cli.birthDate.split("-").slice(1).reverse().join("/")
                : "--/--";

              const defaultText = buildMessageForClient(cli);

              return (
                <div
                  key={cli.id}
                  className="flex flex-col justify-between rounded-2xl border border-rose-100 bg-rose-50/40 p-4 transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <div>
                    <div className="flex items-start space-x-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 font-bold text-white text-xl shadow-xs">
                        🎂
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white truncate">
                          {cli.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="inline-flex items-center text-xs font-semibold text-rose-700 dark:text-rose-300">
                            🎈 Dia: {birthDayMonth}
                          </span>
                          {cli.whatsapp && (
                            <span className="text-[10px] text-slate-500 truncate">
                              • {cli.whatsapp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-rose-200/80 bg-white/90 p-2.5 dark:border-slate-700 dark:bg-slate-900/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <Tag className="h-3 w-3 text-amber-600" /> Brinde:
                        </span>
                        <span className="font-extrabold text-rose-700 dark:text-rose-400">
                          {giftType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações de Envio */}
                  <div className="mt-4 pt-3 border-t border-rose-200/60 dark:border-slate-700 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleSendWhatsAppWeb(cli, defaultText)}
                      className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                      title="Enviar diretamente via WhatsApp Web / App"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>WhatsApp Direct</span>
                    </button>

                    <button
                      onClick={() => handleOpenSendModal(cli)}
                      className="flex items-center justify-center space-x-1 rounded-xl border border-rose-300 bg-white px-2.5 py-2 text-xs font-bold text-rose-900 shadow-2xs hover:bg-rose-50 dark:bg-slate-800 dark:text-rose-200"
                      title="Personalizar mensagem antes de enviar"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>Personalizar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: CONFIGURAÇÃO DE BRINDE E TEMPLATE */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-[#6B1615] dark:text-amber-300 flex items-center gap-2">
                <span>🎁</span> Configurar Brinde e Mensagem Padrão
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 1. Escolher ou Editar Tipo de Brinde */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                1. Tipo de Brinde / Presente de Aniversário:
              </label>
              <input
                type="text"
                value={giftType}
                onChange={(e) => setGiftType(e.target.value)}
                placeholder="Ex: Cupom 15% OFF, Spa dos Pés Grátis..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6B1615] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 self-center mr-1">Sugestões:</span>
                {GIFT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setGiftType(preset)}
                    className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-all ${
                      giftType === preset
                        ? "bg-[#6B1615] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Modelos Prontos de Mensagem */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                2. Escolher um Modelo de Mensagem Pronto:
              </label>
              <div className="grid gap-2">
                {TEMPLATE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMessageTemplate(preset.text)}
                    className="text-left rounded-xl border border-slate-200 p-2.5 text-xs hover:border-amber-400 hover:bg-amber-50/50 transition-all dark:border-slate-800 dark:hover:bg-slate-800"
                  >
                    <span className="font-bold text-[#6B1615] dark:text-amber-300 block mb-0.5">
                      {preset.title}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      "{preset.text}"
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Editor do Template Personalizado */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  3. Texto da Mensagem (com Variáveis):
                </label>
                <span className="text-[10px] text-slate-500">
                  Variáveis disponíveis: <code className="text-rose-600 font-bold">{`{nome}`}</code>, <code className="text-rose-600 font-bold">{`{brinde}`}</code>
                </span>
              </div>
              <textarea
                rows={4}
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6B1615] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => saveSettings(giftType, messageTemplate)}
                className="rounded-xl bg-[#6B1615] px-5 py-2 text-xs font-bold text-white hover:bg-[#801B1A] transition-colors shadow-sm"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PERSONALIZAR E ENVIAR PARA CLIENTE ESPECÍFICO */}
      {sendingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🎂</span>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                    Enviar Parabéns para {sendingClient.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    WhatsApp: {sendingClient.whatsapp || sendingClient.phone || "Não informado"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSendingClient(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Editor ao vivo da mensagem */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Mensagem a ser enviada (pode editar livremente):
              </label>
              <textarea
                rows={5}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {apiSuccess && (
              <div className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center space-x-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Mensagem enviada com sucesso pelo sistema!</span>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => handleCopyMessage(customMsg)}
                className="flex items-center justify-center space-x-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copiado!" : "Copiar Texto"}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSendWhatsAppWeb(sendingClient, customMsg)}
                  className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Abrir no WhatsApp</span>
                </button>

                <button
                  onClick={handleSendViaApi}
                  disabled={isSendingApi}
                  className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#6B1615] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#801B1A] disabled:opacity-50"
                >
                  {isSendingApi ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Enviar via API</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

