#!/usr/bin/env python3
"""Gera index.html a partir de src/index.template.html + data/navegacao.json.

A navegação vem de uma fonte única (data/navegacao.json), como virá do CMS/config
no Laravel. Também gera docs/rotas.md (destino de cada item do mapa).
Uso: python3 build.py
"""
import json, html, pathlib

ROOT = pathlib.Path(__file__).parent
nav = json.loads((ROOT / "data/navegacao.json").read_text(encoding="utf-8"))
municipios = json.loads((ROOT / "data/municipios-ba.json").read_text(encoding="utf-8"))
e = html.escape

CHEV = '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'

rotas = {}

def crumb(path):
    return " › ".join(path)

def item_link(it, path):
    label = it["label"]
    comp = it.get("complemento")
    full = path + [label + (f" — {comp}" if comp else "")]
    st = it["status"]
    if st == "futuro":
        return f'<span class="nav-future" aria-disabled="true">{e(label)}<span class="badge-future">Evolução futura</span></span>'
    cap = f'<span class="nav-cap"> — {e(comp)}</span>' if comp else ""
    rotas[it["url"]] = {"nome": crumb(full), "status": st}
    if st == "externo":
        return (f'<a href="{e(it["url"])}" data-pending>{e(label)}{cap}'
                f'<span class="badge-ext" aria-hidden="true">↗</span><span class="visually-hidden"> (painel externo)</span></a>')
    cur = ' aria-current="page"' if st == "home" else ""
    return f'<a href="{e(it["url"])}"{"" if st == "home" else " data-pending"}{cur}>{e(label)}{cap}</a>'

def l2_list(children, path, ind):
    out = []
    for c in children:
        s = f'{ind}<li class="nav-l2">{item_link(c, path)}'
        if c.get("filhos"):
            sub = "".join(f'<li>{item_link(g, path + [c["label"]])}</li>' for g in c["filhos"])
            s += f'<ul class="nav-l3">{sub}</ul>'
        out.append(s + "</li>")
    return "\n".join(out)

def desktop():
    lines = ['<ul class="nav-l1">']
    for i, top in enumerate(nav["principal"]):
        if "filhos" not in top:
            rotas[top["url"]] = {"nome": top["label"], "status": "home"}
            lines.append(f'  <li><a class="nav-l1__link" href="{top["url"]}" aria-current="page">{e(top["label"])}</a></li>')
            continue
        cls = "nav-l1__btn nav-l1__btn--cta" if top.get("destaque") else "nav-l1__btn"
        mid = f"mega-{i}"
        lines.append(f'  <li><button type="button" class="{cls}" aria-expanded="false" aria-controls="{mid}">{e(top["label"])}{CHEV}</button>')
        lines.append(f'    <div class="mega" id="{mid}" hidden><div class="wrap mega__inner">')
        lines.append(f'      <div class="mega__intro"><h2>{e(top["label"])}</h2><p>{e(top.get("descricao",""))}</p></div>')
        lines.append('      <ul class="mega__cols">')
        lines.append(l2_list(top["filhos"], [top["label"]], "        "))
        lines.append('      </ul></div></div></li>')
    lines.append("</ul>")
    return "\n".join(lines)

def mobile():
    lines = ['<ul class="m-l1">']
    for i, top in enumerate(nav["principal"]):
        if "filhos" not in top:
            lines.append(f'  <li><a class="m-l1__link" href="{top["url"]}" aria-current="page">{e(top["label"])}</a></li>')
            continue
        sid = f"msub-{i}"
        lines.append(f'  <li><button type="button" class="m-l1__btn" aria-expanded="false" aria-controls="{sid}">{e(top["label"])}{CHEV}</button>')
        lines.append(f'    <div class="m-sub" id="{sid}" hidden><ul>')
        lines.append(l2_list(top["filhos"], [top["label"]], "      "))
        lines.append('    </ul></div></li>')
    lines.append("</ul>")
    return "\n".join(lines)

def footer_map():
    cols = []
    for top in nav["principal"]:
        if "filhos" not in top:
            continue
        items = []
        for c in top["filhos"]:
            s = f'<li>{item_link(c, [top["label"]])}'
            if c.get("filhos"):
                s += "<ul>" + "".join(f'<li>{item_link(g, [top["label"], c["label"]])}</li>' for g in c["filhos"]) + "</ul>"
            items.append(s + "</li>")
        cols.append(f'<div class="f-col"><h2>{e(top["label"])}</h2><ul>{"".join(items)}</ul></div>')
    return "\n".join(cols)

def footer_legal():
    return "\n".join(f'<li>{item_link(it, ["Rodapé"])}</li>' for it in nav["rodape"])


