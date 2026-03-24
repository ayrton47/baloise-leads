#!/usr/bin/env python3
"""Generate Baloise Hub User Guide PDF v3.0"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, HRFlowable
)
from reportlab.platypus.flowables import Flowable
from reportlab.pdfgen import canvas
import os

# ─── Colors ───
BALOISE_BLUE = HexColor('#00358E')
BALOISE_LIGHT_BLUE = HexColor('#E8EDF5')
BALOISE_DARK = HexColor('#1a1a2e')
ACCENT_ORANGE = HexColor('#F59E0B')
ACCENT_GREEN = HexColor('#10B981')
ACCENT_RED = HexColor('#EF4444')
ACCENT_PURPLE = HexColor('#8B5CF6')
LIGHT_GRAY = HexColor('#F3F4F6')
MEDIUM_GRAY = HexColor('#9CA3AF')
DARK_GRAY = HexColor('#374151')
TIP_BG = HexColor('#EFF6FF')
TIP_BORDER = HexColor('#3B82F6')
WARN_BG = HexColor('#FFFBEB')
WARN_BORDER = HexColor('#F59E0B')

OUTPUT_PATH = "/Users/ayrton/Documents/Travail/Suivi des leads/public/Baloise_Lead_Manager_Guide_Utilisateur_v2.pdf"

# ─── Custom Flowables ───
class ColorBox(Flowable):
    """A colored box with text content"""
    def __init__(self, text, bg_color, border_color, icon="", width=None):
        Flowable.__init__(self)
        self.text = text
        self.bg_color = bg_color
        self.border_color = border_color
        self.icon = icon
        self._width = width or 170*mm
        self.height = 0

    def wrap(self, availWidth, availHeight):
        self._width = min(self._width, availWidth)
        # Estimate height based on text length
        lines = max(1, len(self.text) / 80 + 1)
        self.height = max(12*mm, lines * 5*mm + 8*mm)
        return self._width, self.height

    def draw(self):
        c = self.canv
        c.setFillColor(self.bg_color)
        c.setStrokeColor(self.border_color)
        c.setLineWidth(1.5)
        c.roundRect(0, 0, self._width, self.height, 3*mm, fill=1, stroke=1)
        c.setFillColor(DARK_GRAY)
        c.setFont("Helvetica", 9)
        prefix = self.icon + "  " if self.icon else ""
        # Word wrap
        words = (prefix + self.text).split()
        lines = []
        current = ""
        for w in words:
            test = current + " " + w if current else w
            if c.stringWidth(test, "Helvetica", 9) < self._width - 12*mm:
                current = test
            else:
                lines.append(current)
                current = w
        if current:
            lines.append(current)
        y = self.height - 5*mm
        for line in lines:
            c.drawString(4*mm, y, line)
            y -= 4*mm


class SectionDivider(Flowable):
    """Thin horizontal line divider"""
    def __init__(self, color=BALOISE_LIGHT_BLUE):
        Flowable.__init__(self)
        self.color = color

    def wrap(self, availWidth, availHeight):
        return availWidth, 2*mm

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(0.5)
        self.canv.line(0, 1*mm, self._fixedWidth if hasattr(self, '_fixedWidth') else 170*mm, 1*mm)


# ─── Styles ───
def get_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        'CoverTitle', fontName='Helvetica-Bold', fontSize=32,
        textColor=white, alignment=TA_CENTER, spaceAfter=8*mm, leading=38
    ))
    styles.add(ParagraphStyle(
        'CoverSubtitle', fontName='Helvetica', fontSize=16,
        textColor=HexColor('#B0C4DE'), alignment=TA_CENTER, spaceAfter=4*mm
    ))
    styles.add(ParagraphStyle(
        'CoverVersion', fontName='Helvetica', fontSize=11,
        textColor=HexColor('#8899AA'), alignment=TA_CENTER
    ))
    styles.add(ParagraphStyle(
        'TOCTitle', fontName='Helvetica-Bold', fontSize=22,
        textColor=BALOISE_BLUE, spaceAfter=8*mm
    ))
    styles.add(ParagraphStyle(
        'TOCEntry', fontName='Helvetica', fontSize=11,
        textColor=DARK_GRAY, spaceBefore=3*mm, spaceAfter=1*mm, leftIndent=5*mm
    ))
    styles.add(ParagraphStyle(
        'TOCSubEntry', fontName='Helvetica', fontSize=10,
        textColor=MEDIUM_GRAY, spaceBefore=1*mm, spaceAfter=0.5*mm, leftIndent=15*mm
    ))
    styles.add(ParagraphStyle(
        'ChapterTitle', fontName='Helvetica-Bold', fontSize=22,
        textColor=BALOISE_BLUE, spaceBefore=6*mm, spaceAfter=6*mm
    ))
    styles.add(ParagraphStyle(
        'SectionTitle', fontName='Helvetica-Bold', fontSize=14,
        textColor=BALOISE_BLUE, spaceBefore=6*mm, spaceAfter=3*mm
    ))
    styles.add(ParagraphStyle(
        'SubSection', fontName='Helvetica-Bold', fontSize=11,
        textColor=DARK_GRAY, spaceBefore=4*mm, spaceAfter=2*mm
    ))
    styles.add(ParagraphStyle(
        'Body', fontName='Helvetica', fontSize=10,
        textColor=DARK_GRAY, alignment=TA_JUSTIFY, spaceAfter=2*mm, leading=14
    ))
    styles.add(ParagraphStyle(
        'BodyBold', fontName='Helvetica-Bold', fontSize=10,
        textColor=DARK_GRAY, spaceAfter=2*mm, leading=14
    ))
    styles.add(ParagraphStyle(
        'BulletItem', fontName='Helvetica', fontSize=10,
        textColor=DARK_GRAY, leftIndent=8*mm, bulletIndent=3*mm,
        spaceAfter=1.5*mm, leading=13
    ))
    styles.add(ParagraphStyle(
        'StepItem', fontName='Helvetica', fontSize=10,
        textColor=DARK_GRAY, leftIndent=10*mm, bulletIndent=3*mm,
        spaceBefore=1*mm, spaceAfter=1*mm, leading=13
    ))
    styles.add(ParagraphStyle(
        'SmallNote', fontName='Helvetica-Oblique', fontSize=8,
        textColor=MEDIUM_GRAY, alignment=TA_CENTER
    ))
    return styles


# ─── Header/Footer ───
class DocTemplate(SimpleDocTemplate):
    def __init__(self, *args, **kwargs):
        SimpleDocTemplate.__init__(self, *args, **kwargs)
        self.page_count = 0

def header_footer(canvas_obj, doc):
    """Draw header and footer on each page"""
    canvas_obj.saveState()
    w, h = A4

    # Skip header/footer on first page (cover)
    if doc.page_count == 0:
        doc.page_count = 1
        canvas_obj.restoreState()
        return

    # Header line
    canvas_obj.setStrokeColor(BALOISE_BLUE)
    canvas_obj.setLineWidth(0.8)
    canvas_obj.line(20*mm, h - 15*mm, w - 20*mm, h - 15*mm)
    canvas_obj.setFont("Helvetica", 7)
    canvas_obj.setFillColor(BALOISE_BLUE)
    canvas_obj.drawString(20*mm, h - 13*mm, "Baloise Hub - Guide Utilisateur v3.0")
    canvas_obj.drawRightString(w - 20*mm, h - 13*mm, f"Page {doc.page}")

    # Footer
    canvas_obj.setStrokeColor(LIGHT_GRAY)
    canvas_obj.line(20*mm, 12*mm, w - 20*mm, 12*mm)
    canvas_obj.setFont("Helvetica", 7)
    canvas_obj.setFillColor(MEDIUM_GRAY)
    canvas_obj.drawString(20*mm, 8*mm, "Confidentiel - Usage interne Baloise")
    canvas_obj.drawRightString(w - 20*mm, 8*mm, "Mars 2026")

    doc.page_count += 1
    canvas_obj.restoreState()


# ─── Content builders ───
def build_cover(story, styles):
    """Cover page"""
    story.append(Spacer(1, 50*mm))

    # Blue banner background via table
    cover_data = [[""]]
    cover_table = Table(cover_data, colWidths=[170*mm], rowHeights=[90*mm])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BALOISE_BLUE),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROUNDEDCORNERS', [4*mm, 4*mm, 4*mm, 4*mm]),
    ]))
    story.append(cover_table)
    story.append(Spacer(1, -85*mm))

    # Diamond logo (text representation)
    story.append(Paragraph("◆", ParagraphStyle(
        'Logo', fontName='Helvetica-Bold', fontSize=40,
        textColor=white, alignment=TA_CENTER
    )))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("Baloise Hub", styles['CoverTitle']))
    story.append(Paragraph("Guide Utilisateur", styles['CoverSubtitle']))
    story.append(Spacer(1, 45*mm))
    story.append(Paragraph("Plateforme de gestion d'agence Baloise", ParagraphStyle(
        'CoverDesc', fontName='Helvetica', fontSize=13,
        textColor=DARK_GRAY, alignment=TA_CENTER, spaceAfter=4*mm
    )))
    story.append(Paragraph("Version 3.0 - Mars 2026", styles['CoverVersion']))
    story.append(Spacer(1, 15*mm))
    story.append(Paragraph("Modules : Taches  |  Leads  |  Clients", ParagraphStyle(
        'Modules', fontName='Helvetica-Bold', fontSize=11,
        textColor=BALOISE_BLUE, alignment=TA_CENTER
    )))
    story.append(PageBreak())


def build_toc(story, styles):
    """Table of contents"""
    story.append(Paragraph("Table des matieres", styles['TOCTitle']))
    story.append(Spacer(1, 4*mm))

    toc_items = [
        ("1.", "Introduction"),
        ("2.", "Connexion et Authentification"),
        ("3.", "Navigation Generale"),
        ("4.", "Module Taches", [
            "Tableau de bord", "Creer une tache", "Detail d'une tache",
            "Commentaires", "Taches auto-creees"
        ]),
        ("5.", "Module Leads", [
            "Tableau de bord", "Cards de leads", "Detail d'un lead",
            "Actions sur les leads", "Attribution"
        ]),
        ("6.", "Module Clients"),
        ("7.", "Filtres et Recherche"),
        ("8.", "Navigation Croisee Taches / Leads"),
        ("9.", "Gestion du Profil"),
        ("10.", "FAQ / Depannage"),
        ("11.", "Contact / Support"),
    ]

    for item in toc_items:
        num, title = item[0], item[1]
        story.append(Paragraph(
            f'<b>{num}</b>  {title}',
            styles['TOCEntry']
        ))
        if len(item) > 2:
            for sub in item[2]:
                story.append(Paragraph(f'- {sub}', styles['TOCSubEntry']))

    story.append(PageBreak())


def tip_box(text):
    return ColorBox(text, TIP_BG, TIP_BORDER, "Conseil")

def warn_box(text):
    return ColorBox(text, WARN_BG, WARN_BORDER, "Attention")


def build_chapter_1(story, styles):
    """Introduction"""
    story.append(Paragraph("1. Introduction", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=BALOISE_BLUE))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        "<b>Baloise Hub</b> est la plateforme de gestion d'agence pour les agents d'assurance "
        "Baloise Luxembourg. Elle centralise la gestion des taches, le suivi des leads (prospects) "
        "et la gestion des clients dans une interface web unique et intuitive.",
        styles['Body']
    ))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph("Pour qui ?", styles['SectionTitle']))
    story.append(Paragraph("- <b>Responsables d'agence</b> : acces complet a toutes les fonctionnalites (creation de taches, attribution de leads, gestion des agents)", styles['BulletItem']))
    story.append(Paragraph("- <b>Employes</b> : acces a leurs propres leads et taches, actions sur les leads qui leur sont attribues", styles['BulletItem']))

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("Les 3 modules", styles['SectionTitle']))

    modules_data = [
        ['Module', 'Description', 'Icone'],
        ['Taches', 'Gestion des taches de l\'agence\n(par defaut a la connexion)', 'Checklist'],
        ['Leads', 'Suivi des prospects et opportunites\ncommerciales', 'Personnes'],
        ['Clients', 'Bilan 360 client\n(en cours de developpement)', 'Profil'],
    ]
    t = Table(modules_data, colWidths=[35*mm, 90*mm, 30*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, BALOISE_LIGHT_BLUE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ('TOPPADDING', (0, 0), (-1, -1), 3*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 3*mm),
    ]))
    story.append(t)
    story.append(Spacer(1, 4*mm))

    story.append(tip_box(
        "Apres connexion, vous arrivez directement sur l'onglet Taches. "
        "Utilisez les onglets en haut pour naviguer entre les modules."
    ))
    story.append(PageBreak())


def build_chapter_2(story, styles):
    """Connexion"""
    story.append(Paragraph("2. Connexion et Authentification", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=BALOISE_BLUE))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        "La page de connexion affiche le batiment Baloise Luxembourg en arriere-plan. "
        "Saisissez vos identifiants pour acceder a la plateforme.",
        styles['Body']
    ))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph("Etapes de connexion", styles['SectionTitle']))
    steps = [
        "Ouvrez l'URL de l'application dans votre navigateur",
        "Saisissez votre adresse email professionnelle",
        "Saisissez votre mot de passe",
        "Cliquez sur <b>Se connecter</b>",
        "Vous arrivez sur le tableau de bord des Taches",
    ]
    for i, step in enumerate(steps, 1):
        story.append(Paragraph(f"<b>{i}.</b>  {step}", styles['StepItem']))

    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("Roles utilisateur", styles['SectionTitle']))
    roles_data = [
        ['Role', 'Droits'],
        ['Responsable (R)', 'Acces complet : creer des taches, attribuer des leads,\ngerer tous les agents de l\'agence'],
        ['Employe (E)', 'Acces limite : voir ses leads et taches,\nexecuter des actions sur les leads attribues'],
    ]
    t = Table(roles_data, colWidths=[45*mm, 120*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, BALOISE_LIGHT_BLUE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ('TOPPADDING', (0, 0), (-1, -1), 3*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 3*mm),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 4*mm))

    story.append(warn_box(
        "Si vous avez oublie votre mot de passe, contactez votre responsable d'agence "
        "ou le support technique a support@baloise.lu"
    ))
    story.append(PageBreak())


def build_chapter_3(story, styles):
    """Navigation"""
    story.append(Paragraph("3. Navigation Generale", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=BALOISE_BLUE))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        "Le header bleu Baloise est present sur toutes les pages. Il contient la navigation "
        "principale et les informations de l'utilisateur connecte.",
        styles['Body']
    ))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph("Elements du header", styles['SectionTitle']))
    elements = [
        ("<b>Logo</b> : Baloise Hub - Gestion d'agence (a gauche)",
         "Identifie l'application"),
        ("<b>Onglets</b> : Taches | Leads | Clients",
         "Navigation entre les 3 modules. L'onglet actif est surligne en blanc"),
        ("<b>Badge Agence</b> : ex. Agence 001",
         "Numero de votre agence"),
        ("<b>Bouton Guide</b> : icone livre",
         "Ouvre ce guide utilisateur en PDF dans un nouvel onglet"),
        ("<b>Profil</b> : initiales + nom",
         "Cliquez pour voir votre profil ou vous deconnecter"),
    ]
    for label, desc in elements:
        story.append(Paragraph(f"- {label} : {desc}", styles['BulletItem']))

    story.append(Spacer(1, 4*mm))
    story.append(tip_box(
        "L'onglet Taches est selectionne par defaut a la connexion. "
        "Les onglets sont aussi accessibles sur mobile via des icones compactes."
    ))
    story.append(PageBreak())


def build_chapter_4(story, styles):
    """Tasks module"""
    story.append(Paragraph("4. Module Taches", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=BALOISE_BLUE))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        "Le module Taches permet de gerer toutes les taches de votre agence : "
        "appels a passer, contrats a revoir, rendez-vous a planifier, etc.",
        styles['Body']
    ))

    # KPIs
    story.append(Paragraph("4.1 Tableau de bord", styles['SectionTitle']))
    story.append(Paragraph(
        "En haut de la page, 4 indicateurs cles (KPI) donnent une vue d'ensemble :",
        styles['Body']
    ))
    kpi_data = [
        ['KPI', 'Description', 'Couleur'],
        ['A faire', 'Taches en attente de traitement', 'Bleu'],
        ['En cours', 'Taches en cours de realisation', 'Orange'],
        ['Cloturees', 'Taches terminees', 'Vert'],
        ['En retard', 'Taches dont l\'echeance est depassee', 'Rouge'],
    ]
    t = Table(kpi_data, colWidths=[35*mm, 90*mm, 25*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, BALOISE_LIGHT_BLUE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 3*mm),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph(
        "Cliquez sur un KPI pour filtrer les taches par ce statut. Cliquez a nouveau pour retirer le filtre.",
        styles['Body']
    ))

    # Filters
    story.append(Paragraph("4.2 Filtres", styles['SectionTitle']))
    story.append(Paragraph("- <b>Recherche</b> : tapez le titre d'une tache pour la retrouver", styles['BulletItem']))
    story.append(Paragraph("- <b>Priorite</b> : Urgente, Haute, Normale, Basse", styles['BulletItem']))
    story.append(Paragraph("- <b>Categorie</b> : Administrative, Commerciale, Sinistre, Renouvellement, Autre", styles['BulletItem']))

    # Organization
    story.append(Paragraph("4.3 Organisation par collaborateur", styles['SectionTitle']))
    story.append(Paragraph(
        "Les taches sont regroupees dans des volets depliables par agent :",
        styles['Body']
    ))
    story.append(Paragraph("- <b>Mes taches</b> : vos taches personnelles (bleu)", styles['BulletItem']))
    story.append(Paragraph("- <b>Non attribuees</b> : taches sans agent assigne (jaune)", styles['BulletItem']))
    story.append(Paragraph("- <b>Nom de l'agent</b> : un volet par autre agent de l'agence (violet)", styles['BulletItem']))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph(
        "Cliquez sur l'en-tete d'un volet pour le deplier ou le replier.",
        styles['Body']
    ))

    # Create task
    story.append(Paragraph("4.4 Creer une tache (Responsable uniquement)", styles['SectionTitle']))
    steps = [
        "Cliquez sur le bouton <b>Nouvelle tache</b> (en haut a droite)",
        "Remplissez le <b>titre</b> (obligatoire) et la <b>description</b>",
        "Selectionnez la <b>priorite</b> et la <b>categorie</b>",
        "Choisissez une <b>date d'echeance</b> (les dates passees sont bloquees)",
        "Attribuez la tache a un <b>agent</b> (optionnel)",
        "Liez la tache a un <b>lead</b> existant (optionnel)",
        "Cliquez sur <b>Creer</b>",
    ]
    for i, step in enumerate(steps, 1):
        story.append(Paragraph(f"<b>{i}.</b>  {step}", styles['StepItem']))

    story.append(Spacer(1, 3*mm))
    story.append(warn_box(
        "Seuls les Responsables peuvent creer des taches. "
        "Les Employes voient les taches qui leur sont attribuees mais ne peuvent pas en creer."
    ))

    # Task detail
    story.append(Paragraph("4.5 Detail d'une tache", styles['SectionTitle']))
    story.append(Paragraph(
        "Cliquez sur une tache pour ouvrir son panneau de detail a droite :",
        styles['Body']
    ))
    story.append(Paragraph("- <b>Statut</b> : modifiable via les selects ou les boutons Commencer / Cloturer", styles['BulletItem']))
    story.append(Paragraph("- <b>Priorite</b> et <b>categorie</b> : modifiables a tout moment", styles['BulletItem']))
    story.append(Paragraph("- <b>Attribution</b> : reassignable a un autre agent", styles['BulletItem']))
    story.append(Paragraph("- <b>Lead lie</b> : lien cliquable qui bascule vers l'onglet Leads", styles['BulletItem']))
    story.append(Paragraph("- <b>Commentaires</b> : fil de discussion (du plus recent au plus ancien)", styles['BulletItem']))
    story.append(Paragraph("- <b>Supprimer</b> : icone poubelle en haut a droite", styles['BulletItem']))

    story.append(Spacer(1, 3*mm))
    story.append(tip_box(
        "Taches auto-creees : quand vous planifiez un rappel sur un lead (action Recontacter), "
        "une tache de categorie Commerciale est automatiquement creee et attribuee au meme agent."
    ))
    story.append(PageBreak())


def build_chapter_5(story, styles):
    """Leads module"""
    story.append(Paragraph("5. Module Leads", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=BALOISE_BLUE))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        "Le module Leads permet de suivre et gerer tous les prospects de votre agence, "
        "de la reception du lead jusqu'a la conversion en client.",
        styles['Body']
    ))

    # KPIs
    story.append(Paragraph("5.1 Indicateurs cles", styles['SectionTitle']))
    kpi_data = [
        ['KPI', 'Description'],
        ['Nouveaux', 'Leads recemment recus, pas encore traites'],
        ['En cours', 'Leads avec au moins un devis cree'],
        ['A contacter', 'Leads avec un rappel planifie'],
        ['Refuses', 'Leads refuses par l\'agent'],
    ]
    t = Table(kpi_data, colWidths=[40*mm, 120*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, BALOISE_LIGHT_BLUE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 3*mm),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)

    # Filters
    story.append(Paragraph("5.2 Filtres disponibles", styles['SectionTitle']))
    story.append(Paragraph("- <b>Recherche</b> : par nom, email ou telephone", styles['BulletItem']))
    story.append(Paragraph("- <b>Periode</b> : 7 jours, 1 mois (defaut), 3 mois, 6 mois, 1 an, Tous", styles['BulletItem']))
    story.append(Paragraph("- <b>Produit</b> : Drive, Home, Pension Plan, Autre", styles['BulletItem']))
    story.append(Paragraph("- <b>Statut</b> : Nouveaux, En cours, A contacter, Refuses, Convertis", styles['BulletItem']))

    story.append(Spacer(1, 2*mm))
    story.append(tip_box(
        "Le filtre de periode ne s'applique PAS aux leads 'A contacter' dont le rappel est dans le futur. "
        "Ces leads restent toujours visibles. Les KPI ne changent pas quand vous filtrez par statut."
    ))

    # Sections
    story.append(Paragraph("5.3 Organisation des leads", styles['SectionTitle']))
    story.append(Paragraph(
        "Les leads sont organises en volets depliables :",
        styles['Body']
    ))
    sections_data = [
        ['Section', 'Contenu', 'Couleur'],
        ['Mes leads', 'Leads qui vous sont attribues', 'Bleu/indigo'],
        ['Non attribues', 'Leads sans agent assigne', 'Jaune'],
        ['[Nom agent] R/E', 'Un volet par autre agent, avec\nbadge de role', 'Violet (#f9f3ff)'],
    ]
    t = Table(sections_data, colWidths=[40*mm, 80*mm, 40*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, BALOISE_LIGHT_BLUE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 3*mm),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)

    # Lead card
    story.append(Paragraph("5.4 La card de lead", styles['SectionTitle']))
    story.append(Paragraph("Chaque lead est represente par une card contenant :", styles['Body']))
    story.append(Paragraph("- <b>Avatar</b> avec initiales colorees", styles['BulletItem']))
    story.append(Paragraph("- <b>Nom, prenom, email</b>", styles['BulletItem']))
    story.append(Paragraph("- <b>Agent assigne</b> avec badge de role (R ou E)", styles['BulletItem']))
    story.append(Paragraph("- <b>Produits</b> : icones Drive, Home, Pension Plan", styles['BulletItem']))
    story.append(Paragraph("- <b>Nombre de devis</b> crees", styles['BulletItem']))
    story.append(Paragraph("- <b>Statut</b> : badge colore (Nouveau=bleu, En cours=orange, A contacter=jaune, Refuse=rouge, Converti=vert)", styles['BulletItem']))
    story.append(Paragraph("- <b>Date d'entree</b> du lead", styles['BulletItem']))
    story.append(Paragraph("- <b>Derniere activite</b> et date relative", styles['BulletItem']))
    story.append(Paragraph("- <b>Actions rapides</b> : boutons email et telephone", styles['BulletItem']))
    story.append(Paragraph("- <b>Checkbox</b> de selection pour les actions groupees", styles['BulletItem']))

    # Actions
    story.append(Paragraph("5.5 Actions sur un lead", styles['SectionTitle']))
    story.append(Paragraph("Cliquez sur un lead pour ouvrir le panneau de detail. Les actions disponibles :", styles['Body']))

    actions_data = [
        ['Action', 'Description', 'Resultat'],
        ['Creer un lead', 'Bouton "Ajouter un lead"', 'Nouveau lead cree'],
        ['Refuser', 'Selectionner un motif de refus', 'Statut -> Refuse'],
        ['Annuler un refus', 'Reactiver un lead refuse', 'Retour au statut precedent'],
        ['Creer un tarif', 'Saisir montant et details', 'Statut -> En cours'],
        ['Recontacter', 'Choisir date de rappel', 'Statut -> A contacter\n+ tache auto-creee'],
        ['Remarque', 'Ajouter une note libre', 'Note dans l\'historique'],
        ['Convertir', 'Marquer comme client gagne', 'Statut -> Converti'],
    ]
    t = Table(actions_data, colWidths=[35*mm, 60*mm, 55*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, BALOISE_LIGHT_BLUE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ('TOPPADDING', (0, 0), (-1, -1), 2*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 2*mm),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 3*mm))

    # Linked tasks
    story.append(Paragraph("5.6 Taches liees", styles['SectionTitle']))
    story.append(Paragraph(
        "Dans le detail d'un lead, une section <b>Taches liees</b> affiche toutes les taches "
        "associees a ce lead. Cliquez sur une tache pour basculer vers l'onglet Taches et ouvrir "
        "directement le detail de la tache.",
        styles['Body']
    ))

    # Attribution
    story.append(Paragraph("5.7 Attribution de leads (Responsable)", styles['SectionTitle']))
    story.append(Paragraph("<b>Attribution individuelle :</b>", styles['BodyBold']))
    story.append(Paragraph("1. Ouvrez le detail d'un lead", styles['StepItem']))
    story.append(Paragraph("2. Selectionnez un agent dans la liste deroulante", styles['StepItem']))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph("<b>Attribution groupee :</b>", styles['BodyBold']))
    story.append(Paragraph("1. Cochez les leads a attribuer via les checkboxes", styles['StepItem']))
    story.append(Paragraph("2. La barre d'actions bleue apparait en bas de l'ecran", styles['StepItem']))
    story.append(Paragraph("3. Cliquez sur <b>Attribuer</b>", styles['StepItem']))
    story.append(Paragraph("4. Selectionnez l'agent de destination", styles['StepItem']))

    story.append(Spacer(1, 3*mm))
    story.append(warn_box(
        "Les Employes ne peuvent PAS attribuer de leads. "
        "Cette fonctionnalite est reservee aux Responsables d'agence."
    ))
    story.append(PageBreak())


def build_chapter_6(story, styles):
    """Clients module"""
    story.append(Paragraph("6. Module Clients", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=BALOISE_BLUE))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        "Le module Clients est actuellement en cours de developpement. "
        "Il proposera a terme un bilan 360 complet pour chaque client :",
        styles['Body']
    ))
    story.append(Paragraph("- <b>Fiche client</b> : informations personnelles, adresse, contact", styles['BulletItem']))
    story.append(Paragraph("- <b>Portefeuille produits</b> : tous les contrats actifs (Drive, Home, Pension)", styles['BulletItem']))
    story.append(Paragraph("- <b>Timeline</b> : chronologie de toutes les interactions", styles['BulletItem']))
    story.append(Paragraph("- <b>Documents</b> : stockage de contrats, pieces d'identite, etc.", styles['BulletItem']))
    story.append(Paragraph("- <b>Opportunites</b> : suggestions de cross-sell", styles['BulletItem']))

    story.append(Spacer(1, 4*mm))
    story.append(tip_box(
        "Ce module sera disponible dans une prochaine mise a jour. "
        "En attendant, les informations client sont accessibles via les leads."
    ))
    story.append(PageBreak())


def build_chapter_7(story, styles):
    """Filters"""
    story.append(Paragraph("7. Filtres et Recherche", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=BALOISE_BLUE))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        "Les deux modules principaux (Taches et Leads) proposent des filtres puissants "
        "pour retrouver rapidement l'information souhaitee.",
        styles['Body']
    ))

    story.append(Paragraph("Recherche en temps reel", styles['SectionTitle']))
    story.append(Paragraph(
        "Tapez dans la barre de recherche pour filtrer instantanement. "
        "La recherche fonctionne sur le nom, l'email et le telephone pour les leads, "
        "et sur le titre pour les taches.",
        styles['Body']
    ))

    story.append(Paragraph("Regles speciales", styles['SectionTitle']))
    story.append(Paragraph("- Le filtre de <b>periode</b> ne s'applique PAS aux leads 'A contacter' dont le rappel est dans le futur", styles['BulletItem']))
    story.append(Paragraph("- Les <b>KPI</b> ne changent pas quand vous filtrez par statut (ils refletent toujours le total)", styles['BulletItem']))
    story.append(Paragraph("- Le filtre <b>bleu</b> indique un filtre actif (different de la valeur par defaut)", styles['BulletItem']))
    story.append(PageBreak())


def build_chapter_8(story, styles):
    """Cross-navigation"""
    story.append(Paragraph("8. Navigation Croisee", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=BALOISE_BLUE))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        "Les modules Taches et Leads sont interconnectes. Vous pouvez naviguer "
        "de l'un a l'autre en un clic.",
        styles['Body']
    ))

    story.append(Paragraph("Depuis une tache vers un lead", styles['SectionTitle']))
    story.append(Paragraph("1. Ouvrez le detail d'une tache", styles['StepItem']))
    story.append(Paragraph("2. Si un lead est lie, son nom apparait en bleu cliquable", styles['StepItem']))
    story.append(Paragraph("3. Cliquez dessus : l'application bascule vers l'onglet Leads et ouvre le lead", styles['StepItem']))

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("Depuis un lead vers une tache", styles['SectionTitle']))
    story.append(Paragraph("1. Ouvrez le detail d'un lead", styles['StepItem']))
    story.append(Paragraph("2. La section <b>Taches liees</b> liste toutes les taches associees", styles['StepItem']))
    story.append(Paragraph("3. Cliquez sur une tache : l'application bascule vers l'onglet Taches et ouvre la tache", styles['StepItem']))

    story.append(Spacer(1, 4*mm))
    story.append(tip_box(
        "Cette navigation croisee est particulierement utile pour les rappels : "
        "quand vous planifiez un rappel sur un lead, une tache est auto-creee. "
        "Depuis cette tache, vous pouvez revenir directement au lead en un clic."
    ))
    story.append(PageBreak())


def build_chapter_9(story, styles):
    """Profile"""
    story.append(Paragraph("9. Gestion du Profil", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=BALOISE_BLUE))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("Acceder a votre profil", styles['SectionTitle']))
    story.append(Paragraph("1. Cliquez sur votre nom ou vos initiales dans le header (en haut a droite)", styles['StepItem']))
    story.append(Paragraph("2. La fenetre de profil s'ouvre", styles['StepItem']))
    story.append(Paragraph("3. Consultez vos informations : nom, email, role, agence", styles['StepItem']))

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("Se deconnecter", styles['SectionTitle']))
    story.append(Paragraph("1. Ouvrez votre profil", styles['StepItem']))
    story.append(Paragraph("2. Cliquez sur le bouton <b>Deconnexion</b>", styles['StepItem']))
    story.append(Paragraph("3. Vous etes redirige vers la page de connexion", styles['StepItem']))
    story.append(PageBreak())


def build_chapter_10(story, styles):
    """FAQ"""
    story.append(Paragraph("10. FAQ / Depannage", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=BALOISE_BLUE))
    story.append(Spacer(1, 4*mm))

    faqs = [
        ("Je ne vois pas mes leads",
         "Verifiez les filtres actifs : la periode (defaut 1 mois), le statut et le produit. "
         "Essayez de remettre tous les filtres a leur valeur par defaut."),
        ("Je ne peux pas creer de tache",
         "Seuls les Responsables d'agence peuvent creer des taches. "
         "Si vous etes Employe, demandez a votre Responsable."),
        ("Je ne peux pas attribuer un lead",
         "L'attribution est reservee aux Responsables. "
         "Les Employes ne voient pas le bouton d'attribution."),
        ("Un lead a disparu",
         "Le lead est probablement filtre par la periode. Changez le filtre date a 'Tous' "
         "pour voir l'ensemble des leads."),
        ("Comment voir les leads a recontacter ?",
         "Utilisez le filtre de statut 'A contacter'. "
         "La section 'A contacter aujourd'hui' apparait en haut de la page quand des rappels sont prevus."),
        ("Comment ajouter une note sur un lead ?",
         "Ouvrez le detail du lead, puis selectionnez l'action 'Remarque'. "
         "Saisissez votre texte et confirmez."),
        ("Comment voir les taches liees a un lead ?",
         "Ouvrez le detail du lead. La section 'Taches liees' apparait "
         "avant l'historique des actions."),
        ("Les commentaires n'apparaissent pas",
         "Rafraichissez la page avec F5 ou Ctrl+R. "
         "Si le probleme persiste, contactez le support."),
        ("Le rappel n'a pas cree de tache",
         "Verifiez dans l'onglet Taches. La tache est creee automatiquement "
         "avec la categorie 'Commerciale' et la meme attribution que le lead."),
    ]

    for q, a in faqs:
        story.append(Paragraph(f'<b>"{q}"</b>', styles['SubSection']))
        story.append(Paragraph(a, styles['Body']))
        story.append(Spacer(1, 2*mm))

    story.append(PageBreak())


def build_chapter_11(story, styles):
    """Support"""
    story.append(Paragraph("11. Contact / Support", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=BALOISE_BLUE))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        "Pour toute question ou probleme technique, contactez :",
        styles['Body']
    ))
    story.append(Spacer(1, 3*mm))

    contact_data = [
        ['Canal', 'Contact'],
        ['Email support', 'support@baloise.lu'],
        ['Responsable projet', 'Votre responsable d\'agence'],
        ['Guide utilisateur', 'Bouton "Guide" dans le header de l\'application'],
    ]
    t = Table(contact_data, colWidths=[50*mm, 110*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, BALOISE_LIGHT_BLUE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ('TOPPADDING', (0, 0), (-1, -1), 3*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 4*mm),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)

    story.append(Spacer(1, 10*mm))
    story.append(Paragraph("Signaler un bug", styles['SectionTitle']))
    story.append(Paragraph("1. Decrivez le probleme de facon precise", styles['StepItem']))
    story.append(Paragraph("2. Indiquez les etapes pour reproduire le bug", styles['StepItem']))
    story.append(Paragraph("3. Joignez une capture d'ecran si possible", styles['StepItem']))
    story.append(Paragraph("4. Envoyez le tout a <b>support@baloise.lu</b>", styles['StepItem']))

    story.append(Spacer(1, 15*mm))
    story.append(HRFlowable(width="60%", thickness=1, color=BALOISE_LIGHT_BLUE))
    story.append(Spacer(1, 5*mm))
    story.append(Paragraph(
        "Baloise Hub v3.0 - Mars 2026",
        styles['SmallNote']
    ))
    story.append(Paragraph(
        "Document genere automatiquement. Baloise Assurances Luxembourg.",
        styles['SmallNote']
    ))


# ─── Main ───
def generate():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    doc = DocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        topMargin=20*mm,
        bottomMargin=18*mm,
        leftMargin=20*mm,
        rightMargin=20*mm,
        title="Baloise Hub - Guide Utilisateur v3.0",
        author="Baloise Assurances Luxembourg",
        subject="Guide utilisateur de la plateforme Baloise Hub",
    )
    doc.page_count = 0

    styles = get_styles()
    story = []

    build_cover(story, styles)
    build_toc(story, styles)
    build_chapter_1(story, styles)
    build_chapter_2(story, styles)
    build_chapter_3(story, styles)
    build_chapter_4(story, styles)
    build_chapter_5(story, styles)
    build_chapter_6(story, styles)
    build_chapter_7(story, styles)
    build_chapter_8(story, styles)
    build_chapter_9(story, styles)
    build_chapter_10(story, styles)
    build_chapter_11(story, styles)

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"PDF generated: {OUTPUT_PATH}")


if __name__ == "__main__":
    generate()
