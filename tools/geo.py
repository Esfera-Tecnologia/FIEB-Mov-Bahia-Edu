"""Gera fragmentos SVG da Bahia a partir da malha municipal do IBGE
(data/geo/ba-municipios-ibge.geojson — via geodata-br, licença CC0).
Usado por build.py. Representação geográfica real; simplificação leve para web."""
import json, math, pathlib, unicodedata
from shapely.geometry import shape, mapping
from shapely.ops import unary_union

ROOT = pathlib.Path(__file__).resolve().parent.parent
GJ = json.loads((ROOT / "data/geo/ba-municipios-ibge.geojson").read_text(encoding="utf-8"))

def norm(s):
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")

from shapely.validation import make_valid
feats = [(f["properties"]["id"], f["properties"]["name"], make_valid(shape(f["geometry"])).buffer(0)) for f in GJ["features"]]
state = unary_union([g.buffer(0.0005) for _, _, g in feats]).buffer(-0.0005).simplify(0.006)
minx, miny, maxx, maxy = state.bounds
lat0 = math.radians((miny + maxy) / 2)
kx = math.cos(lat0)

def proj_factory(width):
    s = width / ((maxx - minx) * kx)
    h = (maxy - miny) * s
    return (lambda x, y: ((x - minx) * kx * s, (maxy - y) * s)), width, h

def ring_d(coords, P):
    pts = [P(x, y) for x, y in coords]
    return "M" + "L".join(f"{a:.1f} {b:.1f}" for a, b in pts) + "Z"

def geom_d(g, P):
    polys = [g] if g.geom_type == "Polygon" else list(g.geoms)
    out = []
    for p in polys:
        out.append(ring_d(p.exterior.coords, P))
        for i in p.interiors:
            out.append(ring_d(i.coords, P))
    return "".join(out)

def centroid(nome, width):
    P, _, _ = proj_factory(width)
    for _, n, g in feats:
        if norm(n) == norm(nome):
            c = g.representative_point()
            return P(c.x, c.y)
    raise KeyError(nome)

def outline(width):
    P, w, h = proj_factory(width)
    return geom_d(state, P), w, h

def municipios(width, tol=0.008):
    P, w, h = proj_factory(width)
    out = []
    for cod, nome, g in feats:
        gs = g.simplify(tol, preserve_topology=True)
        c = g.representative_point()
        out.append({"cod": cod, "nome": nome, "d": geom_d(gs, P), "c": P(c.x, c.y), "lonlat": (c.x, c.y)})
    return out, w, h

def nearest_set(hubs, n):
    """Seleção determinística para SIMULAÇÃO: os n municípios mais próximos das cidades-polo,
    distribuídos em rodízio entre os polos."""
    pts = {cod: (g.representative_point().x, g.representative_point().y) for cod, _, g in feats}
    names = {norm(nm): cod for cod, nm, _ in feats}
    hub_codes = [names[norm(h)] for h in hubs]
    queues = []
    for hc in hub_codes:
        hx, hy = pts[hc]
        queues.append(sorted(pts, key=lambda c: (pts[c][0] - hx) ** 2 * kx * kx + (pts[c][1] - hy) ** 2))
    chosen, i = [], 0
    while len(chosen) < n:
        q = queues[i % len(queues)]
        while q and q[0] in chosen:
            q.pop(0)
        if q:
            chosen.append(q.pop(0))
        i += 1
    return chosen