# ------------------------------------------------------------------
# Dados (data/indicadores.json) e mapas (tools/geo.py)
# ------------------------------------------------------------------
import re, sys, hashlib
sys.path.insert(0, str(ROOT / "tools"))
import geo
def _slug(n): return re.sub(r"[^a-z0-9]+", "-", geo.norm(n)).strip("-")

D = json.loads((ROOT / "data/indicadores.json").read_text(encoding="utf-8"))

def br(v, dec=None):
    if isinstance(v, float) or dec:
        dec = 1 if dec is None else dec
        s = f"{v:,.{dec}f}"
    else:
        s = f"{v:,}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")

ica = D["ica_serie"]["pontos"]
metas = {m["ano"]: m["valor"] for m in D["ica_serie"]["metas_intermediarias"]}
ctx = dict(D)
ctx["ica_atual"] = ica[-1]
y_, m_, d_ = D["atualizado_em"].split("-")
ctx["atualizado_br"] = f"{d_}/{m_}/{y_}"
ideb = D["ideb"]["pontos"]
ctx["ideb"] = dict(D["ideb"], atual=br(ideb[-1]["valor"], 1), atual_ano=ideb[-1]["ano"],
                  anterior=br(ideb[0]["valor"], 1), anterior_ano=ideb[0]["ano"])
r = D["resultados"]
pct = r["municipios_representados"]["valor"] / r["municipios_representados"]["base"] * 100
ctx["reach_pct"] = f"{pct:.1f}"
ctx["reach_pct_txt"] = br(round(pct)) + "%"

# barras da série ICA
bars = []
for pnt in ica:
    m = metas.get(pnt["ano"])
    mk = f'<span class="trend__goal" style="--g:{m}%" title="Meta {pnt["ano"]}: {br(m,1)}%"></span>' if m else ""
    lab = f'Meta do ano: {br(m,1)}%' if m else "Sem meta intermediária publicada"
    cur = " trend__bar--now" if pnt is ica[-1] else ""
    bars.append(f'          <li class="trend__item"><span class="trend__col"><span class="trend__bar{cur}" style="--v:{pnt["valor"]}%"></span>{mk}</span>'
                f'<span class="trend__val">{pnt["valor"]}%</span><span class="trend__year">{pnt["ano"]}</span>'
                f'<span class="visually-hidden">. {lab}</span></li>')
ctx["ica_barras"] = "\n".join(bars)

dm = D["destaques_municipais"]["lista"]
ctx["destaques_botoes"] = "\n".join(f'          <button type="button" class="chip chip--dark" data-folha="{_slug(x["nome"])}">{e(x["nome"])} <b>{x["valor"]}%</b></button>' for x in dm[:3])

f = r["formacoes"]
colors = ["c1", "c2", "c3"]
ctx["formacoes_stack"] = "".join(f'<i class="stack__seg stack__seg--{colors[i]}" style="--w:{c["valor"]/f["valor"]*100:.2f}%"></i>' for i, c in enumerate(f["composicao"]))
ctx["formacoes_legend"] = "".join(f'<li><i class="stack__sw stack__sw--{colors[i]}"></i><b>{c["valor"]}</b> {e(c["rotulo"])}</li>' for i, c in enumerate(f["composicao"]))
ctx["satisfacao_dist"] = "".join(f'<li><span class="dist__n">{d["nota"]}</span><span class="dist__bar"><i style="--w:{d["pct"]}%"></i></span><span class="dist__p">{d["pct"]}%</span></li>' for d in r["satisfacao"]["distribuicao"])

# ---- mapas
od, ow, oh = geo.outline(300)
ctx["geo"] = {"outline_d": od, "outline_w": f"{ow:.0f}", "outline_h": f"{oh:.0f}"}

MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
def dt(iso):
    y, m, d = iso.split("-")
    return int(d), MESES[int(m) - 1], y
ag = D["encontros_2026"]["agenda"]
ctx["encontros_lista"] = ", ".join(a["cidade"] for a in ag[:-1]) + " e " + ag[-1]["cidade"]
ctx["encontros_datas"] = "".join(f'<li><b>{dt(a["data"])[0]:02d} {dt(a["data"])[1]}</b> {e(a["cidade"])}</li>' for a in ag)
ctx["par_citados"] = ", ".join(D["par"]["municipios_citados"])
ctx["premio_ouro"] = ", ".join(D["premio"]["primeira_edicao"]["ouro"][:-1]) + " e " + D["premio"]["primeira_edicao"]["ouro"][-1]

