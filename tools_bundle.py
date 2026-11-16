#!/usr/bin/env python3
"""Gera dist/previa-home-movimento.html: arquivo único (CSS, JS, fontes e imagens embutidos)
apenas para revisão rápida. O código-fonte de referência é index.html + assets/."""
import re, base64, pathlib
R = pathlib.Path(__file__).parent
html = (R/"index.html").read_text(encoding="utf-8")
def data_uri(p):
    p = R/p; ext = p.suffix[1:]
    mime = {"svg":"image/svg+xml","png":"image/png","woff2":"font/woff2","jpg":"image/jpeg","jpeg":"image/jpeg"}[ext]
    return f"data:{mime};base64,{base64.b64encode(p.read_bytes()).decode()}"
def css(p):
    t = (R/p).read_text(encoding="utf-8")
    return re.sub(r'url\("\.\./fonts/([^"]+)"\)', lambda m: f'url("{data_uri("assets/fonts/"+m.group(1))}")', t)
html = re.sub(r'<link rel="stylesheet" href="(assets/css/[^"]+)">', lambda m: f"<style>{css(m.group(1))}</style>", html)
html = re.sub(r'<script src="(assets/js/[^"]+)" defer></script>', lambda m: "<script>" + (R/m.group(1)).read_text(encoding="utf-8") + "</script>", html)
html = re.sub(r'(src|href)="(assets/(?:brand|img)/[^"]+)"', lambda m: f'{m.group(1)}="{data_uri(m.group(2))}"', html)
(R/"dist").mkdir(exist_ok=True)
(R/"dist/previa-home-movimento.html").write_text(html, encoding="utf-8")
print("ok", len(html)//1024, "KB")
