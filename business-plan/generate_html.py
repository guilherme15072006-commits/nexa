"""
Generate professional print-ready HTML from NEXA business plan markdown files.
Output: NEXA-Business-Plan.html and NEXA-Executive-Summary.html.
Open in Chrome → Print → Save as PDF for institutional PDF.
"""

import re
import sys
from pathlib import Path

try:
    import markdown
except ImportError:
    print("ERROR: Install python markdown: pip install markdown pygments")
    sys.exit(1)


DIR = Path(__file__).parent

# CSS de impressão institucional. Inspirado em McKinsey/Goldman Sachs document design.
CSS = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --primary: #7C5CFC;
  --primary-dark: #5A3FE0;
  --ink: #0D0B14;
  --ink-soft: #1E1A2E;
  --text: #16131F;
  --text-muted: #5A5468;
  --border: #E8E4F0;
  --border-strong: #C8C0E0;
  --bg: #FFFFFF;
  --bg-tint: #FAF8FC;
  --bg-accent: #F4F0FA;
  --success: #00A878;
  --warning: #D97706;
  --danger: #DC2626;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 11pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

body {
  font-family: 'Source Serif Pro', Georgia, serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.55;
  font-feature-settings: 'kern' 1, 'liga' 1;
  text-rendering: optimizeLegibility;
}

/* === COVER PAGE === */
.cover {
  page-break-after: always;
  height: 95vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5cm 3cm 4cm 3cm;
  background:
    radial-gradient(ellipse at top right, rgba(124, 92, 252, 0.08), transparent 60%),
    radial-gradient(ellipse at bottom left, rgba(124, 92, 252, 0.04), transparent 50%),
    var(--bg);
  position: relative;
}

.cover::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 8pt;
  background: linear-gradient(90deg, var(--primary), var(--primary-dark));
}

.cover-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 10pt;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 2cm;
}

.cover-title {
  font-family: 'Inter', sans-serif;
  font-weight: 300;
  font-size: 52pt;
  line-height: 1.05;
  letter-spacing: -0.024em;
  color: var(--ink);
  margin-bottom: 1.5cm;
}

.cover-title strong {
  font-weight: 600;
  color: var(--primary);
}

.cover-subtitle {
  font-family: 'Source Serif Pro', serif;
  font-style: italic;
  font-size: 16pt;
  line-height: 1.4;
  color: var(--text-muted);
  max-width: 70%;
  margin-bottom: 3cm;
}

.cover-meta {
  font-family: 'Inter', sans-serif;
  font-size: 10pt;
  line-height: 1.8;
  color: var(--text-muted);
  border-top: 1px solid var(--border);
  padding-top: 1cm;
}

.cover-meta strong {
  color: var(--ink);
  font-weight: 500;
}

.confidential {
  font-family: 'Inter', sans-serif;
  font-size: 9pt;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--danger);
  border: 1px solid var(--danger);
  padding: 4pt 10pt;
  display: inline-block;
  border-radius: 2pt;
  margin-top: 1cm;
}

/* === CONTENT === */
.content {
  max-width: 17cm;
  margin: 0 auto;
  padding: 1cm 0 2cm 0;
}

/* === HEADINGS === */
h1 {
  font-family: 'Inter', sans-serif;
  font-weight: 300;
  font-size: 28pt;
  line-height: 1.1;
  letter-spacing: -0.022em;
  color: var(--ink);
  margin-top: 0;
  margin-bottom: 0.8cm;
  padding-top: 0.5cm;
  padding-bottom: 0.4cm;
  border-bottom: 2pt solid var(--primary);
  page-break-before: always;
  page-break-after: avoid;
}

h1:first-of-type { page-break-before: avoid; }

h1::before {
  content: '';
  display: block;
  width: 36pt;
  height: 3pt;
  background: var(--primary);
  margin-bottom: 14pt;
  border-radius: 1pt;
}

h2 {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 17pt;
  line-height: 1.2;
  letter-spacing: -0.018em;
  color: var(--ink);
  margin-top: 1.2cm;
  margin-bottom: 0.5cm;
  page-break-after: avoid;
}

