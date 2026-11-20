/* Movimento Bahia pela Educação — comportamentos do portal (Fase 1, Requisitos v1.2)
   Sem dependências. Cada bloco só age se o elemento existir na página (home ou página interna).
   Dados: assets/data/ica.js (MBE_ICA, só na home), busca.js (MBE_BUSCA, índice gerado das páginas),
   centros.js (MBE_CENTROS); MBE_CONFIG e ROTAS no layout. */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const ROTAS = window.ROTAS || {};
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animOn = () => root.classList.contains("js-anim");
  const br = (n, dec = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  window.__mbeReady = true;

  /* ---------- Aviso discreto (toast) ---------- */
  const toast = $("#toast");
  let toastTimer;
  function notify(title, text, code) {
    toast.hidden = true; toast.innerHTML = "";
    const b = document.createElement("b"); b.textContent = title; toast.append(b);
    if (text) toast.append(document.createTextNode(text));
    if (code) { toast.append(document.createTextNode(" ")); const c = document.createElement("code"); c.textContent = code; toast.append(c); }
    requestAnimationFrame(() => { toast.hidden = false; });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 6000);
  }
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && !toast.hidden) toast.hidden = true; });

  /* ---------- Helpers de abrir/fechar com transição ---------- */
  function show(el) { el.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-open"))); }
  function hide(el, ms = 200) {
    el.classList.remove("is-open");
    const done = () => { if (!el.classList.contains("is-open")) el.hidden = true; };
    if (reduceMotion) done(); else setTimeout(done, ms);
  }

  /* ---------- Links para a própria página (home → topo) ---------- */
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest('a[href="/"], a[aria-current="page"][href$=".html"]');
    if (!a || a.getAttribute("href").includes("#")) return;
    ev.preventDefault();
    closeAllMega(); closeMobile(false);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- Destinos ainda não implementados ---------- */
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest("a[data-pending]");
    if (!a) return;
    ev.preventDefault();
    const href = a.getAttribute("href");
    const rota = ROTAS[href] || ROTAS[href.split("?")[0]];
    const nome = a.dataset.label || (rota && rota.nome) || a.textContent.trim();
    if (rota && rota.status === "externo") {
      notify(nome, "Abrirá o painel de indicadores do Observatório (BI). O link será fornecido pela equipe do BI.");
    } else {
      notify(nome, "Página da Fase 1, a desenvolver depois da validação da home. Destino:", href);
    }
    closeAllMega();
    closeMobile(false);
  });

  /* ---------- Menu desktop (mega menu) ---------- */
  const megaBtns = $$(".nav-l1__btn");
  function closeAllMega(except) {
    megaBtns.forEach((b) => {
      if (b === except || b.getAttribute("aria-expanded") !== "true") return;
      b.setAttribute("aria-expanded", "false");
      const p = document.getElementById(b.getAttribute("aria-controls"));
      if (p) hide(p, 180);
    });
  }
  megaBtns.forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      closeAllMega(btn);
      closeSearch();
      btn.setAttribute("aria-expanded", String(!open));
      if (open) hide(panel, 180); else show(panel);
    });
    btn.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowDown") {
        ev.preventDefault();
        if (btn.getAttribute("aria-expanded") !== "true") btn.click();
        setTimeout(() => { const first = $("a, [tabindex]", panel); if (first) first.focus(); }, 30);
      }
    });
    panel.addEventListener("keydown", (ev) => { if (ev.key === "Escape") { closeAllMega(); btn.focus(); } });
  });
  document.addEventListener("click", (ev) => { if (!ev.target.closest(".nav-desktop")) closeAllMega(); });
  $(".nav-desktop")?.addEventListener("focusout", (ev) => {
    if (!ev.relatedTarget || !ev.currentTarget.contains(ev.relatedTarget)) closeAllMega();
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape") return;
    const open = megaBtns.find((b) => b.getAttribute("aria-expanded") === "true");
    if (open) { closeAllMega(); open.focus(); }
  });

  /* ---------- Menu mobile ---------- */
  const menu = $("#menu-mobile"), scrim = $("#scrim"), btnMenu = $("#btn-menu"), btnClose = $("#btn-menu-fechar");
  function openMobile() {
    show(menu); show(scrim);
    btnMenu.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
    closeSearch();
    setTimeout(() => btnClose.focus(), 30);
  }
  function closeMobile(returnFocus = true) {
    if (menu.hidden) return;
    hide(menu, 240); hide(scrim, 240);
    btnMenu.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
    if (returnFocus) btnMenu.focus();
  }
  btnMenu.addEventListener("click", openMobile);
  btnClose.addEventListener("click", () => closeMobile());
  scrim.addEventListener("click", () => closeMobile());
  menu.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") { closeMobile(); return; }
    if (ev.key !== "Tab") return;
    const f = $$("a, button", menu).filter((el) => el.offsetParent !== null);
    const first = f[0], last = f[f.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  });
  $$(".m-l1__btn").forEach((b) => b.addEventListener("click", () => {
    const open = b.getAttribute("aria-expanded") === "true";
    b.setAttribute("aria-expanded", String(!open));
    document.getElementById(b.getAttribute("aria-controls")).hidden = open;
  }));
  window.matchMedia("(min-width: 1280px)").addEventListener("change", (m) => { if (m.matches) closeMobile(false); });

  /* ---------- Submenus também por passagem do mouse (RF04.2) e setas dentro do painel (RF04.3) ---------- */
  const hoverOK = window.matchMedia("(hover: hover) and (pointer: fine)");
  megaBtns.forEach((btn) => {
    const li = btn.closest("li"), panel = document.getElementById(btn.getAttribute("aria-controls"));
    let t;
    li.addEventListener("mouseenter", () => { if (!hoverOK.matches) return; clearTimeout(t); if (btn.getAttribute("aria-expanded") !== "true") btn.click(); });
    li.addEventListener("mouseleave", () => { if (!hoverOK.matches) return; t = setTimeout(() => { if (btn.getAttribute("aria-expanded") === "true") { btn.setAttribute("aria-expanded", "false"); hide(panel, 180); } }, 220); });
    panel.addEventListener("keydown", (ev) => {
      if (ev.key !== "ArrowDown" && ev.key !== "ArrowUp") return;
      const links = $$("a", panel), i = links.indexOf(document.activeElement);
      if (i < 0) return;
      ev.preventDefault();
      links[(i + (ev.key === "ArrowDown" ? 1 : -1) + links.length) % links.length].focus();
    });
  });

  /* ---------- Utilitários ---------- */
  const normz = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const hojeExt = () => { const d = new Date(); return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; };

  /* ---------- Local e data do acesso na capa (RF04.6) ----------
     Pede a localização uma vez por visita (só nas páginas com a anotação "Caderno da Bahia").
     Identifica a cidade no navegador pela sede municipal mais próxima (malha IBGE); fica guardada
     só durante a visita (sessionStorage) e não é enviada. Recusa ou fora da Bahia: só a data. */
  const locais = $$("[data-local-data]");
  if (locais.length) {
    const usar = (cidade) => { const t = cidade ? `${cidade}, ${hojeExt()}` : hojeExt(); locais.forEach((el) => { el.textContent = t; }); };
    usar(null);
    let pedido = false; try { pedido = sessionStorage.getItem("mbe-geo") === "1"; } catch {}
    const C = window.MBE_CENTROS || [];
    let cid = null; try { cid = sessionStorage.getItem("mbe-cidade"); } catch {}
    if (cid) usar(cid);
    if (!pedido && navigator.geolocation && !new URLSearchParams(location.search).has("semlocal")) {
      try { sessionStorage.setItem("mbe-geo", "1"); } catch {}
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude: la, longitude: lo } = pos.coords;
        let best = null, bd = Infinity;
        C.forEach(([, nome, x, y]) => { const d = ((x - lo) * Math.cos(la * Math.PI / 180)) ** 2 + (y - la) ** 2; if (d < bd) { bd = d; best = nome; } });
        if (best && Math.sqrt(bd) < 0.3) { usar(best); try { sessionStorage.setItem("mbe-cidade", best); } catch {} document.dispatchEvent(new CustomEvent("mbe:cidade", { detail: best })); }
      }, () => usar(null), { timeout: 8000, maximumAge: 600000 });
    }
  }

  /* ---------- Busca por palavra-chave (RF05) — no navegador, sem servidor ---------- */
  const IDX = (window.MBE_BUSCA || []).map((p) => ({ ...p, nt: normz(p.t), nx: normz(p.x) }));
  const btnBusca = $("#btn-busca"), painelBusca = $("#painel-busca"), campo = $("#campo-busca");
  const resEl = $("#busca-resultados"), stEl = $("#busca-status");
  function closeSearch() { painelBusca.hidden = true; btnBusca.setAttribute("aria-expanded", "false"); }
  btnBusca.addEventListener("click", () => {
    const open = btnBusca.getAttribute("aria-expanded") === "true";
    closeAllMega();
    if (open) { closeSearch(); return; }
    painelBusca.hidden = false; btnBusca.setAttribute("aria-expanded", "true"); campo.focus();
  });
  painelBusca.addEventListener("keydown", (ev) => { if (ev.key === "Escape") { closeSearch(); btnBusca.focus(); } });
  function trechoMarcado(p, termos) {
    let pos = -1;
    termos.forEach((t) => { const i = p.nx.indexOf(t); if (i >= 0 && (pos < 0 || i < pos)) pos = i; });
    const a = Math.max(0, pos - 70), b = Math.min(p.x.length, (pos < 0 ? 0 : pos) + 150);
    let s = (a > 0 ? "…" : "") + p.x.slice(a, b) + (b < p.x.length ? "…" : "");
    let html = "", ns = normz(s), last = 0;
    const marks = [];
    termos.forEach((t) => { let i = ns.indexOf(t); while (i >= 0) { marks.push([i, i + t.length]); i = ns.indexOf(t, i + t.length); } });
    marks.sort((x, y) => x[0] - y[0]).forEach(([i, j]) => { if (i < last) return; html += esc(s.slice(last, i)) + "<mark>" + esc(s.slice(i, j)) + "</mark>"; last = j; });
    return html + esc(s.slice(last));
  }
  function buscar(q) {
    const termos = normz(q).split(/\s+/).filter((t) => t.length >= 2);
    resEl.innerHTML = "";
    if (!termos.length) { stEl.textContent = q.trim() ? "Digite ao menos 2 caracteres." : ""; return; }
    const res = IDX.map((p) => {
      let score = 0;
      for (const t of termos) {
        const inT = p.nt.includes(t), nX = p.nx.split(t).length - 1;
        if (!inT && !nX) return null;
        score += (inT ? 100 : 0) + Math.min(nX, 10);
      }
      return { p, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score);
    if (!res.length) {
      stEl.textContent = `Nada encontrado para “${q.trim()}”.`;
      resEl.innerHTML = `<li class="busca-res__vazio">Veja as seções principais: <a href="quem-somos.html">Sobre o Movimento</a> · <a href="nossas-formacoes.html">Nossas ações</a> · <a href="fale-conosco.html">Fale conosco</a></li>`;
      return;
    }
    stEl.textContent = `${res.length} ${res.length === 1 ? "página encontrada" : "páginas encontradas"} para “${q.trim()}”.`;
    resEl.innerHTML = res.map(({ p }) => `<li><a href="${p.f}"><span class="busca-res__secao">${esc(p.s)}</span><b>${esc(p.t)}</b><span class="busca-res__trecho">${trechoMarcado(p, termos)}</span></a></li>`).join("");
  }
  let bt; campo.addEventListener("input", () => { clearTimeout(bt); bt = setTimeout(() => buscar(campo.value), 180); });
  $("#form-busca").addEventListener("submit", (ev) => { ev.preventDefault(); buscar(campo.value); const f = $("a", resEl); if (f && campo.value.trim()) f.focus(); });

  /* ---------- Carrossel de fotos da abertura (RF01.1, RF01.5) ---------- */
  const album = $("#album");
  if (album) {
    const slides = $$(".album__slide", album), dots = $$("[data-album-ir]", album);
    const tg = $('[data-album="toggle"]', album), rot = $(".album__rotulo", tg);
    let i = 0, playing = !reduceMotion, hold = false, tm = null;
    const ir = (n, foco) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { const on = k === i; s.hidden = !on; s.classList.toggle("is-ativo", on); });
      dots.forEach((d, k) => { if (k === i) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
      if (foco) $("#album-slides").setAttribute("aria-live", "polite");
    };
    const sync = () => {
      clearInterval(tm);
      if (playing && !hold && !document.hidden) tm = setInterval(() => ir(i + 1), 6000);
      tg.setAttribute("aria-pressed", String(!playing)); tg.classList.toggle("is-paused", !playing); rot.textContent = playing ? "Pausar" : "Reproduzir";
      $("#album-slides").setAttribute("aria-live", playing ? "off" : "polite");
    };
    $('[data-album="prev"]', album).addEventListener("click", () => { ir(i - 1, true); });
    $('[data-album="next"]', album).addEventListener("click", () => { ir(i + 1, true); });
    dots.forEach((d) => d.addEventListener("click", () => ir(+d.dataset.albumIr, true)));
    tg.addEventListener("click", () => { playing = !playing; sync(); });
    album.addEventListener("mouseenter", () => { hold = true; sync(); });
    album.addEventListener("mouseleave", () => { hold = false; sync(); });
    album.addEventListener("focusin", () => { hold = true; sync(); });
    album.addEventListener("focusout", (e) => { if (!album.contains(e.relatedTarget)) { hold = false; sync(); } });
    document.addEventListener("visibilitychange", sync);
    sync();
  }

  if ($("#municipio")) {
  /* ---------- Consulta de dados do município (RF51) ----------
     Dados: window.MBE_ICA (planilha CNCA_2025, convertida por tools/importar_cnca.py). */
  const ICA = window.MBE_ICA || { m: [] };
  const LIST = ICA.m.map((x) => ({ ...x, k: normz(x.n) })).sort((a, b) => a.n.localeCompare(b.n, "pt-BR"));
  const BYC = {}; LIST.forEach((x) => { BYC[x.c] = x; });
  const pp = (n) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n)} ${Math.abs(n) === 1 ? "ponto percentual" : "pontos percentuais"}`;
  const NIVEL = (nv) => nv === 0 ? "Abaixo do nível 1" : `Nível ${nv}`;
  function faixaTxt(f) {
    const m = /\(([^)]*)\)/.exec(f || ""); if (!m) return "";
    const t = m[1].replace(/^entre/i, "Entre").replace(/^até/i, "Até").replace(/^acima/i, "Acima");
    return `${t} dos estudantes alfabetizados`;
  }
  function grafico(x, cw = 640) {
    const W = Math.round(Math.max(300, Math.min(640, cw))), H = W < 480 ? 260 : 300, L = 40, R = 16, T = 30, B = 40;
    const anos = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
    const px = (a) => L + 22 + (a - 2023) * (W - L - R - 34) / 7, py = (v) => T + (100 - v) * (H - T - B) / 100;
    const obs = [2023, 2024, 2025].map((a, k) => [a, x.r[k]]).filter(([, v]) => v != null);
    const met = x.m.map((v, k) => [2024 + k, v]).filter(([, v]) => v != null);
    const path = (pts) => pts.map(([a, v], k) => `${k ? "L" : "M"}${px(a).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");
    let g = "";
    [0, 20, 40, 60, 80, 100].forEach((v) => { g += `<line class="gr" x1="${L}" x2="${W - R}" y1="${py(v)}" y2="${py(v)}"/><text class="eixo" x="${L - 8}" y="${py(v) + 4}" text-anchor="end">${v}%</text>`; });
    anos.forEach((a) => { g += `<text class="eixo" x="${px(a)}" y="${H - B + 22}" text-anchor="middle">${W < 480 ? "’" + String(a).slice(2) : a}</text>`; });
    const valObs = Object.fromEntries(obs), valMet = Object.fromEntries(met);
    if (met.length) {
      g += `<path class="meta" d="${path(met)}"/>`;
      met.forEach(([a, v]) => { const acima = valObs[a] != null && v > valObs[a]; g += `<circle class="meta-p" cx="${px(a)}" cy="${py(v)}" r="3.5"/><text class="rot rot--meta" x="${px(a)}" y="${py(v) + (acima ? -10 : 18)}" text-anchor="middle">${v}%</text>`; });
    }
    if (obs.length) {
      g += `<path class="obs" d="${path(obs)}"/>`;
      obs.forEach(([a, v]) => { const abaixo = valMet[a] != null && valMet[a] > v; g += `<circle class="obs-p" cx="${px(a)}" cy="${py(v)}" r="5.5"/><text class="rot rot--obs" x="${px(a)}" y="${py(v) + (abaixo ? 22 : -12)}" text-anchor="middle">${v}%</text>`; });
    }
    if (x.r[1] != null && x.r[2] != null) {
      const d = x.r[2] - x.r[1], mx = (px(2024) + px(2025)) / 2, my = Math.min(py(x.r[1]), py(x.r[2]));
      const y = W < 480 ? T - 10 : (my - 30 < T ? Math.max(py(x.r[1]), py(x.r[2])) + 34 : my - 30);
      g += `<text class="var hand-svg" x="${mx + 4}" y="${y}" text-anchor="middle">${esc(pp(d))}</text>`;
    }
    return `<svg class="grafico" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="graf-desc"><desc id="graf-desc">Resultado observado em ${esc(x.n)}: ${obs.map(([a, v]) => `${a}, ${v}%`).join("; ")}. Meta anual: ${met.map(([a, v]) => `${a}, ${v}%`).join("; ") || "sem metas anuais"}.</desc>${g}</svg>`;
  }
  const CFG0 = window.MBE_CONFIG || {};
  const MES3 = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const dataBr = (iso) => { const [a, m, d] = iso.split("-"); return `${+d} ${MES3[+m - 1]} ${a}`; };
  function localizador(c) {
    const svg = $("#mapa-niveis"), p = svg && svg.querySelector(`path[data-cod="${c}"]`); if (!p) return "";
    const b = p.getBBox();
    return `<svg class="loc" viewBox="${svg.getAttribute("viewBox")}" aria-hidden="true"><path d="${svg.querySelector(".mapa-nivel__contorno").getAttribute("d")}"/><path class="m" d="${p.getAttribute("d")}"/><circle cx="${b.x + b.width / 2}" cy="${b.y + b.height / 2}" r="${Math.max(b.width, b.height) / 2 + 16}"/></svg>`;
  }
  /* "O que já fizemos juntos": listas dos Textos Etapa 1 (PAR 2026, encontros 2026, Prêmio 2025 e 2026) */
  function juntos(c) {
    const it = [];
    const P = CFG0.premio || {};
    Object.entries(P).forEach(([ano, cats]) => Object.entries(cats).forEach(([cat, cods]) => {
      if (!cods.includes(c)) return;
      it.push(`<li class="ok"><span><strong>${cat === "Menção honrosa" ? `Menção honrosa no Prêmio ${ano}` : `Prêmio Município Alfabetizador ${ano} · ${cat}`}</strong><small>${ano === "2025" ? "1ª edição, 15 dez 2025" : "2ª edição, 27 nov 2026"}</small></span></li>`);
    }));
    if ((CFG0.par || []).includes(c)) it.push(`<li class="ok"><span><strong>Professores no PAR em 2026</strong><small>Programa Alfabetização Responsável</small></span></li>`);
    const sede = (CFG0.encontros || []).find(([k]) => k === c);
    if (sede) it.push(`<li class="ok"><span><strong>Sediou um encontro territorial</strong><small>${dataBr(sede[2])}</small></span></li>`);
    return it;
  }
  function folhaHTML(x) {
    const topo = `<div class="folha__topo"><b>Folha do município</b><span class="hand">Atualizado em ${esc(CFG0.atualizado || "")}</span></div>
      <div class="folha__id"><div><h2 id="folha-nome" class="folha__nome" tabindex="-1"><small>Alfabetização em</small> ${esc(x.n)}</h2>
      <p class="folha__sub">Percentual de estudantes alfabetizados e metas anuais</p></div>${localizador(x.c)}</div>`;
    const pe = `<div class="folha__pe">
      <p class="folha__fontes">Fonte: Indicador Criança Alfabetizada (ICA) — MEC; dados organizados pelo Movimento Bahia pela Educação · Ano de referência: ${ICA.ano} · Atualização anual. “O que já fizemos juntos”: Textos do Movimento (Etapa 1).</p></div>`;
    const lista = juntos(x.c);
    const ladoJuntos = `<section class="licao"><h3><span class="hand">2.</span> O que já fizemos juntos</h3>${lista.length ? `<ul class="check">${lista.join("")}</ul>` : `<p class="nota">Ainda não há ações do Movimento registradas para ${esc(x.n)} nos textos publicados.</p>`}
      <ul class="folha__links"><li><a href="par.html">PAR</a></li><li><a href="encontros-territoriais.html">Encontros territoriais</a></li><li><a href="premio.html">Prêmio Município Alfabetizador</a></li></ul></section>`;
    if (x.sem) {
      return topo + `<div class="folha__grid"><div><section class="licao"><h3><span class="hand">1.</span> Como estamos</h3><p class="nota nota--red">Não há resultado do ICA disponível para este município.</p></section></div><aside class="lado">${ladoJuntos}</aside></div>` + pe;
    }
    const mAno = x.m[1], r25 = x.r[2];
    let resumo = "";
    if (mAno != null && r25 != null) {
      const d = r25 - mAno;
      resumo = `<p class="card-mun__resumo"><b>2025</b><span>${d === 0 ? "atingiu a meta do ano" : `${Math.abs(d)} ${Math.abs(d) === 1 ? "ponto percentual" : "pontos percentuais"} ${d > 0 ? "acima" : "abaixo"} da meta do ano`} (${mAno}%)</span></p>`;
    }
    const como = `<section class="licao"><h3><span class="hand">1.</span> Como estamos</h3>
      <div class="card-mun__grafico">${grafico(x)}</div>
      <p class="card-mun__leg"><span class="lg-obs">Resultado observado</span>${x.m.some((v) => v != null) ? '<span class="lg-meta">Meta anual</span>' : "<span>Sem metas anuais para este município</span>"}</p>
      ${resumo}</section>`;
    const selo = `<div class="selo nv${x.nv}"><p class="selo__nivel">${NIVEL(x.nv)}</p><div><p class="selo__faixa">${esc(faixaTxt(x.f))}</p>
      <p class="selo__frase">${esc(x.n)} chegou a ${r25}% em 2025${x.p != null ? `, com ${x.p}% de participação na avaliação` : ""}.</p></div></div>`;
    return topo + `<div class="folha__grid"><div>${como}</div><aside class="lado">${selo}${ladoJuntos}</aside></div>` + pe;
  }
  function escolher(c, opts = {}) {
    const x = BYC[c]; if (!x) return;
    const sec = $("#folha");
    sec.hidden = false;
    $("#folha-conteudo").innerHTML = folhaHTML(x);
    const gEl = $(".card-mun__grafico"); if (gEl) gEl.innerHTML = grafico(x, gEl.clientWidth);
    $("#mun-campo").value = x.n; fecharLista();
    $$("#mapa-muns path.sel").forEach((p) => p.classList.remove("sel"));
    const p = $(`#mapa-muns path[data-cod="${c}"]`); if (p) { p.classList.add("sel"); p.parentNode.append(p); }
    if (!opts.semUrl) { try { history.replaceState(null, "", "?municipio=" + c + "#folha"); } catch {} }
    sec.scrollIntoView({ behavior: reduceMotion || opts.instant ? "auto" : "smooth", block: "start" });
    $("#folha-nome").focus({ preventScroll: true });
  }
  $("#municipio").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const v = normz($("#mun-campo").value), aviso = $("#mun-ajuda");
    if (v.length < 2) { aviso.textContent = "Digite ao menos 2 letras do nome do município."; $("#mun-campo").focus(); return; }
    const exato = LIST.find((x) => x.k === v), pref = LIST.filter((x) => x.k.startsWith(v));
    if (exato) return escolher(exato.c);
    if (pref.length === 1) return escolher(pref[0].c);
    if (pref.length > 1) { campoM.dispatchEvent(new Event("input")); aviso.textContent = `${pref.length} municípios começam assim. Escolha um na lista.`; return; }
    aviso.textContent = `Não encontramos “${$("#mun-campo").value}” entre os municípios da Bahia.`;
  });
  /* combobox acessível (ARIA 1.2) */
  const campoM = $("#mun-campo"), lista = $("#mun-lista");
  let ops = [], ativo = -1;
  function fecharLista() { lista.hidden = true; campoM.setAttribute("aria-expanded", "false"); campoM.removeAttribute("aria-activedescendant"); ativo = -1; }
  function marcar(k) {
    ativo = k; $$("li", lista).forEach((li, j) => li.setAttribute("aria-selected", String(j === k)));
    if (k >= 0) { campoM.setAttribute("aria-activedescendant", `mun-op-${k}`); $(`#mun-op-${k}`).scrollIntoView({ block: "nearest" }); }
  }
  campoM.addEventListener("input", () => {
    const v = normz(campoM.value);
    if (v.length < 2) { fecharLista(); return; }
    const ini = LIST.filter((x) => x.k.startsWith(v)), meio = LIST.filter((x) => !x.k.startsWith(v) && x.k.includes(v));
    ops = [...ini, ...meio].slice(0, 8);
    lista.innerHTML = ops.length ? ops.map((x, k) => `<li id="mun-op-${k}" role="option" aria-selected="false" data-cod="${x.c}">${esc(x.n)}${x.sem ? ' <small>sem resultado</small>' : ""}</li>`).join("") : `<li class="combo__nada" role="option" aria-disabled="true">Nenhum município encontrado</li>`;
    lista.hidden = false; campoM.setAttribute("aria-expanded", "true"); ativo = -1;
  });
  campoM.addEventListener("keydown", (ev) => {
    if (lista.hidden && ev.key === "ArrowDown") { campoM.dispatchEvent(new Event("input")); return; }
    if (ev.key === "ArrowDown") { ev.preventDefault(); if (ops.length) marcar((ativo + 1) % ops.length); }
    else if (ev.key === "ArrowUp") { ev.preventDefault(); if (ops.length) marcar((ativo - 1 + ops.length) % ops.length); }
    else if (ev.key === "Enter") { if (!lista.hidden && ativo >= 0 && ops[ativo]) { ev.preventDefault(); escolher(ops[ativo].c); } }
    else if (ev.key === "Escape") { fecharLista(); }
  });
  lista.addEventListener("mousedown", (ev) => { const li = ev.target.closest("li[data-cod]"); if (li) { ev.preventDefault(); escolher(+li.dataset.cod); } });
  campoM.addEventListener("blur", () => setTimeout(fecharLista, 120));
  document.addEventListener("click", (ev) => { const b = ev.target.closest("[data-mun]"); if (b) escolher(+b.dataset.mun); });
  /* mapa por nível: clique e nome ao passar o mouse */
  const gm = $("#mapa-muns"), tip = $("#mapa-tip"), figM = $(".mapa-nivel");
  if (gm) {
    gm.addEventListener("click", (ev) => { const c = ev.target.dataset && ev.target.dataset.cod; if (c) escolher(+c); });
    gm.addEventListener("mousemove", (ev) => {
      const c = ev.target.dataset && ev.target.dataset.cod; const x = c && BYC[c];
      if (!x) { tip.hidden = true; return; }
      const r = figM.getBoundingClientRect();
      tip.textContent = x.sem ? `${x.n} · sem resultado` : `${x.n} · ${x.r[2]}% em 2025`;
      tip.style.left = (ev.clientX - r.left) + "px"; tip.style.top = (ev.clientY - r.top) + "px"; tip.hidden = false;
    });
    gm.addEventListener("mouseleave", () => { tip.hidden = true; });
  }
  /* "Tudo sobre a educação no seu município" leva ao campo (CA01.4) */
  $$("[data-ir-municipio]").forEach((a) => a.addEventListener("click", (ev) => {
    ev.preventDefault();
    $("#municipio").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    setTimeout(() => campoM.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
  }));
  const q0 = new URLSearchParams(location.search).get("municipio");
  if (q0 && BYC[q0]) requestAnimationFrame(() => escolher(+q0, { semUrl: true, instant: true }));
  /* Chegando de outra página por "Abra a folha do seu município" (index.html#municipio): foco no campo */
  if (location.hash === "#municipio" && !q0) setTimeout(() => campoM.focus({ preventScroll: true }), 60);

  }

  /* ---------- Janela de conteúdo incorporado (RF47 Painel · RF20 álbuns do Flickr) ----------
     Uma única janela modal. Cada gatilho informa o que carregar: [data-painel] abre o Power BI;
     [data-album="id"] abre o álbum do Flickr (embed oficial do Flickr). Ambos são "conteúdo incorporado
     de terceiros" (RF43): sem consentimento, a janela pede permissão antes de carregar. */
  const CFG = window.MBE_CONFIG || {};
  const dlg = $("#painel-modal"), corpo = $("#painel-corpo");
  let abridor = null, ifr = null, tmo = null, atual = null;
  if (!CFG.painelPublicado || !CFG.painelUrl) $$("[data-painel]").forEach((b) => { b.hidden = true; });
  const consent = () => { try { return JSON.parse(localStorage.getItem("mbe-consent") || "null"); } catch { return null; } };
  /* Dentro de outro site (ex.: prévia hospedada em quadro protegido), a incorporação é bloqueada
     pelo navegador sem aviso: nesse caso a janela oferece o link direto. */
  const emQuadro = (() => { try { return window.top !== window.self; } catch { return true; } })();
  const PAINEL = { chave: "painel", titulo: "Painel da Educação dos Municípios", nome: "o painel", servico: "Power BI (Microsoft)",
    src: CFG.painelUrl, url: CFG.painelUrl, link: "Abrir no Power BI", frame: "Painel da Educação dos Municípios (Power BI)" };
  const ALBUM = (a) => ({ chave: "album-" + a.dataset.album, titulo: a.dataset.albumTitulo || "Fotos do encontro", nome: "o álbum de fotos", servico: "Flickr",
    src: "https://embedr.flickr.com/photosets/" + a.dataset.album, url: a.href, link: "Ver o álbum completo no Flickr", frame: (a.dataset.albumTitulo || "Álbum de fotos") + " (Flickr)" });
  function preparar(m) {
    atual = m;
    $("#painel-titulo").textContent = m.titulo;
    $$("[data-m=nome]", dlg).forEach((x) => { x.textContent = m.nome; });
    $$("[data-m=Nome]", dlg).forEach((x) => { x.textContent = m.nome.charAt(0).toUpperCase() + m.nome.slice(1); });
    $$("[data-m=servico]", dlg).forEach((x) => { x.textContent = m.servico; });
    $$("[data-m=link]", dlg).forEach((x) => { x.textContent = m.link; });
    $$("[data-painel-link]", dlg).forEach((a) => { a.href = m.url || "#"; });
    dlg.classList.toggle("painel-modal--album", m.chave !== "painel");
  }
  function estado(id) { ["painel-carregando", "painel-consent", "painel-erro", "painel-externo"].forEach((k) => { $("#" + k).hidden = k !== id; }); if (ifr) ifr.hidden = id !== null; }
  function carregar() {
    if (ifr) ifr.remove();
    estado("painel-carregando");
    ifr = document.createElement("iframe");
    ifr.title = atual.frame; ifr.dataset.chave = atual.chave;
    ifr.src = atual.src; ifr.setAttribute("allowfullscreen", ""); ifr.loading = "eager";
    ifr.className = "painel-modal__frame"; ifr.hidden = true;
    let ok = false;
    ifr.addEventListener("load", () => { ok = true; clearTimeout(tmo); $("#painel-carregando").hidden = true; ifr.hidden = false; });
    clearTimeout(tmo); tmo = setTimeout(() => { if (!ok) { estado("painel-erro"); } }, 25000);
    corpo.append(ifr);
  }
  function abrir(btn, m) {
    abridor = btn;
    if (ifr && ifr.dataset.chave !== m.chave) { ifr.remove(); ifr = null; }
    preparar(m);
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    document.body.classList.add("no-scroll");
    const c = consent();
    if (emQuadro) { if (ifr) { ifr.remove(); ifr = null; } estado("painel-externo"); }
    else if (c && c.midia) { if (!ifr) carregar(); else { estado(null); ifr.hidden = false; } }
    else { if (ifr) { ifr.remove(); ifr = null; } estado("painel-consent"); $("[data-m-consent]").textContent = c ? "Você recusou conteúdos de terceiros nas preferências de cookies. Para ver aqui, permita esse tipo de conteúdo." : "Para ver aqui, é preciso permitir conteúdos incorporados de terceiros."; }
    $("[data-painel-fechar]").focus();
  }
  function fechar() { if (dlg.open) dlg.close(); }
  dlg.addEventListener("close", () => { document.body.classList.remove("no-scroll"); clearTimeout(tmo); if (abridor && document.contains(abridor)) abridor.focus(); });
  document.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-painel]"); if (b) { abrir(b, PAINEL); return; }
    const a = ev.target.closest("a[data-album]");
    if (a && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey) { ev.preventDefault(); abrir(a, ALBUM(a)); }
  });
  $("[data-painel-fechar]").addEventListener("click", fechar);
  dlg.addEventListener("click", (ev) => { if (ev.target === dlg) fechar(); });
  $("[data-painel-tentar]").addEventListener("click", carregar);
  $("[data-painel-permitir]").addEventListener("click", () => { salvarConsent(true, false); carregar(); });
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };

  /* ---------- Progresso de leitura e voltar ao topo ---------- */
  const bar = $(".progress__bar"), toTop = $(".to-top");
  let ticking = false;
  function onScroll() {
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.transform = `scaleX(${Math.min(1, p)})`;
    toTop.classList.toggle("is-visible", h.scrollTop > 900);
    ticking = false;
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  /* O alvo #topo é o cabeçalho fixo (sticky): o navegador rolaria só até a posição atual dele,
     subindo aos poucos a cada clique. Por isso a rolagem vai direto ao início da página. */
  toTop.addEventListener("click", (ev) => {
    ev.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    const t0 = Date.now();
    const fim = () => {
      if (window.scrollY > 2 && Date.now() - t0 < 1500) return requestAnimationFrame(fim);
      if (window.scrollY > 2) window.scrollTo(0, 0);
      $("#conteudo").focus({ preventScroll: true });
    };
    requestAnimationFrame(fim);
  });

  /* ---------- Entradas na rolagem (uma vez) ---------- */
  $$('[data-anim="stagger"]').forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty("--i", i)));
  const targets = $$('[data-anim], .draw-line, .section');
  if (animOn() && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in"); io.unobserve(en.target);
    }), { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    targets.forEach((t) => io.observe(t));
  } else {
    targets.forEach((t) => t.classList.add("is-in"));
  }

  /* ---------- Carrossel de logos das instituições integrantes ----------
     Rolagem nativa (funciona com toque, trackpad e teclado). Avança sozinho
     a cada 3 s, pausa com mouse/foco, fora da tela ou aba oculta, e não
     avança sozinho com "reduzir movimento" (WCAG 2.2.2: botão Pausar). */
  const lv = $("#logos-viewport");
  if (lv) {
    const tgl = $('[data-logos="toggle"]'), lbl = $(".logos__label", tgl);
    let playing = !reduceMotion, hover = false, visible = false, timer = null;
    const step = () => { const it = $(".logos__item", lv); return it ? it.getBoundingClientRect().width + 8 : 200; };
    const atEnd = () => lv.scrollLeft + lv.clientWidth >= lv.scrollWidth - 4;
    const go = (dir, amount) => {
      const beh = reduceMotion ? "auto" : "smooth";
      if (dir > 0 && atEnd()) lv.scrollTo({ left: 0, behavior: beh });
      else if (dir < 0 && lv.scrollLeft <= 4) lv.scrollTo({ left: lv.scrollWidth, behavior: beh });
      else lv.scrollBy({ left: dir * amount, behavior: beh });
    };
    const sync = () => {
      clearInterval(timer); timer = null;
      if (playing && !hover && visible && !document.hidden && lv.scrollWidth > lv.clientWidth + 4) timer = setInterval(() => go(1, step()), 3000);
      tgl.setAttribute("aria-pressed", String(!playing));
      tgl.classList.toggle("is-paused", !playing);
      lbl.textContent = playing ? "Pausar" : "Reproduzir";
    };
    tgl.addEventListener("click", () => { playing = !playing; sync(); });
    $('[data-logos="prev"]').addEventListener("click", () => go(-1, lv.clientWidth * .8));
    $('[data-logos="next"]').addEventListener("click", () => go(1, lv.clientWidth * .8));
    const box = lv.closest(".logos");
    box.addEventListener("mouseenter", () => { hover = true; sync(); });
    box.addEventListener("mouseleave", () => { hover = false; sync(); });
    box.addEventListener("focusin", () => { hover = true; sync(); });
    box.addEventListener("focusout", (e) => { if (!box.contains(e.relatedTarget)) { hover = false; sync(); } });
    lv.addEventListener("pointerdown", () => { playing = false; sync(); });
    document.addEventListener("visibilitychange", sync);
    if ("IntersectionObserver" in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; sync(); }).observe(lv);
    else { visible = true; }
    sync();
  }

  /* ---------- Consentimento de cookies (RF43) ----------
     Categorias propostas (a validar, PD02): Necessários e Conteúdo incorporado de terceiros
     (Power BI e YouTube). Sem cookies de métricas na Fase 1. A escolha fica no navegador. */
  const ck = $("#cookie"), ckPrefs = $("#cookie-prefs");
  const ckBtn = (n) => $(`[data-cookie="${n}"]`, ck);
  function ckShow() {
    ck.hidden = false; document.body.classList.add("has-cookie");
    const saved = consent(); if (saved) $("#ck-midia").checked = !!saved.midia;
  }
  function salvarConsent(midia, avisar = true) {
    const v = { midia, data: new Date().toISOString(), versao: "fase1-prototipo" };
    try { localStorage.setItem("mbe-consent", JSON.stringify(v)); } catch {}
    ck.hidden = true; ckPrefs.hidden = true; document.body.classList.remove("has-cookie");
    ckBtn("salvar").hidden = true; ckBtn("configurar").setAttribute("aria-expanded", "false");
    if (avisar) notify("Preferências salvas", `Conteúdo incorporado de terceiros: ${midia ? "permitido" : "recusado"}. Você pode mudar em "Preferências de cookies", no rodapé.`);
  }
  ckBtn("aceitar").addEventListener("click", () => salvarConsent(true));
  ckBtn("recusar").addEventListener("click", () => salvarConsent(false));
  ckBtn("configurar").addEventListener("click", () => {
    const open = ckPrefs.hidden;
    ckPrefs.hidden = !open; ckBtn("salvar").hidden = !open;
    ckBtn("configurar").setAttribute("aria-expanded", String(open));
    if (open) $("#ck-midia").focus();
  });
  ckBtn("salvar").addEventListener("click", () => salvarConsent($("#ck-midia").checked));
  $$('[data-cookie="abrir"]').forEach((b) => b.addEventListener("click", () => { ckShow(); ckPrefs.hidden = false; ckBtn("salvar").hidden = false; ckBtn("configurar").setAttribute("aria-expanded", "true"); $("#ck-midia").focus(); }));
  const params = new URLSearchParams(location.search);
  let hasConsent = false; try { hasConsent = !!localStorage.getItem("mbe-consent"); } catch {}
  if (params.has("cookies")) { try { localStorage.removeItem("mbe-consent"); } catch {} hasConsent = false; }
  if (!hasConsent && !params.has("semcookies")) ckShow();

  /* ---------- Histórico: um ano por página do caderno (RF52) ---------- */
  const hist = $("#caderno-anos");
  if (hist) {
    root.classList.add("js");
    const pags = $$(".hist__pag", hist), anos = pags.map((p) => p.dataset.ano).sort();
    const btAno = $$("[data-hist-ano]", hist), ant = $('[data-hist="ant"]', hist), prox = $('[data-hist="prox"]', hist), st = $("#hist-status");
    $(".hist__nav", hist).hidden = false;
    let atual = null;
    const mostrar = (ano, foco) => {
      if (!anos.includes(ano) || ano === atual) return;
      const k = anos.indexOf(ano);
      pags.forEach((p) => { const on = p.dataset.ano === ano; p.hidden = !on; p.classList.toggle("vira-in", on && atual !== null && !reduceMotion); });
      btAno.forEach((b) => { if (b.dataset.histAno === ano) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
      ant.disabled = k === 0; prox.disabled = k === anos.length - 1;
      ant.querySelector(".hist__seta-t").textContent = k > 0 ? `Ano anterior (${anos[k - 1]})` : "Ano anterior";
      prox.querySelector(".hist__seta-t").textContent = k < anos.length - 1 ? `Próximo ano (${anos[k + 1]})` : "Próximo ano";
      if (atual !== null) st.textContent = `Página de ${ano}`;
      const inicial = atual === null;
      atual = ano;
      if (foco) $(`#ano-${ano}`).focus({ preventScroll: true });
      if (!inicial) { try { history.replaceState(null, "", "#ano-" + ano); } catch {} }
    };
    btAno.forEach((b) => b.addEventListener("click", () => mostrar(b.dataset.histAno, true)));
    $(".hist__anos", hist).addEventListener("keydown", (ev) => {
      if (!["ArrowLeft", "ArrowRight"].includes(ev.key)) return;
      ev.preventDefault();
      const k = anos.indexOf(atual) + (ev.key === "ArrowRight" ? 1 : -1);
      if (anos[k]) { mostrar(anos[k]); btAno.find((b) => b.dataset.histAno === anos[k]).focus(); }
    });
    ant.addEventListener("click", () => mostrar(anos[anos.indexOf(atual) - 1], true));
    prox.addEventListener("click", () => mostrar(anos[anos.indexOf(atual) + 1], true));
    const h0 = (location.hash.match(/^#ano-(\d{4})$/) || [])[1];
    mostrar(h0 && anos.includes(h0) ? h0 : anos[anos.length - 1]);
  }

  /* ---------- Encontros territoriais: tabela ordenável (RF20) ---------- */
  const tab = $("#enc-tab");
  if (tab) {
    const tb = $("tbody", tab), ths = $$("th[aria-sort]", tab), est = $("#enc-status");
    const NOMES = { data: "data", municipio: "município", participantes: "participantes" };
    $$("[data-ordenar]", tab).forEach((b) => b.addEventListener("click", () => {
      const th = b.closest("th"), chave = b.dataset.ordenar;
      const dir = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
      ths.forEach((t) => t.setAttribute("aria-sort", "none")); th.setAttribute("aria-sort", dir);
      const val = (tr) => chave === "participantes" ? +tr.dataset.participantes : tr.dataset[chave];
      const rows = $$("tr", tb).sort((x, y) => { const a = val(x), c = val(y); const r = a < c ? -1 : a > c ? 1 : 0; return dir === "ascending" ? r : -r; });
      rows.forEach((r) => tb.append(r));
      est.textContent = `Tabela ordenada por ${NOMES[chave]}, ${dir === "ascending" ? (chave === "participantes" ? "do menor para o maior" : chave === "data" ? "da mais antiga para a mais recente" : "de A a Z") : (chave === "participantes" ? "do maior para o menor" : chave === "data" ? "da mais recente para a mais antiga" : "de Z a A")}.`;
    }));
  }

  /* ---------- PAR: nome do município no mapa e na lista (RF19) ---------- */
  const parMapa = $(".mapa-par--grande");
  if (parMapa) {
    const nomeEl = $("#par-nome"), itens = $$("#par-lista li");
    const marcar = (p) => {
      const n = p ? p.querySelector("title").textContent : "";
      $$("path.is-ativo", parMapa).forEach((x) => x.classList.remove("is-ativo"));
      itens.forEach((li) => li.classList.toggle("is-ativo", !!n && normz(li.textContent) === normz(n)));
      if (p) p.classList.add("is-ativo");
      nomeEl.textContent = n;
    };
    $$("path.par", parMapa).forEach((p) => {
      p.setAttribute("role", "img"); p.setAttribute("aria-label", p.querySelector("title").textContent);
      ["mouseenter", "focus"].forEach((t) => p.addEventListener(t, () => marcar(p)));
      p.addEventListener("click", () => marcar(p));
    });
    parMapa.addEventListener("mouseleave", () => { if (!parMapa.contains(document.activeElement)) marcar(null); });
  }

  /* ---------- Fale conosco: validação e envio simulado (RF40) ---------- */
  const fc = $("#form-contato");
  if (fc) {
    const ok = $("#fc-ok"), erros = $("#fc-erros"), msg = $("#fc-msg"), cont = $("#fc-msg-cont"), mun = $("#fc-mun");
    let cid = null; try { cid = sessionStorage.getItem("mbe-cidade"); } catch {}
    if (cid && !mun.value) { mun.value = cid; $("#fc-mun-ajuda").textContent = "Opcional. Preenchido com a cidade identificada pela localização que você autorizou; pode ser alterado."; }
    const fmt = (n) => n.toLocaleString("pt-BR");
    const conta = () => { const r = 2000 - msg.value.length; cont.textContent = r === 2000 ? "Até 2.000 caracteres." : `${fmt(r)} ${r === 1 ? "caractere restante" : "caracteres restantes"}.`; };
    msg.addEventListener("input", () => { clearTimeout(msg._t); msg._t = setTimeout(conta, 400); });
    const regras = [
      ["fc-nome", (v) => v.trim().length >= 2 ? "" : "Informe o seu nome."],
      ["fc-email", (v) => !v.trim() ? "Informe o seu e-mail." : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Informe um e-mail válido, como nome@exemplo.com.br.")],
      ["fc-msg", (v) => v.trim().length >= 10 ? "" : (v.trim() ? "Escreva uma mensagem com pelo menos 10 caracteres." : "Escreva a sua mensagem.")],
      ["fc-aceite", (_, el) => el.checked ? "" : "Para enviar, é preciso aceitar a Política de Privacidade."],
    ];
    const validar = (id) => {
      const [, f] = regras.find((r) => r[0] === id), el = $("#" + id), m = f(el.value, el);
      $(`#${id}-erro`).textContent = m; if (m) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
      return m;
    };
    /* Revalida só campos que já mostram erro: ao digitar (corrige na hora) e ao sair do campo, com atraso
       para que a mudança de altura não desloque o botão no meio de um clique. */
    regras.forEach(([id]) => {
      const el = $("#" + id), marcado = () => el.hasAttribute("aria-invalid") || $(`#${id}-erro`).textContent;
      if (id === "fc-aceite") { el.addEventListener("change", () => { if (marcado()) validar(id); }); return; }
      el.addEventListener("input", () => { if (marcado() && !regras.find((r) => r[0] === id)[1](el.value, el)) validar(id); });
      el.addEventListener("blur", () => { if (marcado()) setTimeout(() => validar(id), 250); });
    });
    let envios = 0;
    fc.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const lista = regras.map(([id]) => [id, validar(id)]).filter(([, m]) => m);
      if (lista.length) {
        erros.className = "form-contato__erros";
        erros.innerHTML = `<p>${lista.length === 1 ? "Corrija 1 campo" : `Corrija ${lista.length} campos`} para enviar:</p><ul>${lista.map(([id, m]) => `<li><a href="#${id}">${esc(m)}</a></li>`).join("")}</ul>`;
        erros.hidden = false; erros.focus();
        return;
      }
      if ($("#fc-site").value) return;                       // honeypot: robô preencheu o campo oculto
      if (++envios > 3) {                                    // limite de envios (no servidor, na implementação)
        erros.className = "form-contato__erros form-contato__erros--falha";
        erros.innerHTML = "<p>Muitas mensagens em pouco tempo.</p><ul><li>Aguarde alguns minutos e tente novamente.</li></ul>";
        erros.hidden = false; erros.focus(); return;
      }
      const bt = $('button[type="submit"]', fc); bt.setAttribute("aria-busy", "true"); bt.disabled = true; bt.textContent = "Enviando…";
      setTimeout(() => {
        bt.removeAttribute("aria-busy"); bt.disabled = false; bt.textContent = "Enviar mensagem";
        if (new URLSearchParams(location.search).has("falha")) {
          erros.className = "form-contato__erros form-contato__erros--falha";
          erros.innerHTML = '<p>Não foi possível enviar a mensagem agora.</p><ul><li>O que você escreveu foi mantido. Tente novamente em instantes ou escreva para <a href="mailto:bahiapelaeducacao@fieb.org.br">bahiapelaeducacao@fieb.org.br</a>.</li></ul>';
          erros.hidden = false; erros.focus(); return;
        }
        erros.hidden = true; fc.hidden = true; ok.hidden = false; ok.focus();
      }, 900);
    });
    $("#fc-nova").addEventListener("click", () => { fc.reset(); conta(); if (cid) mun.value = cid; ok.hidden = true; fc.hidden = false; $("#fc-nome").focus(); });
  }

  /* ---------- Notas de revisão: escondidas por padrão (protótipo revisado em 20/11/2026).
     Para a equipe consultar as notas, abra a página com ?revisao. ---------- */
  if (!/(^|[?&#])revisao/.test(location.search + location.hash)) document.body.classList.add("presentation");

  /* ---------- Notas de revisão (somente protótipo) ---------- */
  const rt = $("#review-toggle"), rp = $("#review-panel"), rg = $("#review-groups");
  const grupos = { confirmado: "Confirmado (documentos)", provisorio: "Provisório (a substituir)", ilustrativo: "Ilustrativo ou não validado" };
  const lists = {};
  Object.entries(grupos).forEach(([k, label]) => {
    const h = document.createElement("h3"); h.className = `rv--${k}`; h.innerHTML = `<i></i>${label}`;
    const ol = document.createElement("ol"); lists[k] = ol; rg.append(h, ol);
  });
  $$("[data-note]").forEach((el, i) => {
    const pin = document.createElement("span");
    pin.className = "review-pin"; pin.textContent = i + 1; pin.setAttribute("aria-hidden", "true");
    el.append(pin);
    const li = document.createElement("li");
    const n = document.createElement("span"); n.className = "review-num"; n.textContent = i + 1;
    const btn = document.createElement("button"); btn.type = "button"; btn.textContent = el.dataset.note;
    btn.addEventListener("click", () => el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }));
    li.append(n, btn); (lists[el.dataset.noteType] || lists.provisorio).append(li);
  });
  rt.addEventListener("click", () => {
    const on = !document.body.classList.contains("review-on");
    document.body.classList.toggle("review-on", on);
    rt.setAttribute("aria-pressed", String(on));
    rp.hidden = !on;
  });
  if (/(^|[?&#])revisao/.test(location.search + location.hash)) rt.click();
})();