def results_map():
    W = 560
    muns, w, h = geo.municipios(W)
    norm = geo.norm
    par = {norm(x) for x in D["par"]["municipios_citados"]}
    ouro = {norm(x) for x in D["premio"]["primeira_edicao"]["ouro"]}
    polos = [a["cidade"] for a in ag]
    hubs = [geo.centroid(c, W) for c in polos]
    paths = []
    for m in muns:
        n = norm(m["nome"])
        cls, tip = "", ""
        if n in ouro: cls, tip = " is-ouro", " — Prêmio Município Alfabetizador, categoria Ouro (1ª edição)"
        elif n in par: cls, tip = " is-par", " — atendido pelo PAR (citado em notícia da FIEB)"
        dist = min(((m["c"][0]-hx)**2 + (m["c"][1]-hy)**2) ** .5 for hx, hy in hubs)
        st = f' style="--d:{min(dist/300,1):.2f}"' if cls else ""
        paths.append(f'<path class="mun{cls}"{st} d="{m["d"]}"><title>{e(m["nome"])}{tip}</title></path>')
    sd, _, _ = geo.outline(W)
    pins = []
    for i, (c, (x, y)) in enumerate(zip(polos, hubs)):
        anchor = {"Feira de Santana": "end", "Vitória da Conquista": "end", "Eunápolis": "end"}.get(c, "start")
        dx = -10 if anchor == "end" else 10
        pins.append(f'<g class="pin" style="--i:{i}"><circle cx="{x:.1f}" cy="{y:.1f}" r="6.5"/><text x="{x+dx:.1f}" y="{y+4.5:.1f}" text-anchor="{anchor}">{e(c)}</text></g>')
    return (f'<svg class="reach__svg" viewBox="-70 -4 {w+150:.0f} {h+8:.0f}" role="img" aria-label="Mapa da Bahia com as 7 cidades-sede dos Encontros Territoriais de 2026, municípios atendidos pelo PAR citados em notícias e os 3 municípios vencedores da categoria Ouro do Prêmio.">'
            f'<g class="reach__muns">{"".join(paths)}</g><path class="reach__state" d="{sd}"/><g class="reach__pins">{"".join(pins)}</g></svg>')

def doc_map():
    d, w, h = geo.outline(220)
    x, y = geo.centroid("Quixabeira", 220)
    return (f'<svg class="doc__map" viewBox="-6 -6 {w+12:.0f} {h+12:.0f}" aria-hidden="true"><path d="{d}"/>'
            f'<circle class="doc__ring" cx="{x:.1f}" cy="{y:.1f}" r="11"/><circle cx="{x:.1f}" cy="{y:.1f}" r="4.5"/></svg>')

# ---- valores de exemplo por município (consulta demonstrativa)
top = {x["nome"]: x["valor"] for x in dm}
exemplos = {}
for nome in municipios:
    if nome in top:
        exemplos[nome] = {"v": top[nome], "o": "lovable"}
    else:
        hsh = int(hashlib.sha1(nome.encode()).hexdigest(), 16)
        exemplos[nome] = {"v": 30 + hsh % 57, "o": "exemplo"}
dados_js = {"meta": D["meta"]["valor"], "metaAno": D["meta"]["ano"], "ano": D["destaques_municipais"]["ano"],
            "estado": ica[-1]["valor"], "municipios": exemplos, "rotulo": D["rotulo_ilustrativo"]}


# ---------- v3: mapa da capa e dados das folhas dos municípios ----------
import math as _m
_MES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"]
def _dl(s): y, mo, d = s.split("-"); return f"{int(d)} {_MES[int(mo)-1]} {y}"
def capa_e_folhas():
    muns, w, h = geo.municipios(520, tol=0.006)
    od, _, _ = geo.outline(520)
    N = {geo.norm(x["nome"]): x for x in muns}
    par = {geo.norm(x) for x in D["par"]["municipios_citados"]}
    ouro = {geo.norm(x) for x in D["premio"]["primeira_edicao"]["ouro"]}
    icam = {geo.norm(x["nome"]): x["valor"] for x in D["destaques_municipais"]["lista"]}
    sedes = [(geo.norm(a["cidade"]), a["cidade"], a["data"]) for a in D["encontros_2026"]["agenda"]]
    folhas, paths = {}, []
    for x in muns:
        k = geo.norm(x["nome"]); s_ = _slug(x["nome"]); lx, ly = x["lonlat"]
        best = min(sedes, key=lambda t: ((lx - N[t[0]]["lonlat"][0]) * _m.cos(_m.radians(-12))) ** 2 + (ly - N[t[0]]["lonlat"][1]) ** 2)
        bx, by = N[best[0]]["lonlat"]
        km = round(_m.sqrt(((lx - bx) * _m.cos(_m.radians(-12))) ** 2 + (ly - by) ** 2) * 111)
        r = {"n": x["nome"], "par": k in par, "ouro": k in ouro, "ica": icam.get(k),
             "sede": next((_dl(d) for kk, _, d in sedes if kk == k), None), "prox": [best[1], _dl(best[2]), km], "doc": k == "quixabeira"}
        folhas[s_] = r
        tem = r["par"] or r["ouro"] or r["ica"] is not None or r["sede"] or r["doc"]
        paths.append(f'<path d="{x["d"]}" data-m="{s_}"{' class="tem"' if tem else ""}><title>{e(x["nome"])}</title></path>')
    svg = (f'<svg id="capa-svg" viewBox="0 0 {w:.0f} {h:.0f}" role="img" aria-label="Mapa dos 417 municípios da Bahia. Para escolher pelo teclado, use o campo de busca.">'
           '<defs><pattern id="hach" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><line x1="0" y1="0" x2="0" y2="5" stroke="#2A4CA5" stroke-width="1.3"/></pattern></defs>'
           f'<g id="capa-muns">{"".join(paths)}</g><path class="capa__contorno" pathLength="1" d="{od}"/></svg>')
    extra = {"premio2": _dl(D["premio"]["segunda_edicao"]["data"]), "ica": ica[-1]["valor"], "meta": D["meta"]["valor"], "dist": D["distancia_meta"]["valor"], "data": ctx["atualizado_br"]}
    return svg, json.dumps({"m": folhas, "x": extra}, ensure_ascii=False, separators=(",", ":"))
