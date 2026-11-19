"""Build the published resume and preview from portfolio facts.

Requires Node.js, reportlab, pypdf and pypdfium2.
Run: python3 scripts/build-resume.py --output-dir public
"""
import argparse
import json
import subprocess
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from pypdf import PdfReader
import pypdfium2

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--output-dir", type=Path, default=ROOT / "output/pdf")
args = parser.parse_args()
out = args.output_dir.resolve()
out.mkdir(parents=True, exist_ok=True)

data = json.loads(subprocess.run(
    ["node", "--input-type=module", "-e",
     "import {profileData,experienceData,projects} from './src/data/portfolio.js';"
     "console.log(JSON.stringify({profileData,experienceData,projects}));"],
    cwd=ROOT, text=True, capture_output=True, check=True).stdout)
profile, roles, projects = data["profileData"], data["experienceData"], data["projects"]


def text(value):
    return escape(value.replace("→", "/").replace("—", "-").replace("–", "-").replace("’", "'").replace("·", "|"))


def build():
    filename = "resume-modern.pdf"
    role = roles[0]
    ink = colors.HexColor("#172033")
    muted = colors.HexColor("#475569")
    accent = colors.HexColor("#234761")
    styles = {
        "name": ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=25, leading=29, textColor=ink, alignment=TA_CENTER),
        "role": ParagraphStyle("role", fontName="Helvetica-Bold", fontSize=11.5, leading=16, textColor=accent, alignment=TA_CENTER, spaceAfter=6),
        "contact": ParagraphStyle("contact", fontName="Helvetica", fontSize=9, leading=13, alignment=TA_CENTER, textColor=muted),
        "section": ParagraphStyle("section", fontName="Helvetica-Bold", fontSize=10.5, leading=15, textColor=accent, spaceBefore=11, spaceAfter=4, keepWithNext=True),
        "body": ParagraphStyle("body", fontName="Helvetica", fontSize=10.3, leading=14.5, textColor=ink, spaceAfter=4),
        "job": ParagraphStyle("job", fontName="Helvetica-Bold", fontSize=10.3, leading=14.5, textColor=ink, spaceBefore=3, spaceAfter=4, keepWithNext=True),
        "bullet": ParagraphStyle("bullet", fontName="Helvetica", fontSize=10.1, leading=14.2, leftIndent=10, firstLineIndent=-8, textColor=ink, spaceAfter=4),
        "small": ParagraphStyle("small", fontName="Helvetica", fontSize=9.8, leading=13.5, textColor=muted, spaceAfter=4),
    }
    doc = SimpleDocTemplate(str(out / filename), pagesize=A4, leftMargin=40, rightMargin=40, topMargin=32, bottomMargin=30, invariant=1,
                            title=profile["name"] + " - " + role["role"], author=profile["name"])
    story = []
    def para(value, style="body"):
        return Paragraph(value, styles[style])
    def section(label):
        story.append(para(label.upper(), "section"))

    story.extend([
        para(text(profile["name"]), "name"),
        para(text(role["role"]) + " | Swift, UIKit &amp; SwiftUI", "role"),
        para(text(profile["location"]) + ' | <link href="mailto:' + profile["socialLinks"]["email"] + '">' + text(profile["socialLinks"]["email"]) + "</link>", "contact"),
        para('<link href="https://iamnyx.dev">iamnyx.dev</link> | <link href="' + profile["socialLinks"]["linkedin"] + '">linkedin.com/in/raj-kumar-s</link> | <link href="' + profile["socialLinks"]["github"] + '">github.com/coding-nyx</link>', "contact"),
    ])
    section("Profile")
    story.append(para(text(profile.get("resumeSummary", profile["summary"]))))
    section("Technical skills")
    story.append(para("<b>iOS:</b> Swift, UIKit, SwiftUI, UICollectionView, UITableView, Swift Package Manager.<br/><b>Performance and tooling:</b> Xcode Instruments, layout-attribute caching, Git, MCP, component APIs.<br/><b>Full-stack web:</b> TypeScript, React, Next.js, Python/FastAPI, PostgreSQL, Firebase, REST and MCP APIs.<br/><b>Also:</b> Kotlin, Jetpack Compose, Zoho Catalyst, Linux."))
    section("Experience")
    story.append(para(text(role["company"]) + " | " + text(role["role"]) + " | " + text(role["dates"]), "job"))
    work_by_id = {item["id"]: item for item in role["projects"] if "resumeSummary" in item}
    for work_id in (
        "reusable-product-ui",
        "spreadsheet-layout-performance",
        "platform-library-integration",
        "release-and-quality",
        "production-app-revamp",
    ):
        story.append(para("- " + text(work_by_id[work_id]["resumeSummary"]), "bullet"))
    story.append(Spacer(1, 3))
    for role in roles[1:]:
        dates = " | " + text(role["dates"]) if role["dates"] else ""
        story.append(para("<b>" + text(role["role"]) + " | " + text(role["company"]) + "</b>" + dates, "small"))
    section("Selected projects")
    for project_id in ["hermes-companion", "agent-os", "tally"]:
        project = next(item for item in projects if item["id"] == project_id)
        label = text(project["name"])
        if project["repoUrl"]:
            label = '<link href="' + project["repoUrl"] + '">' + label + "</link>"
        story.append(KeepTogether([para(label, "job"), para(text(project.get("resumeSummary", project["description"])), "small")]))
    section("Education")
    # Education carried forward unchanged in substance from the prior published resume.
    story.append(para("<b>Bachelor of Engineering | 2018 - 2022</b><br/>Electrical, Electronics, and Communications Engineering<br/>Sri Sairam Engineering College, Chennai", "small"))

    def footer(canvas, document):
        canvas.saveState()
        canvas.setStrokeColor(accent)
        canvas.setLineWidth(1)
        canvas.line(40, 24, A4[0] - 40, 24)
        canvas.restoreState()
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    reader = PdfReader(out / filename)
    if len(reader.pages) != 1:
        raise RuntimeError(filename + " must remain one page; adjust the source layout.")
    extracted = " ".join(reader.pages[0].extract_text().split())
    for forbidden in ["raju9112000", "pac-dbe", "30%", "20%", "3+ years", "iamnyx.web.app", "personally"]:
        if forbidden in extracted:
            raise RuntimeError("Retired resume content remains: " + forbidden)
    if profile["socialLinks"]["email"] not in extracted or "UICollectionViewLayout attributes" not in extracted:
        raise RuntimeError("Updated contact or performance evidence is missing.")
    if extracted.count("iamnyx.dev") != 2:  # Email and website; no footer artifact.
        raise RuntimeError("Canonical website is missing or repeated in the footer.")
    link_targets = {
        str(annotation.get_object().get("/A", {}).get("/URI", ""))
        for page in reader.pages for annotation in page.get("/Annots", [])
    }
    expected_links = {"https://iamnyx.dev"} | {
        project["repoUrl"] for project in projects
        if project["id"] in {"hermes-companion", "agent-os", "tally"}
    }
    if not expected_links.issubset(link_targets):
        raise RuntimeError("Resume website or project source links are missing.")
    return out / filename


path = build()
preview = out / "resume-preview.png"
with pypdfium2.PdfDocument(str(path)) as document:
    document[0].render(scale=1.5).to_pil().save(preview)
print(path)
print(preview)
