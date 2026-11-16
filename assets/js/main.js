/* Movimento Bahia pela Educação — comportamentos da home (protótipo v3)
   Sem dependências. Blocos independentes para migrar para módulos (Vite) no Laravel.
   Dados: window.MBE_DADOS (gerado de data/indicadores.json). Rotas: window.ROTAS. */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const ROTAS = window.ROTAS || {};
  const DADOS = window.MBE_DADOS || {};
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

  /* ---------- Links para a própria home ---------- */
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest('a[href="/"]');
    if (!a) return;
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
      notify(nome, "Página prevista para etapa posterior. Destino:", href);
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

  /* ---------- Busca (demonstrativa) ---------- */
  const btnBusca = $("#btn-busca"), painelBusca = $("#painel-busca"), campo = $("#campo-busca");
  function closeSearch() { painelBusca.hidden = true; btnBusca.setAttribute("aria-expanded", "false"); }
  btnBusca.addEventListener("click", () => {
    const open = btnBusca.getAttribute("aria-expanded") === "true";
    closeAllMega();
    if (open) { closeSearch(); return; }
    painelBusca.hidden = false; btnBusca.setAttribute("aria-expanded", "true"); campo.focus();
  });
  painelBusca.addEventListener("keydown", (ev) => { if (ev.key === "Escape") { closeSearch(); btnBusca.focus(); } });
  $$("[data-sugestao]").forEach((c) => c.addEventListener("click", () => { campo.value = c.dataset.sugestao; campo.focus(); }));
  $("#form-busca").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const q = campo.value.trim();
    if (!q) { campo.focus(); notify("Digite um termo para buscar", ""); return; }
    notify(`Busca por “${q}”`, "A página de resultados, com filtros por tipo, tema e município, chega com a versão dinâmica. Destino:", `/busca?q=${encodeURIComponent(q)}`);
  });

  /* ---------- v3: folha do município ----------
     Dados: window.MBE_FOLHAS (gerado por build.py a partir de indicadores.json e da malha IBGE).
     Mostra só o que foi publicado; sem dado, a folha diz isso. Endereço próprio: ?municipio=slug */
  const F = window.MBE_FOLHAS || { m: {}, x: {} }, FM = F.m, FX = F.x;
  const normz = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const porNome = {}; Object.entries(FM).forEach(([k, v]) => { porNome[normz(v.n)] = k; });
  const acharSlug = (txt) => { const v = normz(txt); if (!v) return null; if (porNome[v]) return porNome[v]; const k = Object.keys(porNome).find((n) => n.startsWith(v)); return k ? porNome[k] : null; };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const svgCapa = $("#capa-svg");
  function localizador(s) {
    const p = svgCapa && svgCapa.querySelector(`path[data-m="${s}"]`); if (!p) return "";
    const b = p.getBBox();
    return `<svg class="loc" viewBox="${svgCapa.getAttribute("viewBox")}" aria-hidden="true"><path d="${svgCapa.querySelector(".capa__contorno").getAttribute("d")}"/><path class="m" d="${p.getAttribute("d")}"/><circle cx="${b.x + b.width / 2}" cy="${b.y + b.height / 2}" r="${Math.max(b.width, b.height) / 2 + 16}"/></svg>`;
  }
  function regua(nome, valor, rotulo) {
    const mun = valor == null ? "" : `<div class="regua__mark regua__mark--mun regua__mark--up" style="left:${Math.min(valor, 99.5)}%"><span>${esc(rotulo || nome)}</span></div>`;
    return `<div class="regua" role="img" aria-label="Régua: ${valor == null ? "" : esc(rotulo || nome) + ", "}Bahia ${FX.ica}%, meta ${FX.meta}%">
      <div class="regua__bahia" style="width:${FX.ica}%"></div>
      <div class="regua__mark regua__mark--down" style="left:${FX.ica}%"><span>Bahia ${FX.ica}%</span></div>
      <div class="regua__mark regua__mark--down" style="left:${FX.meta}%"><span>Meta ${FX.meta}%</span></div>${mun}</div>`;
  }
  function folhaHTML(s) {
    const m = FM[s], n = esc(m.n), fontes = [];
    let como;
    if (m.ica != null) {
      const dif = m.ica - FX.ica;
      como = `<p class="grande">${m.ica}%<small>ICA 2025</small></p><p class="nota nota--red escreve">${dif >= 0 ? dif + " p.p. acima" : -dif + " p.p. abaixo"} da média da Bahia!</p>${regua(m.n, m.ica, m.n + " " + m.ica + "%")}`;
      fontes.push("ICA municipal: modelo Lovable, a validar com o BI");
    } else if (m.ouro) {
      como = `<p class="grande">70%<small>ou mais · nível 4 do ICA</small></p><p class="nota nota--red escreve">já passou da média da Bahia!</p>${regua(m.n, 70, m.n + " ≥ 70%")}<p>Critério do nível Ouro na 1ª edição do Prêmio. O valor exato do município ainda não está no portal.</p>`;
    } else {
      como = `<p class="nota escreve">Ainda não temos o ICA de ${n} no portal.</p>${regua(m.n, null)}<p>Quando o Observatório estiver conectado, o indicador do município aparece aqui. Até lá, a referência é a Bahia: faltam ${FX.dist} p.p. para a meta.</p>`;
    }
    const it = [];
    if (m.ouro) { it.push(`<li class="ok"><span><strong>Prêmio, nível Ouro, na 1ª edição</strong><small>70% ou mais das crianças alfabetizadas (nível 4 do ICA)</small></span></li>`); fontes.push("Prêmio: Portal FIEB"); }
    if (m.doc) it.push(`<li class="ok"><span><strong>Inspirou o Doc de Quixabeira</strong><small><a href="/conhecimento-para-transformar/doc-de-quixabeira" data-pending>Assistir ao documentário</a></small></span></li>`);
    if (m.par) { it.push(`<li class="ok"><span><strong>Professores no PAR</strong><small>Município citado pela FIEB entre os participantes</small></span></li>`); fontes.push("PAR: Portal FIEB (lista parcial)"); }
    if (m.sede) it.push(`<li class="ok"><span><strong>Sediou um encontro territorial</strong><small>${esc(m.sede)}</small></span></li>`);
    if (!m.par) it.push(`<li class="vazio"><span>PAR: ainda sem registro<small>A lista publicada de municípios é parcial</small></span></li>`);
    if (!m.sede) it.push(`<li class="info"><span>Encontro territorial mais próximo em 2026: <strong>${esc(m.prox[0])}</strong><small>${esc(m.prox[1])} (realizado) · cerca de ${m.prox[2]} km em linha reta</small></span></li>`);
    fontes.push("Encontros 2026: Portal FIEB");
    const nota = (m.ouro || (m.ica != null && m.ica >= 70)) ? "exemplo para a Bahia!" : (m.par || m.sede ? "vamos juntos até 2030" : "a próxima página é nossa");
    return `<div class="folha__topo"><b>Folha do município</b><span class="hand escreve">Data: ${esc(FX.data)}</span></div>
      <div class="folha__id"><div><h2 id="folha-nome" class="folha__nome" tabindex="-1">${n}</h2><p class="folha__sub">O que o Movimento já fez com ${n} e o que vem a seguir.</p></div>${localizador(s)}</div>
      <div class="folha__grid"><div>
        <section class="licao"><h3><span class="hand">1.</span> Como estamos</h3>${como}</section>
        <section class="licao"><h3><span class="hand">2.</span> O que já fizemos juntos</h3><ul class="check">${it.join("")}</ul></section>
      </div><aside class="lado">
        <p class="nota nota--red escreve" style="--d:.8s">${nota}</p>
        <section class="licao"><h3><span class="hand">3.</span> Próxima lição</h3><div class="proxima">
          <span class="hand">27/11</span><p><strong>Prêmio, 2ª edição</strong><br>Cerimônia de premiação · <a href="/nossas-acoes/premio" data-pending>Conheça o Prêmio</a></p>
          <span class="hand">2027</span><p><strong>Encontros territoriais</strong><br>Datas a divulgar · <a href="/agenda-e-noticias/agenda" data-pending>Agenda</a></p></div></section>
        <section class="licao"><h3><span class="hand">4.</span> Para estudar</h3><ul>
          <li><a href="/conhecimento-para-transformar/caderno-de-boas-praticas" data-pending>Caderno de boas práticas</a></li>
          <li><a href="/nossas-acoes/formacoes/par" data-pending>PAR: aulas e conteúdos</a></li>
          <li><a href="/conhecimento-para-transformar/biblioteca" data-pending>Biblioteca</a></li>
          <li><a href="/participe/inscricoes" data-pending>Inscrições</a></li></ul></section>
      </aside></div>
      <div class="folha__pe"><button class="btn btn--ghost" type="button" data-folha-acao="copiar">Copiar o link desta folha</button><button class="btn btn--ghost" type="button" data-folha-acao="outro">Escolher outro município</button>
        <p class="folha__fontes">Fontes: ${[...new Set(fontes)].join(" · ")}. Onde não há dado publicado, a folha diz isso.</p></div>`;
  }
  function abrirFolha(s, opts = {}) {
    if (!FM[s]) return false;
    $("#folha-conteudo").innerHTML = folhaHTML(s);
    const sec = $("#folha"); sec.hidden = false;
    $$("#capa-muns path.sel").forEach((p) => p.classList.remove("sel"));
    const p = $(`#capa-muns path[data-m="${s}"]`); if (p) p.classList.add("sel");
    $("#capa-mun").value = FM[s].n; $("#capa-aviso").textContent = "";
    if (!opts.semUrl) { try { history.replaceState(null, "", "?municipio=" + s + "#folha"); } catch {} }
    sec.scrollIntoView({ behavior: reduceMotion || opts.instant ? "auto" : "smooth", block: "start" });
    $("#folha-nome").focus({ preventScroll: true });
    return true;
  }
  window.MBE_abrirFolha = abrirFolha;
  $("#folha").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-folha-acao]"); if (!b) return;
    if (b.dataset.folhaAcao === "copiar") {
      const u = location.href;
      (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => notify("Link copiado", "Este endereço abre direto a folha do município:", u), () => notify("Link desta folha", "Copie o endereço abaixo:", u));
    } else { $("#capa").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); const c = $("#capa-mun"); c.focus({ preventScroll: true }); c.select(); }
  });
  $("#form-capa").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const c = $("#capa-mun"), v = normz(c.value);
    if (!v) { $("#capa-aviso").textContent = "Digite o nome de um município da Bahia."; c.focus(); return; }
    const varios = porNome[v] ? [] : Object.keys(porNome).filter((n) => n.startsWith(v));
    if (varios.length > 1) {
      $("#capa-aviso").innerHTML = `${varios.length} municípios começam assim: ` + varios.slice(0, 6).map((n) => `<button type="button" class="capa__opcao" data-folha="${porNome[n]}">${esc(FM[porNome[n]].n)}</button>`).join(" · ") + (varios.length > 6 ? " …" : "");
      return;
    }
    const s = acharSlug(c.value);
    if (!s) { $("#capa-aviso").textContent = `Não encontramos “${c.value}” entre os 417 municípios.`; c.focus(); return; }
    abrirFolha(s);
  });
  document.addEventListener("click", (ev) => { const b = ev.target.closest("[data-folha]"); if (b) abrirFolha(b.dataset.folha); });
  const tip = $("#capa-tip"), fig = $(".capa__mapa"), gm = $("#capa-muns");
  if (gm) {
    gm.addEventListener("click", (ev) => { const s = ev.target.dataset && ev.target.dataset.m; if (s) abrirFolha(s); });
    gm.addEventListener("mousemove", (ev) => {
      const s = ev.target.dataset && ev.target.dataset.m; if (!s) { tip.hidden = true; return; }
      const r = fig.getBoundingClientRect(); tip.textContent = FM[s].n; tip.style.left = (ev.clientX - r.left) + "px"; tip.style.top = (ev.clientY - r.top) + "px"; tip.hidden = false;
    });
    gm.addEventListener("mouseleave", () => { tip.hidden = true; });
  }
  /* consulta da lição 2: também abre a folha */
  const formMun = $("#form-municipio"), campoMun = $("#municipio");
  formMun.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const s = acharSlug(campoMun.value);
    if (!campoMun.value.trim()) { campoMun.focus(); notify("Informe um município", "Comece a digitar e escolha um dos 417 municípios da Bahia."); return; }
    if (!s) { campoMun.focus(); notify("Município não encontrado", "Escolha um nome da lista de municípios da Bahia."); return; }
    abrirFolha(s);
  });
  const q0 = new URLSearchParams(location.search).get("municipio");
  if (q0 && FM[q0]) requestAnimationFrame(() => abrirFolha(q0, { semUrl: true, instant: true }));

  /* ---------- Acessibilidade: fonte e contraste ---------- */
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
  const applyFont = (v) => { root.dataset.font = v; $$("[data-font]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.font === v))); };
  const applyContrast = (on) => { root.classList.toggle("high-contrast", on); $("[data-contrast]").setAttribute("aria-pressed", String(on)); };
  applyFont(store.get("mbe-font") || "0");
  applyContrast(store.get("mbe-contrast") === "1");
  $$("[data-font]").forEach((b) => b.addEventListener("click", () => { applyFont(b.dataset.font); store.set("mbe-font", b.dataset.font); }));
  $("[data-contrast]").addEventListener("click", () => { const on = !root.classList.contains("high-contrast"); applyContrast(on); store.set("mbe-contrast", on ? "1" : "0"); });

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
  toTop.addEventListener("click", () => { setTimeout(() => $("#conteudo").focus({ preventScroll: true }), reduceMotion ? 0 : 500); });

  /* ---------- Contagem animada (valor final sempre no DOM e para leitores de tela) ---------- */
  $$(".count").forEach((el) => {
    const finalTxt = el.textContent;
    const sr = document.createElement("span"); sr.className = "visually-hidden"; sr.textContent = finalTxt;
    el.setAttribute("aria-hidden", "true"); el.after(sr);
    el.dataset.final = finalTxt;
  });
  function countUp(el) {
    const to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec || "0", 10);
    const t0 = performance.now(), dur = 1100;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = br(to * e, dec);
      if (k < 1) requestAnimationFrame(step); else el.textContent = el.dataset.final;
    };
    requestAnimationFrame(step);
  }

  /* ---------- Entradas na rolagem (uma vez) ---------- */
  $$('[data-anim="stagger"]').forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty("--i", i)));
  const targets = $$('[data-anim], .draw-line, .section, .numbers, .front');
  if (animOn() && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      if (en.target.classList.contains("numbers")) $$(".count", en.target).forEach(countUp);
      io.unobserve(en.target);
    }), { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    targets.forEach((t) => io.observe(t));
  } else {
    targets.forEach((t) => t.classList.add("is-in"));
  }

  /* ---------- Caminhos por público (abas acessíveis) ---------- */
  const tabs = $$('.paths [role="tab"]');
  function selectTab(t, focus) {
    tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute("aria-selected", String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) t.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (ev) => {
      const k = ev.key;
      let n = null;
      if (k === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      else if (k === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (k === "Home") n = tabs[0];
      else if (k === "End") n = tabs[tabs.length - 1];
      if (n) { ev.preventDefault(); selectTab(n, true); }
    });
  });

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

  /* ---------- Consentimento de cookies (RF43) — demonstrativo ----------
     A escolha fica só neste navegador. Na versão dinâmica, o registro do
     consentimento (data, versão da política, categorias) vai para o backend. */
  const ck = $("#cookie"), ckPrefs = $("#cookie-prefs");
  const ckBtn = (n) => $(`[data-cookie="${n}"]`, ck);
  function ckShow() {
    ck.hidden = false; document.body.classList.add("has-cookie");
    const saved = (() => { try { return JSON.parse(localStorage.getItem("mbe-consent") || "null"); } catch { return null; } })();
    if (saved) { $("#ck-metricas").checked = !!saved.metricas; $("#ck-midia").checked = !!saved.midia; }
  }
  function ckSave(metricas, midia) {
    const v = { metricas, midia, data: new Date().toISOString(), versao: "prototipo-1" };
    try { localStorage.setItem("mbe-consent", JSON.stringify(v)); } catch {}
    ck.hidden = true; ckPrefs.hidden = true; document.body.classList.remove("has-cookie");
    ckBtn("salvar").hidden = true; ckBtn("configurar").setAttribute("aria-expanded", "false");
    notify("Preferências salvas", `Métricas: ${metricas ? "permitidas" : "recusadas"} · Conteúdos externos: ${midia ? "permitidos" : "recusados"}. Você pode mudar em "Preferências de cookies", no rodapé.`);
  }
  ckBtn("aceitar").addEventListener("click", () => ckSave(true, true));
  ckBtn("recusar").addEventListener("click", () => ckSave(false, false));
  ckBtn("configurar").addEventListener("click", () => {
    const open = ckPrefs.hidden;
    ckPrefs.hidden = !open; ckBtn("salvar").hidden = !open;
    ckBtn("configurar").setAttribute("aria-expanded", String(open));
    if (open) $("#ck-metricas").focus();
  });
  ckBtn("salvar").addEventListener("click", () => ckSave($("#ck-metricas").checked, $("#ck-midia").checked));
  $('[data-cookie="abrir"]').addEventListener("click", () => { ckShow(); ckPrefs.hidden = false; ckBtn("salvar").hidden = false; ckBtn("configurar").setAttribute("aria-expanded", "true"); $("#ck-metricas").focus(); });
  const params = new URLSearchParams(location.search);
  let hasConsent = false; try { hasConsent = !!localStorage.getItem("mbe-consent"); } catch {}
  if (params.has("cookies")) { try { localStorage.removeItem("mbe-consent"); } catch {} hasConsent = false; }
  if (!hasConsent && !params.has("semcookies")) ckShow();

  /* ---------- Modo apresentação: ?apresentacao esconde a ferramenta de notas ---------- */
  if (params.has("apresentacao")) document.body.classList.add("presentation");

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