CAPA_SVG, FOLHAS_JSON = capa_e_folhas()

def lookup(path):
    cur = ctx
    for k in path.split("."):
        cur = cur[k]
    return cur

def fill(txt):
    txt = txt.replace("{{RESULTS_MAP}}", results_map()).replace("{{DOC_MAP}}", doc_map())
    txt = txt.replace("{{DADOS_JSON}}", json.dumps(dados_js, ensure_ascii=False))
    txt = txt.replace("{{CAPA_MAP}}", CAPA_SVG).replace("{{FOLHAS_JSON}}", FOLHAS_JSON)
    def rep(m):
        key = m.group(1)
        if key.startswith("fmt:"):
            v = lookup(key[4:])
            return br(v)
        if key in ("NAV_DESKTOP", "NAV_MOBILE", "FOOTER_MAP", "FOOTER_LEGAL", "MUNICIPIOS", "ROTAS_JSON"):
            return m.group(0)
        v = lookup(key)
        return str(v)
    return re.sub(r"\{\{([a-zA-Z_:.0-9]+)\}\}", rep, txt)

tpl = fill((ROOT / "src/index.template.html").read_text(encoding="utf-8"))
d, m, f, fl = desktop(), mobile(), footer_map(), footer_legal()
# rotas extras citadas apenas em chamadas da home
extras = {
    "/acessibilidade": "Rodapé › Acessibilidade",
    "/busca": "Resultados da busca",
    "#instagram": "Perfil do Movimento no Instagram",
    "/nossas-acoes/formacoes/alfabetizacao-inclusiva": "Nossas ações › Nossas formações › Curso de Alfabetização Inclusiva (página da formação, modelo RF18)",
}
for k, v in extras.items():
    rotas.setdefault(k, {"nome": v, "status": "pendente"})
out = (tpl.replace("{{NAV_DESKTOP}}", d).replace("{{NAV_MOBILE}}", m)
          .replace("{{FOOTER_MAP}}", f).replace("{{FOOTER_LEGAL}}", fl)
          .replace("{{MUNICIPIOS}}", "".join(f'<option value="{e(x)}">' for x in municipios))
          .replace("{{ROTAS_JSON}}", json.dumps(rotas, ensure_ascii=False)))
(ROOT / "index.html").write_text(out, encoding="utf-8")

# docs/rotas.md
def walk(items, path, depth, rows):
    for it in items:
        name = it["label"] + (f" — {it['complemento']}" if it.get("complemento") else "")
        rows.append((depth, name, it.get("url") or "—", it.get("status"), " › ".join(path)))
        if it.get("filhos"):
            walk(it["filhos"], path + [it["label"]], depth + 1, rows)
rows = []
walk(nav["principal"], [], 0, rows)
walk(nav["rodape"], ["Rodapé"], 1, rows)
st = {"home": "Implementada (esta etapa)", "pendente": "Destino definido · etapa posterior", "externo": "Link externo · URL do BI a fornecer", "futuro": "Evolução futura · sem página", None: ""}
md = ["# Rotas e destinos — gerado por build.py a partir de data/navegacao.json", "",
      "| Nível | Item do mapa | Rota prevista | Situação |", "|---|---|---|---|"]
for depth, name, url, s, path in rows:
    lvl = "1" if depth == 0 else str(depth + 1)
    label = ("&nbsp;&nbsp;" * depth) + name
    md.append(f"| {lvl if path != 'Rodapé' else 'Rodapé'} | {label} | `{url}` | {st.get(s, s) if s else 'Grupo de menu (sem página própria)'} |")
(ROOT / "docs/rotas.md").write_text("\n".join(md) + "\n", encoding="utf-8")
print("ok:", len(rotas), "rotas")