h3 {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 13pt;
  line-height: 1.25;
  color: var(--ink-soft);
  margin-top: 0.9cm;
  margin-bottom: 0.35cm;
  page-break-after: avoid;
}

h4 {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 11pt;
  color: var(--text);
  margin-top: 0.6cm;
  margin-bottom: 0.25cm;
  page-break-after: avoid;
}

h5, h6 {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 10pt;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 0.5cm;
  margin-bottom: 0.2cm;
  page-break-after: avoid;
}

/* === PARAGRAPHS === */
p {
  margin-bottom: 0.42cm;
  text-align: justify;
  hyphens: auto;
  orphans: 3;
  widows: 3;
}

/* === EMPHASIS === */
strong { font-weight: 600; color: var(--ink); }
em { font-style: italic; }

/* === LISTS === */
ul, ol {
  margin: 0.3cm 0 0.5cm 0.8cm;
  padding-left: 0.2cm;
}

li {
  margin-bottom: 0.18cm;
  page-break-inside: avoid;
}

li > ul, li > ol {
  margin-top: 0.15cm;
  margin-bottom: 0.15cm;
}

/* === LINKS === */
a {
  color: var(--primary);
  text-decoration: none;
  border-bottom: 1px solid var(--bg-accent);
}

/* === CODE === */
code {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 9.5pt;
  background: var(--bg-tint);
  color: var(--primary-dark);
  padding: 1pt 4pt;
  border-radius: 2pt;
  border: 1px solid var(--border);
}

pre {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9pt;
  line-height: 1.45;
  background: var(--bg-tint);
  border: 1px solid var(--border);
  border-left: 3pt solid var(--primary);
  padding: 10pt 14pt;
  margin: 0.4cm 0;
  border-radius: 3pt;
  overflow-x: auto;
  page-break-inside: avoid;
  white-space: pre-wrap;
  word-wrap: break-word;
}

pre code {
  background: none;
  border: none;
  padding: 0;
  color: var(--text);
}

/* === TABLES === */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.4cm 0 0.5cm 0;
  font-family: 'Inter', sans-serif;
  font-size: 9.5pt;
  line-height: 1.4;
  page-break-inside: avoid;
}

th, td {
  text-align: left;
  padding: 6pt 10pt;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

th {
  font-weight: 600;
  font-size: 9pt;
  color: var(--ink);
  letter-spacing: 0.02em;
  background: var(--bg-tint);
  border-bottom: 2pt solid var(--border-strong);
  text-transform: none;
}

td {
  color: var(--text);
}

td strong, th strong { color: var(--ink); }

tbody tr:nth-child(even) { background: var(--bg-tint); }

/* === BLOCKQUOTE === */
blockquote {
  margin: 0.5cm 0;
  padding: 12pt 18pt;
  background: var(--bg-accent);
  border-left: 3pt solid var(--primary);
  font-style: italic;
  color: var(--ink-soft);
  page-break-inside: avoid;
  border-radius: 0 3pt 3pt 0;
}

blockquote p { margin-bottom: 0.2cm; }
blockquote p:last-child { margin-bottom: 0; }

/* === HR === */
hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 0.8cm 0;
}

/* === PAGE LAYOUT === */
@page {
  size: A4;
  margin: 2.2cm 2cm 2.5cm 2cm;

  @bottom-center {
    content: counter(page) " / " counter(pages);
    font-family: 'Inter', sans-serif;
    font-size: 9pt;
    color: #5A5468;
  }

  @bottom-left {
    content: "NEXA · Plano de Negócios Institucional · v4 · 2026-05-19";
    font-family: 'Inter', sans-serif;
    font-size: 8pt;
    color: #8A85A0;
  }

  @bottom-right {
    content: "Confidencial";
    font-family: 'Inter', sans-serif;
    font-size: 8pt;
    color: #DC2626;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  @top-right {
    content: string(chapter);
    font-family: 'Inter', sans-serif;
    font-size: 9pt;
    color: #5A5468;
  }
}

@page :first {
  margin: 0;
  @bottom-center { content: none; }
  @bottom-left { content: none; }
  @bottom-right { content: none; }
  @top-right { content: none; }
}

