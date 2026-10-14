"""Build the published resume variants from portfolio facts.

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
    return escape(value.replace("—", "-").replace("–", "-").replace("’", "'").replace("·", "|"))


def build(filename, accent):
    ink = colors.HexColor("#172033")
    muted = colors.HexColor("#475569")
    accent = colors.HexColor(accent)
    styles = {
        "name": ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=25, leading=29, textColor=ink, alignment=TA_CENTER),
        "role": ParagraphStyle("role", fontName="Helvetica-Bold", fontSize=11.5, leading=16, textColor=accent, alignment=TA_CENTER, spaceAfter=6),
        "contact": ParagraphStyle("contact", fontName="Helvetica", fontSize=9, leading=13, alignment=TA_CENTER, textColor=muted),
        "section": ParagraphStyle("section", fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=accent, spaceBefore=10, spaceAfter=5, keepWithNext=True),
        "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9.5, leading=13.2, textColor=ink, spaceAfter=4),
        "job": ParagraphStyle("job", fontName="Helvetica-Bold", fontSize=9.7, leading=13.5, textColor=ink, spaceBefore=3, spaceAfter=4, keepWithNext=True),
        "bullet": ParagraphStyle("bullet", fontName="Helvetica", fontSize=9.3, leading=12.8, leftIndent=10, firstLineIndent=-8, textColor=ink, spaceAfter=4),
        "small": ParagraphStyle("small", fontName="Helvetica", fontSize=9, leading=12.5, textColor=muted, spaceAfter=3),
    }
    doc = SimpleDocTemplate(str(out / filename), pagesize=A4, leftMargin=40, rightMargin=40, topMargin=32, bottomMargin=30,
                            title=profile["name"] + " - iOS Product Engineer", author=profile["name"])
    story = []
    def para(value, style="body"):
        return Paragraph(value, styles[style])
    def section(label):
        story.append(para(label.upper(), "section"))

    story.extend([
        para(text(profile["name"]), "name"),
        para("iOS Product Engineer | Native UI Components", "role"),
        para(text(profile["location"]) + ' | <link href="mailto:' + profile["socialLinks"]["email"] + '">' + text(profile["socialLinks"]["email"]) + "</link>", "contact"),
        para('<link href="https://iamnyx.web.app">iamnyx.web.app</link> | <link href="' + profile["socialLinks"]["linkedin"] + '">linkedin.com/in/raj-kumar-s</link> | <link href="' + profile["socialLinks"]["github"] + '">github.com/coding-nyx</link>', "contact"),
    ])
    section("Profile")
    story.append(para(text(profile.get("resumeSummary", profile["summary"]))))
    section("Technical skills")
    story.append(para("<b>Native:</b> Swift, UIKit, SwiftUI, UICollectionView, UITableView, collection-view layouts, SPM.<br/><b>Performance &amp; tooling:</b> Xcode Instruments, layout-attribute caching, Git, MCP, component integration APIs and documentation.<br/><b>Supporting:</b> Kotlin, Jetpack Compose, TypeScript, React, Firebase, Zoho Catalyst, Linux."))
    section("Experience")
    role = roles[0]
    story.append(para(text(role["role"]) + " | " + text(role["company"]) + " | " + text(role["dates"]), "job"))
    for item in role["projects"]:
        if item.get("resumeOmit"):
            continue
        story.append(para("- <b>" + text(item["name"]) + ":</b> " + text(item.get("resumeSummary", item["desc"])), "bullet"))
    story.append(Spacer(1, 3))
    for role in roles[1:]:
        story.append(para("<b>" + text(role["role"]) + " | " + text(role["company"]) + "</b> | " + text(role["dates"]), "small"))
    section("Selected projects")
    for name in ["Hermes Companion", "Nexus", "Tally"]:
        project = next(item for item in projects if item["name"] == name)
        label = text(name)
        if project["repoUrl"]:
            label = '<link href="' + project["repoUrl"] + '">' + label + "</link>"
        story.append(KeepTogether([para(label, "job"), para(text(project.get("resumeSummary", project["description"])), "small")]))
    section("Education & participation")
    # Education carried forward unchanged in substance from the prior published resume.
    story.append(para("<b>Bachelor of Engineering | 2018 - 2022</b><br/>Electrical, Electronics, and Communications Engineering<br/>Sri Sairam Engineering College, Chennai", "small"))
    story.append(para("Smart India Hackathon | Participant | August 2020", "small"))

    def footer(canvas, document):
        canvas.saveState()
        canvas.setStrokeColor(accent)
        canvas.setLineWidth(1)
        canvas.line(40, 24, A4[0] - 40, 24)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(muted)
        canvas.drawString(40, 13, "iamnyx.web.app")
        canvas.drawRightString(A4[0] - 40, 13, str(document.page))
        canvas.restoreState()
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    reader = PdfReader(out / filename)
    if len(reader.pages) != 1:
        raise RuntimeError(filename + " must remain one page; adjust the source layout.")
    extracted = "\n".join(page.extract_text() for page in reader.pages)
    for forbidden in ["raju9112000", "pac-dbe", "30%", "20%", "3+ years"]:
        if forbidden in extracted:
            raise RuntimeError("Retired resume content remains: " + forbidden)
    if profile["socialLinks"]["email"] not in extracted or "layout attributes" not in extracted:
        raise RuntimeError("Updated contact or performance evidence is missing.")
    return out / filename


paths = [build("resume-modern.pdf", "#234761"), build("resume-cyberpunk.pdf", "#9A440D")]
preview = out / "resume-preview.png"
document = pypdfium2.PdfDocument(str(paths[0]))
document[0].render(scale=1.5).to_pil().save(preview)
for path in paths:
    print(path)
print(preview)