h1 { string-set: chapter content(); }

/* === PRINT OPTIMIZATIONS === */
@media print {
  body { font-size: 10.5pt; }
  .no-print { display: none !important; }

  /* Avoid orphan headings */
  h1, h2, h3, h4 { page-break-after: avoid; }

  /* Keep tables together when possible */
  table, pre, blockquote { page-break-inside: avoid; }

  /* Force page break helpers */
  .page-break { page-break-before: always; }
}

/* === EMOJI / ICONOGRAPHY === */
li::marker { color: var(--primary); }

/* === TOC custom === */
.toc {
  page-break-after: always;
  padding-top: 1cm;
}

.toc h2 {
  font-size: 22pt;
  font-weight: 300;
  margin-bottom: 1cm;
  padding-bottom: 0.4cm;
  border-bottom: 1px solid var(--border-strong);
}

.toc ol {
  list-style: none;
  margin: 0;
  padding: 0;
  counter-reset: toc-counter;
}

.toc li {
  counter-increment: toc-counter;
  display: flex;
  font-family: 'Inter', sans-serif;
  font-size: 11pt;
  padding: 5pt 0;
  border-bottom: 1px dotted var(--border);
}

.toc li::before {
  content: counter(toc-counter, decimal-leading-zero);
  font-family: 'JetBrains Mono', monospace;
  font-size: 9pt;
  color: var(--primary);
  font-weight: 500;
  margin-right: 1cm;
  min-width: 1cm;
}
"""

COVER_BUSINESS_PLAN = """
<section class="cover">
  <div>
    <div class="cover-eyebrow">Plano de negócios institucional · v4 · 2026-05-19</div>
    <h1 class="cover-title">NEXA</h1>
    <p class="cover-subtitle">A primeira plataforma social de apostas esportivas do Brasil com criptomoeda própria integrada, operada em modelo white-label sobre operação SIGAP licenciada.</p>
  </div>
  <div>
    <div class="cover-meta">
      <strong>Autor:</strong> Leonardo Guilherme (Founder &amp; CEO)<br>
      <strong>Estrutura:</strong> 30 capítulos · 7 anexos institucionais · ~250 páginas<br>
      <strong>Apoio:</strong> Pesquisa estratégica e estruturação por Claude Code<br>
      <strong>Distribuição:</strong> investidores qualificados · conselho da holding familiar · advisors regulatórios e parceiros estratégicos sob NDA
    </div>
    <div class="confidential">Confidencial · NDA aplicável</div>
  </div>
</section>
"""

COVER_EXEC_SUMMARY = """
<section class="cover">
  <div>
    <div class="cover-eyebrow">Executive Summary · v5 fantasy-first · 2026-05-19</div>
    <h1 class="cover-title">NEXA</h1>
    <p class="cover-subtitle">Plataforma brasileira de Fantasy Sports social-first com cross-sell afiliado multi-operadora SIGAP, operada sob Art. 49 da Lei 14.790/2023 — apresentação institucional condensada.</p>
  </div>
  <div>
    <div class="cover-meta">
      <strong>Documento:</strong> Executive Summary (~12 páginas) · acompanha plano integral de 260 páginas<br>
      <strong>Autor:</strong> Leonardo Guilherme (Founder &amp; CEO)<br>
      <strong>Distribuição:</strong> conselho da holding · investidores qualificados sob NDA
    </div>
    <div class="confidential">Confidencial · NDA aplicável</div>
  </div>
</section>
"""

COVER_MARKETING = """
<section class="cover">
  <div>
    <div class="cover-eyebrow">Plano de Marketing · Creator-First Strategy · 2026-05-19</div>
    <h1 class="cover-title">NEXA</h1>
    <p class="cover-subtitle">Programa operacional de 10 gamer streamers esports-first com contratação trimestral renovável · budget R$ 100-150k/mês · bifurcação contratual Tipo A (Fantasy Art. 49) vs Tipo B (cross-sell operadora).</p>
  </div>
  <div>
    <div class="cover-meta">
      <strong>Documento:</strong> Operacional v1 (~25 páginas) · acompanha plano de negócios v5 fantasy-first<br>
      <strong>Autor:</strong> Leonardo Guilherme (Founder &amp; CEO) · com pesquisa de mercado e jurídica via agents<br>
      <strong>Distribuição:</strong> founder · head of marketing · jurídico/compliance · conselho família
    </div>
    <div class="confidential">Confidencial · NDA aplicável</div>
  </div>
</section>
"""


def md_to_html(md_text: str, is_summary: bool = False) -> str:
    """Convert markdown to HTML using python-markdown with extensions."""
    md = markdown.Markdown(
        extensions=[
            'tables',
            'fenced_code',
            'sane_lists',
            'attr_list',
            'def_list',
            'footnotes',
            'toc',
            'codehilite',
        ],
        extension_configs={
            'codehilite': {'css_class': 'codehilite', 'guess_lang': False},
        },
    )
    return md.convert(md_text)


def remove_existing_frontmatter(md_text: str) -> str:
    """Strip the top-of-file metadata block since we render a custom cover."""
    lines = md_text.split('\n')
    # Find first H1 line; strip everything before plus any leading horizontal rule
    for i, line in enumerate(lines):
        if line.startswith('# '):
            return '\n'.join(lines[i:])
    return md_text


def build_html(title: str, cover: str, body_md: str) -> str:
    """Assemble full standalone HTML document."""
    body_md = remove_existing_frontmatter(body_md)
    body_html = md_to_html(body_md)

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="author" content="Leonardo Guilherme">
<title>{title}</title>
<style>{CSS}</style>
</head>
<body>
{cover}
<main class="content">
{body_html}
</main>
</body>
</html>
"""


def main():
    bp_path = DIR / "NEXA-Business-Plan.md"
    es_path = DIR / "NEXA-Executive-Summary.md"
    mk_path = DIR / "NEXA-Marketing-Plan-Streamers-2026-05-19.md"

    if bp_path.exists():
        print(f"[bp] reading {bp_path.name} ({bp_path.stat().st_size:,} bytes)")
        bp_md = bp_path.read_text(encoding="utf-8")
        bp_html = build_html("NEXA — Plano de Negócios Institucional", COVER_BUSINESS_PLAN, bp_md)
        out = DIR / "NEXA-Business-Plan.html"
        out.write_text(bp_html, encoding="utf-8")
        print(f"[bp] wrote {out.name} ({out.stat().st_size:,} bytes)")
    else:
        print(f"[bp] SKIP — {bp_path.name} not found")

    if es_path.exists():
        print(f"[es] reading {es_path.name} ({es_path.stat().st_size:,} bytes)")
        es_md = es_path.read_text(encoding="utf-8")
        es_html = build_html("NEXA — Executive Summary", COVER_EXEC_SUMMARY, es_md)
        out = DIR / "NEXA-Executive-Summary.html"
        out.write_text(es_html, encoding="utf-8")
        print(f"[es] wrote {out.name} ({out.stat().st_size:,} bytes)")
    else:
        print(f"[es] SKIP — {es_path.name} not found")

    if mk_path.exists():
        print(f"[mk] reading {mk_path.name} ({mk_path.stat().st_size:,} bytes)")
        mk_md = mk_path.read_text(encoding="utf-8")
        mk_html = build_html("NEXA — Plano de Marketing · Creator-First Strategy", COVER_MARKETING, mk_md)
        out = DIR / "NEXA-Marketing-Plan-Streamers-2026-05-19.html"
        out.write_text(mk_html, encoding="utf-8")
        print(f"[mk] wrote {out.name} ({out.stat().st_size:,} bytes)")
    else:
        print(f"[mk] SKIP — {mk_path.name} not found")

    print("\nDone. To produce PDF: open each HTML in Chrome → Imprimir → Salvar como PDF")
    print("Recommended Chrome settings:")
    print("  - Layout: Portrait")
    print("  - Paper size: A4")
    print("  - Margins: Default")
    print("  - Background graphics: ON  ← critical for cover gradient and table zebra stripes")
    print("  - Headers and footers: OFF (CSS handles them)")


if __name__ == "__main__":
    main()
