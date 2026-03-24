#!/usr/bin/env python3
"""
Baloise Lead Manager - Documentation Utilisateur PDF
Version 2.0 - Mars 2026
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, ListFlowable, ListItem, HRFlowable
)
from reportlab.platypus.flowables import Flowable
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import os

# ============================================================
# COULEURS BALOISE
# ============================================================
BALOISE_BLUE = HexColor('#003B71')
BALOISE_LIGHT_BLUE = HexColor('#E8F0FE')
BALOISE_DARK = HexColor('#1a1a2e')
ACCENT_ORANGE = HexColor('#F59E0B')
ACCENT_GREEN = HexColor('#10B981')
ACCENT_RED = HexColor('#EF4444')
ACCENT_YELLOW = HexColor('#FCD34D')
ACCENT_PURPLE = HexColor('#8B5CF6')
LIGHT_GRAY = HexColor('#F3F4F6')
MEDIUM_GRAY = HexColor('#9CA3AF')
DARK_GRAY = HexColor('#374151')
TIP_BG = HexColor('#EFF6FF')
TIP_BORDER = HexColor('#3B82F6')
WARN_BG = HexColor('#FFF7ED')
WARN_BORDER = HexColor('#F97316')
SECTION_BG = HexColor('#F8FAFC')

WIDTH, HEIGHT = A4

# ============================================================
# STYLES
# ============================================================
def get_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        'CoverTitle', parent=styles['Title'],
        fontSize=32, leading=40, textColor=white,
        alignment=TA_CENTER, spaceAfter=8,
        fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        'CoverSubtitle', parent=styles['Normal'],
        fontSize=16, leading=22, textColor=HexColor('#B0C4DE'),
        alignment=TA_CENTER, spaceAfter=6,
        fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'CoverVersion', parent=styles['Normal'],
        fontSize=12, leading=16, textColor=HexColor('#7090B0'),
        alignment=TA_CENTER, fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'ChapterTitle', parent=styles['Heading1'],
        fontSize=22, leading=28, textColor=BALOISE_BLUE,
        spaceBefore=20, spaceAfter=14,
        fontName='Helvetica-Bold',
        borderWidth=0, borderPadding=0,
        borderColor=BALOISE_BLUE,
    ))
    styles.add(ParagraphStyle(
        'SectionTitle', parent=styles['Heading2'],
        fontSize=15, leading=20, textColor=BALOISE_BLUE,
        spaceBefore=16, spaceAfter=8,
        fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        'SubSection', parent=styles['Heading3'],
        fontSize=12, leading=16, textColor=HexColor('#1E40AF'),
        spaceBefore=10, spaceAfter=6,
        fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        'BodyText2', parent=styles['Normal'],
        fontSize=10, leading=15, textColor=DARK_GRAY,
        alignment=TA_JUSTIFY, spaceAfter=6,
        fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'StepText', parent=styles['Normal'],
        fontSize=10, leading=15, textColor=DARK_GRAY,
        leftIndent=24, spaceAfter=4,
        fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'StepNumber', parent=styles['Normal'],
        fontSize=10, leading=15, textColor=BALOISE_BLUE,
        fontName='Helvetica-Bold', spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        'TipText', parent=styles['Normal'],
        fontSize=9.5, leading=14, textColor=HexColor('#1E40AF'),
        fontName='Helvetica', leftIndent=8, rightIndent=8,
    ))
    styles.add(ParagraphStyle(
        'WarnText', parent=styles['Normal'],
        fontSize=9.5, leading=14, textColor=HexColor('#9A3412'),
        fontName='Helvetica', leftIndent=8, rightIndent=8,
    ))
    styles.add(ParagraphStyle(
        'TOCEntry', parent=styles['Normal'],
        fontSize=12, leading=20, textColor=DARK_GRAY,
        fontName='Helvetica', leftIndent=10,
    ))
    styles.add(ParagraphStyle(
        'TOCChapter', parent=styles['Normal'],
        fontSize=13, leading=22, textColor=BALOISE_BLUE,
        fontName='Helvetica-Bold', leftIndent=0,
        spaceBefore=6,
    ))
    styles.add(ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontSize=8, leading=10, textColor=MEDIUM_GRAY,
        alignment=TA_CENTER, fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'FAQQuestion', parent=styles['Normal'],
        fontSize=11, leading=16, textColor=BALOISE_BLUE,
        fontName='Helvetica-Bold', spaceBefore=10, spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        'FAQAnswer', parent=styles['Normal'],
        fontSize=10, leading=15, textColor=DARK_GRAY,
        fontName='Helvetica', leftIndent=12, spaceAfter=8,
    ))
    return styles

# ============================================================
# CUSTOM FLOWABLES
# ============================================================

class ColoredBox(Flowable):
    """A colored box with text inside - for tips and warnings"""
    def __init__(self, text, bg_color, border_color, icon="", width=None, style=None):
        Flowable.__init__(self)
        self.text = text
        self.bg_color = bg_color
        self.border_color = border_color
        self.icon = icon
        self.box_width = width or (WIDTH - 60*mm)
        self.style = style
        self._fixed_height = None

    def wrap(self, availWidth, availHeight):
        self.box_width = min(self.box_width, availWidth)
        # Estimate height from text
        lines = max(1, len(self.text) / 80 + self.text.count('\n'))
        self._fixed_height = max(32, lines * 14 + 20)
        return (self.box_width, self._fixed_height)

    def draw(self):
        c = self.canv
        w = self.box_width
        h = self._fixed_height

        # Background
        c.setFillColor(self.bg_color)
        c.roundRect(0, 0, w, h, 4, fill=1, stroke=0)

        # Left border
        c.setStrokeColor(self.border_color)
        c.setLineWidth(3)
        c.line(0, 0, 0, h)

        # Icon + text
        c.setFillColor(self.border_color)
        c.setFont('Helvetica-Bold', 10)
        y = h - 16
        c.drawString(10, y, self.icon)

        c.setFont('Helvetica', 9.5)
        text_color = HexColor('#1E40AF') if self.border_color == TIP_BORDER else HexColor('#9A3412')
        c.setFillColor(text_color)

        # Wrap text
        lines = self.text.split('\n')
        text_y = y
        for line in lines:
            words = line.split()
            current_line = ""
            for word in words:
                test = current_line + " " + word if current_line else word
                if c.stringWidth(test, 'Helvetica', 9.5) < w - 30:
                    current_line = test
                else:
                    c.drawString(28 if text_y == y else 10, text_y, current_line)
                    text_y -= 14
                    current_line = word
            if current_line:
                c.drawString(28 if text_y == y else 10, text_y, current_line)
                text_y -= 14


class SectionDivider(Flowable):
    """Horizontal line divider"""
    def __init__(self, color=BALOISE_BLUE, width=None, thickness=1.5):
        Flowable.__init__(self)
        self.color = color
        self.line_width = width
        self.thickness = thickness

    def wrap(self, availWidth, availHeight):
        self.line_width = self.line_width or availWidth
        return (self.line_width, 8)

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 4, self.line_width, 4)


class ChapterHeader(Flowable):
    """Chapter number + title with blue background stripe"""
    def __init__(self, number, title, width=None):
        Flowable.__init__(self)
        self.number = number
        self.title = title
        self.box_width = width

    def wrap(self, availWidth, availHeight):
        self.box_width = self.box_width or availWidth
        return (self.box_width, 42)

    def draw(self):
        c = self.canv
        w = self.box_width

        # Blue stripe background
        c.setFillColor(BALOISE_BLUE)
        c.roundRect(0, 0, w, 38, 6, fill=1, stroke=0)

        # Number circle
        c.setFillColor(white)
        c.circle(24, 19, 14, fill=1, stroke=0)
        c.setFillColor(BALOISE_BLUE)
        c.setFont('Helvetica-Bold', 14)
        num_str = str(self.number)
        num_w = c.stringWidth(num_str, 'Helvetica-Bold', 14)
        c.drawString(24 - num_w/2, 14, num_str)

        # Title text
        c.setFillColor(white)
        c.setFont('Helvetica-Bold', 16)
        c.drawString(50, 13, self.title)


class StatusBadge(Flowable):
    """Inline status badge"""
    def __init__(self, text, bg_color, text_color, width=None):
        Flowable.__init__(self)
        self.text = text
        self.bg_color = bg_color
        self.text_color = text_color
        self.badge_width = width or 80

    def wrap(self, availWidth, availHeight):
        return (self.badge_width, 20)

    def draw(self):
        c = self.canv
        c.setFillColor(self.bg_color)
        c.roundRect(0, 2, self.badge_width, 16, 8, fill=1, stroke=0)
        c.setFillColor(self.text_color)
        c.setFont('Helvetica-Bold', 8)
        tw = c.stringWidth(self.text, 'Helvetica-Bold', 8)
        c.drawString((self.badge_width - tw) / 2, 7, self.text)


# ============================================================
# HEADER / FOOTER
# ============================================================

class DocTemplate(SimpleDocTemplate):
    def __init__(self, *args, **kwargs):
        SimpleDocTemplate.__init__(self, *args, **kwargs)
        self.page_count = 0

    def afterPage(self):
        self.page_count += 1


def header_footer(canvas_obj, doc):
    """Draw header and footer on each page"""
    canvas_obj.saveState()
    page_num = canvas_obj.getPageNumber()

    if page_num > 1:  # Skip cover page
        # Header line
        canvas_obj.setStrokeColor(BALOISE_BLUE)
        canvas_obj.setLineWidth(0.5)
        canvas_obj.line(25*mm, HEIGHT - 18*mm, WIDTH - 25*mm, HEIGHT - 18*mm)

        # Header text
        canvas_obj.setFont('Helvetica', 8)
        canvas_obj.setFillColor(BALOISE_BLUE)
        canvas_obj.drawString(25*mm, HEIGHT - 16*mm, "Baloise Lead Manager")
        canvas_obj.drawRightString(WIDTH - 25*mm, HEIGHT - 16*mm, "Guide Utilisateur v2.0")

        # Footer line
        canvas_obj.setStrokeColor(LIGHT_GRAY)
        canvas_obj.line(25*mm, 18*mm, WIDTH - 25*mm, 18*mm)

        # Footer text
        canvas_obj.setFont('Helvetica', 7)
        canvas_obj.setFillColor(MEDIUM_GRAY)
        canvas_obj.drawString(25*mm, 14*mm, "Confidentiel - Usage interne Baloise Luxembourg")
        canvas_obj.drawRightString(WIDTH - 25*mm, 14*mm, f"Page {page_num - 1}")

    canvas_obj.restoreState()


# ============================================================
# CONTENT BUILDERS
# ============================================================

def build_cover(story, styles):
    """Page de couverture"""
    story.append(Spacer(1, 30*mm))

    # Big blue rectangle
    cover_data = [['']]
    cover_table = Table(cover_data, colWidths=[WIDTH - 50*mm], rowHeights=[120*mm])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BALOISE_BLUE),
        ('ROUNDEDCORNERS', [10, 10, 10, 10]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    # Create cover content as nested table
    cover_content = []
    cover_content.append(Spacer(1, 15*mm))
    cover_content.append(Paragraph("BALOISE", styles['CoverTitle']))
    cover_content.append(Paragraph("Lead Manager", styles['CoverTitle']))
    cover_content.append(Spacer(1, 8*mm))

    line = HRFlowable(width="40%", thickness=2, color=HexColor('#4A90D9'),
                       spaceAfter=8, spaceBefore=0, hAlign='CENTER')
    cover_content.append(line)
    cover_content.append(Spacer(1, 4*mm))
    cover_content.append(Paragraph("Guide Utilisateur", styles['CoverSubtitle']))
    cover_content.append(Paragraph("Gestion des prospects pour agents Baloise", styles['CoverSubtitle']))
    cover_content.append(Spacer(1, 10*mm))
    cover_content.append(Paragraph("Version 2.0 - Mars 2026", styles['CoverVersion']))

    # Use table for blue background
    inner = Table([[cover_content]], colWidths=[WIDTH - 60*mm])
    inner.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BALOISE_BLUE),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
        ('TOPPADDING', (0, 0), (-1, -1), 30),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 30),
        ('ROUNDEDCORNERS', [10, 10, 10, 10]),
    ]))
    story.append(inner)

    story.append(Spacer(1, 20*mm))

    # Footer info on cover
    story.append(Paragraph("Baloise Assurances Luxembourg S.A.", ParagraphStyle(
        'CoverFooter', fontSize=10, textColor=MEDIUM_GRAY, alignment=TA_CENTER, fontName='Helvetica'
    )))
    story.append(Paragraph("Document confidentiel - Usage interne", ParagraphStyle(
        'CoverFooter2', fontSize=9, textColor=MEDIUM_GRAY, alignment=TA_CENTER, fontName='Helvetica',
        spaceBefore=4
    )))
    story.append(PageBreak())


def build_toc(story, styles):
    """Table des matieres"""
    story.append(Paragraph("Table des matieres", styles['ChapterTitle']))
    story.append(SectionDivider())
    story.append(Spacer(1, 8*mm))

    chapters = [
        ("1", "Introduction"),
        ("2", "Connexion et Authentification"),
        ("3", "Tableau de Bord Principal"),
        ("4", "La Card de Lead"),
        ("5", "Actions sur les Leads"),
        ("6", "Attribution de Leads"),
        ("7", "Filtres et Recherche"),
        ("8", "Actions Groupees"),
        ("9", "FAQ / Depannage"),
        ("10", "Contact / Support"),
    ]

    for num, title in chapters:
        # Chapter entry with dots
        row_data = [[
            Paragraph(f'<font color="{BALOISE_BLUE.hexval()}">{num}.</font>  {title}', styles['TOCChapter']),
        ]]
        row = Table(row_data, colWidths=[WIDTH - 60*mm])
        row.setStyle(TableStyle([
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(row)

    story.append(PageBreak())


def build_chapter_1(story, styles):
    """Introduction"""
    story.append(ChapterHeader(1, "Introduction"))
    story.append(Spacer(1, 6*mm))

    story.append(Paragraph(
        "<b>Baloise Lead Manager</b> est une application web de gestion de leads (prospects) "
        "concue pour les agents d'assurance Baloise Luxembourg. Elle permet de centraliser, "
        "suivre et gerer l'ensemble des opportunites commerciales de votre agence.",
        styles['BodyText2']
    ))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("A qui s'adresse cet outil ?", styles['SectionTitle']))
    story.append(Paragraph(
        "L'application est destinee a deux types d'utilisateurs :",
        styles['BodyText2']
    ))

    # Roles table
    roles_data = [
        [Paragraph('<b>Responsable d\'agence</b>', styles['BodyText2']),
         Paragraph('Acces complet : voir tous les leads, attribuer, gerer les agents, actions groupees', styles['BodyText2'])],
        [Paragraph('<b>Employe</b>', styles['BodyText2']),
         Paragraph('Acces limite : voir ses propres leads, effectuer des actions sur les leads attribues, consulter les leads des autres agents (lecture seule)', styles['BodyText2'])],
    ]
    roles_table = Table(roles_data, colWidths=[50*mm, 100*mm])
    roles_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), BALOISE_LIGHT_BLUE),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#D1D5DB')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(roles_table)
    story.append(Spacer(1, 6*mm))

    story.append(Paragraph("Avantages cles", styles['SectionTitle']))

    advantages = [
        ("Centralisation", "Tous vos leads au meme endroit, accessibles depuis n'importe quel appareil"),
        ("Suivi en temps reel", "Statuts mis a jour instantanement, historique complet des actions"),
        ("Attribution intelligente", "Assignez les leads aux bons agents en quelques clics"),
        ("Filtres avances", "Trouvez rapidement le lead que vous cherchez par produit, statut ou date"),
        ("Collaboration", "Visibilite sur les leads de toute l'agence pour les responsables"),
    ]

    for title, desc in advantages:
        adv_data = [[
            Paragraph(f'<font color="{BALOISE_BLUE.hexval()}"><b>{title}</b></font>', styles['BodyText2']),
            Paragraph(desc, styles['BodyText2']),
        ]]
        adv_table = Table(adv_data, colWidths=[40*mm, 110*mm])
        adv_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(adv_table)

    story.append(PageBreak())


def build_chapter_2(story, styles):
    """Connexion et Authentification"""
    story.append(ChapterHeader(2, "Connexion et Authentification"))
    story.append(Spacer(1, 6*mm))

    story.append(Paragraph(
        "Pour acceder a Baloise Lead Manager, vous devez vous connecter avec vos identifiants personnels.",
        styles['BodyText2']
    ))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("Se connecter", styles['SectionTitle']))

    steps = [
        "Ouvrez votre navigateur et rendez-vous sur l'URL de l'application (ex: baloise-leads.vercel.app)",
        "Sur la page de connexion, saisissez votre <b>adresse email</b> professionnelle",
        "Saisissez votre <b>mot de passe</b>",
        'Cliquez sur le bouton <b>"Se connecter"</b>',
        "Vous etes redirige vers le tableau de bord principal",
    ]
    for i, step in enumerate(steps, 1):
        story.append(Paragraph(
            f'<font color="{BALOISE_BLUE.hexval()}"><b>Etape {i}.</b></font>  {step}',
            styles['StepText']
        ))

    story.append(Spacer(1, 4*mm))

    # Description de l'ecran
    screen_data = [[Paragraph(
        '<b>Ecran de connexion</b><br/><br/>'
        "L'ecran de connexion presente :<br/>"
        "- Un arriere-plan avec le batiment Baloise Luxembourg<br/>"
        '- Le logo et le titre "Baloise Leads" au centre<br/>'
        '- Un formulaire avec les champs Email et Mot de passe<br/>'
        '- Le bouton "Se connecter" en bleu Baloise<br/>'
        "- Un lien vers la page d'inscription pour les nouveaux agents",
        styles['BodyText2']
    )]]
    screen_table = Table(screen_data, colWidths=[WIDTH - 60*mm])
    screen_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), SECTION_BG),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E2E8F0')),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    story.append(screen_table)
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("Les deux roles", styles['SectionTitle']))
    story.append(Paragraph(
        "Apres connexion, votre role est affiche en haut a droite de l'ecran :",
        styles['BodyText2']
    ))

    roles_detail = [
        [Paragraph('<b>Role</b>', styles['BodyText2']),
         Paragraph('<b>Badge</b>', styles['BodyText2']),
         Paragraph('<b>Permissions</b>', styles['BodyText2'])],
        [Paragraph('Responsable', styles['BodyText2']),
         Paragraph('<font color="#003B71"><b>R</b></font>', styles['BodyText2']),
         Paragraph('Voir tous les leads, attribuer, refuser en masse, supprimer', styles['BodyText2'])],
        [Paragraph('Employe', styles['BodyText2']),
         Paragraph('<font color="#6B7280"><b>E</b></font>', styles['BodyText2']),
         Paragraph('Voir ses leads, actions individuelles, consulter les leads des autres', styles['BodyText2'])],
    ]
    roles_t = Table(roles_detail, colWidths=[35*mm, 25*mm, 90*mm])
    roles_t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#D1D5DB')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(roles_t)

    story.append(Spacer(1, 4*mm))
    story.append(ColoredBox(
        "Conseil : Gardez vos identifiants en securite. Ne les partagez jamais avec un collegue.",
        TIP_BG, TIP_BORDER, "i"
    ))

    story.append(PageBreak())


def build_chapter_3(story, styles):
    """Tableau de Bord Principal"""
    story.append(ChapterHeader(3, "Tableau de Bord Principal"))
    story.append(Spacer(1, 6*mm))

    story.append(Paragraph(
        "Le tableau de bord est votre vue principale. Il rassemble tous les leads de votre agence "
        "et vous permet de les filtrer, trier et gerer efficacement.",
        styles['BodyText2']
    ))
    story.append(Spacer(1, 4*mm))

    # Barre de navigation
    story.append(Paragraph("Barre de navigation", styles['SectionTitle']))
    story.append(Paragraph(
        "La barre en haut de l'ecran (fond bleu Baloise) affiche :",
        styles['BodyText2']
    ))
    nav_items = [
        '<b>Logo Baloise Leads</b> - a gauche, avec le sous-titre "Gestion des prospects"',
        '<b>Numero d\'agence</b> - ex: "Agence 001"',
        "<b>Votre nom et role</b> - en haut a droite (ex: Ayrton - Responsable)",
    ]
    for item in nav_items:
        story.append(Paragraph(f"  {item}", styles['BodyText2']))

    story.append(Spacer(1, 4*mm))

    # KPIs
    story.append(Paragraph("Indicateurs KPI", styles['SectionTitle']))
    story.append(Paragraph(
        "Quatre compteurs colores affichent un resume instantane de vos leads :",
        styles['BodyText2']
    ))

    kpi_data = [
        [Paragraph('<b>KPI</b>', styles['BodyText2']),
         Paragraph('<b>Couleur</b>', styles['BodyText2']),
         Paragraph('<b>Description</b>', styles['BodyText2'])],
        [Paragraph('Nouveaux', styles['BodyText2']),
         Paragraph('Bleu', styles['BodyText2']),
         Paragraph('Leads recemment arrives, pas encore traites', styles['BodyText2'])],
        [Paragraph('En cours', styles['BodyText2']),
         Paragraph('Orange', styles['BodyText2']),
         Paragraph('Leads en cours de traitement (devis envoye, etc.)', styles['BodyText2'])],
        [Paragraph('A contacter', styles['BodyText2']),
         Paragraph('Jaune', styles['BodyText2']),
         Paragraph('Leads avec un rappel planifie', styles['BodyText2'])],
        [Paragraph('Refuses', styles['BodyText2']),
         Paragraph('Rouge', styles['BodyText2']),
         Paragraph('Leads refuses par l\'agent', styles['BodyText2'])],
    ]
    kpi_table = Table(kpi_data, colWidths=[35*mm, 25*mm, 90*mm])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#D1D5DB')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(kpi_table)

    story.append(Spacer(1, 4*mm))
    story.append(ColoredBox(
        "Important : Les KPI ne changent PAS lorsque vous filtrez par statut. Ils refletent toujours le total reel.",
        WARN_BG, WARN_BORDER, "!"
    ))

    story.append(Spacer(1, 6*mm))

    # 3 sections
    story.append(Paragraph("Les 3 sections de leads", styles['SectionTitle']))
    story.append(Paragraph(
        "Les leads sont organises en trois sections distinctes, chacune repliable :",
        styles['BodyText2']
    ))

    sections_data = [
        [Paragraph('<b>Section</b>', styles['BodyText2']),
         Paragraph('<b>Fond</b>', styles['BodyText2']),
         Paragraph('<b>Contenu</b>', styles['BodyText2'])],
        [Paragraph('<b>Mes leads</b>', styles['BodyText2']),
         Paragraph('Blanc', styles['BodyText2']),
         Paragraph('Les leads qui vous sont attribues personnellement', styles['BodyText2'])],
        [Paragraph('<b>Non attribues</b>', styles['BodyText2']),
         Paragraph('Jaune clair', styles['BodyText2']),
         Paragraph('Leads arrives mais pas encore assignes a un agent', styles['BodyText2'])],
        [Paragraph('<b>Leads des autres</b>', styles['BodyText2']),
         Paragraph('Violet clair', styles['BodyText2']),
         Paragraph('Leads attribues a d\'autres agents de votre agence (consultation)', styles['BodyText2'])],
    ]
    sections_table = Table(sections_data, colWidths=[40*mm, 28*mm, 82*mm])
    sections_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#D1D5DB')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(sections_table)

    story.append(Spacer(1, 4*mm))

    # A contacter aujourd'hui
    story.append(Paragraph("Section 'A contacter aujourd'hui'", styles['SectionTitle']))
    story.append(Paragraph(
        "Si des leads ont un rappel planifie pour aujourd'hui, une section speciale apparait "
        "en haut du tableau de bord avec un fond colore pour attirer votre attention. "
        "Ces leads prioritaires sont a traiter en premier.",
        styles['BodyText2']
    ))

    story.append(Spacer(1, 4*mm))
    story.append(ColoredBox(
        "Conseil : Commencez votre journee en traitant les leads de la section 'A contacter aujourd'hui' pour ne manquer aucun rappel.",
        TIP_BG, TIP_BORDER, "i"
    ))

    story.append(PageBreak())


def build_chapter_4(story, styles):
    """La Card de Lead"""
    story.append(ChapterHeader(4, "La Card de Lead"))
    story.append(Spacer(1, 6*mm))

    story.append(Paragraph(
        "Chaque lead est represente par une card (carte) contenant toutes les informations essentielles "
        "visibles en un coup d'oeil.",
        styles['BodyText2']
    ))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("Elements de la card", styles['SectionTitle']))

    # Card anatomy
    card_elements = [
        ("Checkbox", "A gauche, permet de selectionner le lead pour des actions groupees"),
        ("Avatar", "Cercle colore avec les initiales du lead (ex: LR pour Luc Reuter)"),
        ("Nom et email", "Nom complet et adresse email du prospect"),
        ("Agent assigne", "Nom de l'agent avec badge de role (R = Responsable, E = Employe)"),
        ("Produits", "Icones des produits concernes : Drive, Home, Pension Plan"),
        ("Nombre de devis", 'Icone document + nombre (ex: "2 devis")'),
        ("Statut", "Badge colore : Nouveau (bleu), En cours (orange), A contacter (jaune), Refuse (rouge), Converti (vert)"),
        ("Date d'entree", "Date a laquelle le lead est arrive dans le systeme"),
        ("Derniere activite", 'Texte + temps relatif (ex: "Note ajoutee il y a 7h")'),
        ("Actions rapides", "Boutons email et telephone (apparaissent au survol)"),
    ]

    for title, desc in card_elements:
        elem_data = [[
            Paragraph(f'<font color="{BALOISE_BLUE.hexval()}"><b>{title}</b></font>', styles['BodyText2']),
            Paragraph(desc, styles['BodyText2']),
        ]]
        elem_table = Table(elem_data, colWidths=[38*mm, 112*mm])
        elem_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('LINEBELOW', (0, 0), (-1, -1), 0.3, LIGHT_GRAY),
        ]))
        story.append(elem_table)

    story.append(Spacer(1, 6*mm))

    # Statuts
    story.append(Paragraph("Les statuts de lead", styles['SectionTitle']))

    status_data = [
        [Paragraph('<b>Statut</b>', styles['BodyText2']),
         Paragraph('<b>Couleur</b>', styles['BodyText2']),
         Paragraph('<b>Signification</b>', styles['BodyText2'])],
        [Paragraph('Nouveau', styles['BodyText2']),
         Paragraph('<font color="#3B82F6">Bleu</font>', styles['BodyText2']),
         Paragraph('Lead vient d\'arriver, aucune action effectuee', styles['BodyText2'])],
        [Paragraph('En cours', styles['BodyText2']),
         Paragraph('<font color="#F59E0B">Orange</font>', styles['BodyText2']),
         Paragraph('Au moins un devis cree, en attente de reponse', styles['BodyText2'])],
        [Paragraph('A contacter', styles['BodyText2']),
         Paragraph('<font color="#EAB308">Jaune</font>', styles['BodyText2']),
         Paragraph('Rappel planifie, a recontacter a une date precise', styles['BodyText2'])],
        [Paragraph('Refuse', styles['BodyText2']),
         Paragraph('<font color="#EF4444">Rouge</font>', styles['BodyText2']),
         Paragraph('Lead refuse avec un motif', styles['BodyText2'])],
        [Paragraph('Converti', styles['BodyText2']),
         Paragraph('<font color="#10B981">Vert</font>', styles['BodyText2']),
         Paragraph('Client gagne ! Bordure verte sur la card', styles['BodyText2'])],
    ]
    status_table = Table(status_data, colWidths=[30*mm, 25*mm, 95*mm])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#D1D5DB')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(status_table)

    story.append(Spacer(1, 6*mm))

    # Produits
    story.append(Paragraph("Les produits", styles['SectionTitle']))

    products_data = [
        [Paragraph('<b>Produit</b>', styles['BodyText2']),
         Paragraph('<b>Icone</b>', styles['BodyText2']),
         Paragraph('<b>Description</b>', styles['BodyText2'])],
        [Paragraph('Drive', styles['BodyText2']),
         Paragraph('Voiture verte', styles['BodyText2']),
         Paragraph('Assurance vehicule', styles['BodyText2'])],
        [Paragraph('Home', styles['BodyText2']),
         Paragraph('Maison bleue', styles['BodyText2']),
         Paragraph('Assurance habitation', styles['BodyText2'])],
        [Paragraph('Pension Plan', styles['BodyText2']),
         Paragraph('Document violet', styles['BodyText2']),
         Paragraph('Plan de pension / prevoyance', styles['BodyText2'])],
        [Paragraph('Autre', styles['BodyText2']),
         Paragraph('Dossier gris', styles['BodyText2']),
         Paragraph('Autre type de produit', styles['BodyText2'])],
    ]
    products_table = Table(products_data, colWidths=[35*mm, 35*mm, 80*mm])
    products_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#D1D5DB')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(products_table)

    story.append(PageBreak())


def build_chapter_5(story, styles):
    """Actions sur les Leads"""
    story.append(ChapterHeader(5, "Actions sur les Leads"))
    story.append(Spacer(1, 6*mm))

    story.append(Paragraph(
        "Plusieurs actions sont disponibles pour gerer vos leads. Cliquez sur une card pour ouvrir "
        "le panneau de detail, puis selectionnez l'action souhaitee.",
        styles['BodyText2']
    ))

    story.append(Spacer(1, 3*mm))
    story.append(ColoredBox(
        "Conseil : Lorsque vous selectionnez une action, la page defilera automatiquement vers le formulaire correspondant.",
        TIP_BG, TIP_BORDER, "i"
    ))
    story.append(Spacer(1, 4*mm))

    # Action 1: Creer un lead
    story.append(Paragraph("Creer un lead manuellement", styles['SectionTitle']))
    steps = [
        'Cliquez sur le bouton <b>"Ajouter un lead"</b> en haut a droite',
        "Remplissez le formulaire : nom, prenom, email, telephone",
        "Selectionnez un ou plusieurs <b>produits</b> (Drive, Home, Pension Plan)",
        "(Optionnel) Attribuez le lead a un agent de votre agence",
        'Cliquez sur <b>"Creer le lead"</b>',
    ]
    for i, step in enumerate(steps, 1):
        story.append(Paragraph(
            f'<font color="{BALOISE_BLUE.hexval()}"><b>{i}.</b></font>  {step}',
            styles['StepText']
        ))

    story.append(Spacer(1, 3*mm))
    story.append(ColoredBox(
        "Note : Si vous ne selectionnez aucun agent, le lead sera cree comme 'Non attribue' dans la section correspondante.",
        TIP_BG, TIP_BORDER, "i"
    ))

    story.append(Spacer(1, 5*mm))

    # Action 2: Refuser
    story.append(Paragraph("Refuser un lead", styles['SectionTitle']))
    steps = [
        "Ouvrez le detail du lead en cliquant sur sa card",
        'Cliquez sur le bouton <b>"Refuser"</b>',
        "Selectionnez un <b>motif de refus</b> dans la liste deroulante",
        '(Optionnel) Ajoutez un commentaire',
        'Confirmez en cliquant sur <b>"Confirmer le refus"</b>',
    ]
    for i, step in enumerate(steps, 1):
        story.append(Paragraph(
            f'<font color="{BALOISE_BLUE.hexval()}"><b>{i}.</b></font>  {step}',
            styles['StepText']
        ))

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        '<b>Annuler un refus :</b> Si vous avez refuse un lead par erreur, vous pouvez annuler le refus. '
        "Le lead repassera a son statut precedent.",
        styles['BodyText2']
    ))

    story.append(Spacer(1, 5*mm))

    # Action 3: Devis
    story.append(Paragraph("Creer un devis", styles['SectionTitle']))
    steps = [
        "Ouvrez le detail du lead",
        'Cliquez sur <b>"Devis"</b>',
        "Remplissez les informations du devis : <b>montant</b>, <b>produit</b>, <b>details</b>",
        'Confirmez avec <b>"Enregistrer le devis"</b>',
        'Le lead passe automatiquement en statut <b>"En cours"</b>',
    ]
    for i, step in enumerate(steps, 1):
        story.append(Paragraph(
            f'<font color="{BALOISE_BLUE.hexval()}"><b>{i}.</b></font>  {step}',
            styles['StepText']
        ))

    story.append(Spacer(1, 5*mm))

    # Action 4: Recontacter
    story.append(Paragraph("Planifier un rappel (Recontacter)", styles['SectionTitle']))
    steps = [
        "Ouvrez le detail du lead",
        'Cliquez sur <b>"Recontacter"</b>',
        "Choisissez la <b>date et l'heure</b> du rappel",
        '(Optionnel) Ajoutez une note',
        'Confirmez avec <b>"Planifier le rappel"</b>',
        'Le lead passe en statut <b>"A contacter"</b> avec la date affichee sur la card',
    ]
    for i, step in enumerate(steps, 1):
        story.append(Paragraph(
            f'<font color="{BALOISE_BLUE.hexval()}"><b>{i}.</b></font>  {step}',
            styles['StepText']
        ))

    story.append(Spacer(1, 3*mm))
    story.append(ColoredBox(
        "Important : N'importe quel agent peut replanifier un rappel, meme si le lead ne lui est pas attribue.",
        WARN_BG, WARN_BORDER, "!"
    ))

    story.append(Spacer(1, 5*mm))

    # Action 5: Note
    story.append(Paragraph("Ajouter une remarque / note", styles['SectionTitle']))
    steps = [
        "Ouvrez le detail du lead",
        'Cliquez sur <b>"Remarque"</b>',
        "Saisissez votre texte libre (observation, compte-rendu d'appel, etc.)",
        'Confirmez avec <b>"Enregistrer la note"</b>',
    ]
    for i, step in enumerate(steps, 1):
        story.append(Paragraph(
            f'<font color="{BALOISE_BLUE.hexval()}"><b>{i}.</b></font>  {step}',
            styles['StepText']
        ))

    story.append(Spacer(1, 5*mm))

    # Action 6: Convertir
    story.append(Paragraph("Convertir un lead", styles['SectionTitle']))
    story.append(Paragraph(
        'Lorsqu\'un prospect devient client, cliquez sur <b>"Convertir"</b> dans le panneau d\'actions. '
        "La card du lead sera mise en evidence avec une bordure verte pour signaler la conversion reussie.",
        styles['BodyText2']
    ))

    story.append(PageBreak())


def build_chapter_6(story, styles):
    """Attribution de Leads"""
    story.append(ChapterHeader(6, "Attribution de Leads"))
    story.append(Spacer(1, 6*mm))

    story.append(ColoredBox(
        "Reservation aux Responsables : Seuls les agents avec le role 'Responsable' peuvent attribuer des leads. Les employes ne voient pas cette option.",
        WARN_BG, WARN_BORDER, "!"
    ))
    story.append(Spacer(1, 5*mm))

    story.append(Paragraph("Attribution individuelle", styles['SectionTitle']))
    story.append(Paragraph(
        "Vous pouvez attribuer un lead a un agent de deux manieres :",
        styles['BodyText2']
    ))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph(
        "<b>Methode 1 : A la creation</b>",
        styles['SubSection']
    ))
    story.append(Paragraph(
        'Lors de la creation d\'un lead, le champ "Attribuer a" vous permet de selectionner '
        "un agent de votre agence. Si vous laissez vide, le lead sera non attribue.",
        styles['BodyText2']
    ))

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        "<b>Methode 2 : Depuis le detail</b>",
        styles['SubSection']
    ))
    story.append(Paragraph(
        "Ouvrez le detail d'un lead et utilisez le selecteur d'agent pour modifier l'attribution.",
        styles['BodyText2']
    ))

    story.append(Spacer(1, 5*mm))

    story.append(Paragraph("Attribution groupee", styles['SectionTitle']))
    story.append(Paragraph(
        "Pour attribuer plusieurs leads a la fois :",
        styles['BodyText2']
    ))

    steps = [
        "Cochez les <b>checkboxes</b> des leads que vous souhaitez attribuer",
        'Une <b>barre d\'actions</b> apparait en bas de l\'ecran avec le nombre de leads selectionnes',
        'Cliquez sur le bouton <b>"Attribuer"</b> (bleu)',
        "Selectionnez l'agent dans la liste deroulante",
        "Tous les leads selectionnes seront attribues a cet agent",
    ]
    for i, step in enumerate(steps, 1):
        story.append(Paragraph(
            f'<font color="{BALOISE_BLUE.hexval()}"><b>{i}.</b></font>  {step}',
            styles['StepText']
        ))

    story.append(Spacer(1, 4*mm))
    story.append(ColoredBox(
        'Conseil : Utilisez le lien "Deselectionner" dans la barre d\'actions pour retirer toutes les selections d\'un coup.',
        TIP_BG, TIP_BORDER, "i"
    ))

    story.append(PageBreak())


def build_chapter_7(story, styles):
    """Filtres et Recherche"""
    story.append(ChapterHeader(7, "Filtres et Recherche"))
    story.append(Spacer(1, 6*mm))

    story.append(Paragraph(
        "La barre de filtres vous permet de retrouver rapidement n'importe quel lead.",
        styles['BodyText2']
    ))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("Recherche textuelle", styles['SectionTitle']))
    story.append(Paragraph(
        "Le champ de recherche en haut a gauche filtre en temps reel par <b>nom</b>, <b>email</b> "
        "ou <b>telephone</b>. Commencez a taper et les resultats s'affichent instantanement.",
        styles['BodyText2']
    ))

    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("Filtre par produit", styles['SectionTitle']))
    story.append(Paragraph(
        "Cliquez sur un bouton produit pour n'afficher que les leads correspondants :",
        styles['BodyText2']
    ))
    story.append(Paragraph(
        "<b>Tous les produits</b> (defaut) | <b>Drive</b> | <b>Home</b> | <b>Pension Plan</b> | <b>Autre</b>",
        styles['BodyText2']
    ))

    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("Filtre par statut", styles['SectionTitle']))
    story.append(Paragraph(
        "Les onglets de statut permettent de filtrer par etat du lead. Le compteur a cote de "
        "chaque statut indique le nombre de leads.",
        styles['BodyText2']
    ))

    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("Filtre par periode", styles['SectionTitle']))
    story.append(Paragraph(
        "Le selecteur de date permet de limiter l'affichage aux leads recus dans une periode donnee :",
        styles['BodyText2']
    ))

    period_data = [
        [Paragraph('<b>Periode</b>', styles['BodyText2']),
         Paragraph('<b>Description</b>', styles['BodyText2'])],
        [Paragraph('7 jours', styles['BodyText2']),
         Paragraph('Leads de la derniere semaine', styles['BodyText2'])],
        [Paragraph('<b>1 mois</b> (defaut)', styles['BodyText2']),
         Paragraph('Leads du dernier mois', styles['BodyText2'])],
        [Paragraph('3 mois', styles['BodyText2']),
         Paragraph('Leads des 3 derniers mois', styles['BodyText2'])],
        [Paragraph('6 mois', styles['BodyText2']),
         Paragraph('Leads des 6 derniers mois', styles['BodyText2'])],
        [Paragraph('1 an', styles['BodyText2']),
         Paragraph('Leads de la derniere annee', styles['BodyText2'])],
        [Paragraph('Tous', styles['BodyText2']),
         Paragraph('Aucun filtre de date', styles['BodyText2'])],
    ]
    period_table = Table(period_data, colWidths=[45*mm, 105*mm])
    period_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#D1D5DB')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(period_table)

    story.append(Spacer(1, 4*mm))
    story.append(ColoredBox(
        'Important : Le filtre de date ne s\'applique PAS aux leads "A contacter" dont le rappel est dans le futur. Ces leads restent toujours visibles pour ne manquer aucun rendez-vous.',
        WARN_BG, WARN_BORDER, "!"
    ))

    story.append(PageBreak())


def build_chapter_8(story, styles):
    """Actions Groupees"""
    story.append(ChapterHeader(8, "Actions Groupees"))
    story.append(Spacer(1, 6*mm))

    story.append(ColoredBox(
        "Reservation aux Responsables : Les actions groupees (attribuer, refuser en masse, supprimer) ne sont disponibles que pour les Responsables d'agence.",
        WARN_BG, WARN_BORDER, "!"
    ))
    story.append(Spacer(1, 5*mm))

    story.append(Paragraph("Comment utiliser les actions groupees", styles['SectionTitle']))

    steps = [
        "Cochez la <b>checkbox</b> a gauche de chaque lead que vous souhaitez selectionner",
        "Une <b>barre d'actions</b> apparait en bas de l'ecran (fond bleu Baloise)",
        "La barre affiche le <b>nombre de leads selectionnes</b>",
        "Choisissez l'action souhaitee :",
    ]
    for i, step in enumerate(steps, 1):
        story.append(Paragraph(
            f'<font color="{BALOISE_BLUE.hexval()}"><b>{i}.</b></font>  {step}',
            styles['StepText']
        ))

    story.append(Spacer(1, 3*mm))

    actions_data = [
        [Paragraph('<b>Bouton</b>', styles['BodyText2']),
         Paragraph('<b>Couleur</b>', styles['BodyText2']),
         Paragraph('<b>Action</b>', styles['BodyText2'])],
        [Paragraph('Attribuer', styles['BodyText2']),
         Paragraph('Bleu/Violet', styles['BodyText2']),
         Paragraph('Assigner tous les leads selectionnes a un agent', styles['BodyText2'])],
        [Paragraph('Tout refuser', styles['BodyText2']),
         Paragraph('Orange', styles['BodyText2']),
         Paragraph('Refuser tous les leads selectionnes', styles['BodyText2'])],
        [Paragraph('Supprimer', styles['BodyText2']),
         Paragraph('Rouge', styles['BodyText2']),
         Paragraph('Supprimer definitivement les leads selectionnes', styles['BodyText2'])],
    ]
    actions_table = Table(actions_data, colWidths=[35*mm, 30*mm, 85*mm])
    actions_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#D1D5DB')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(actions_table)

    story.append(Spacer(1, 4*mm))
    story.append(Paragraph(
        'Pour <b>deselectionner</b> tous les leads, cliquez sur le lien "Deselectionner" '
        "dans la barre d'actions.",
        styles['BodyText2']
    ))

    story.append(PageBreak())


def build_chapter_9(story, styles):
    """FAQ / Depannage"""
    story.append(ChapterHeader(9, "FAQ / Depannage"))
    story.append(Spacer(1, 6*mm))

    faqs = [
        (
            "Je ne vois pas mes leads",
            "Verifiez les filtres actifs. Le filtre de date est regle par defaut sur <b>1 mois</b> : "
            "si vos leads sont plus anciens, changez la periode. Verifiez aussi les filtres de statut et de produit."
        ),
        (
            "Je ne peux pas attribuer un lead",
            "L'attribution est reservee aux <b>Responsables d'agence</b>. Si vous etes Employe, "
            "demandez a votre responsable d'effectuer l'attribution."
        ),
        (
            "Un lead a disparu de la liste",
            "Il est probablement filtre par la periode. Changez le filtre de date sur <b>\"Tous\"</b> pour afficher "
            "l'ensemble des leads. Verifiez aussi que le filtre de statut ne masque pas le lead."
        ),
        (
            "Comment voir les leads a recontacter ?",
            "Deux options : (1) La section <b>\"A contacter aujourd'hui\"</b> en haut du tableau de bord affiche "
            "les rappels du jour. (2) Utilisez le filtre de statut <b>\"A contacter\"</b> pour voir tous les leads "
            "avec un rappel planifie."
        ),
        (
            "Comment ajouter une note sur un lead ?",
            "Ouvrez le detail du lead en cliquant sur sa card, puis selectionnez l'action <b>\"Remarque\"</b>. "
            "Saisissez votre texte et confirmez. La note apparaitra dans l'historique des actions."
        ),
        (
            "Comment annuler un refus ?",
            "Ouvrez le detail du lead refuse et cliquez sur le bouton d'annulation du refus. "
            "Le lead retrouvera son statut precedent."
        ),
        (
            "Les chiffres KPI ne correspondent pas a ma liste filtree",
            "C'est normal. Les KPI affichent toujours le <b>total reel</b> de vos leads, "
            "independamment des filtres de statut appliques. Cela vous permet de garder une vue d'ensemble."
        ),
        (
            "Comment fonctionne la section 'Non attribues' ?",
            "Cette section (fond jaune clair) contient les leads qui n'ont ete assignes a aucun agent. "
            "Un Responsable peut les attribuer individuellement ou en groupe."
        ),
    ]

    for question, answer in faqs:
        story.append(Paragraph(f"Q : {question}", styles['FAQQuestion']))
        story.append(Paragraph(f"R : {answer}", styles['FAQAnswer']))
        story.append(Spacer(1, 1*mm))

    story.append(PageBreak())


def build_chapter_10(story, styles):
    """Contact / Support"""
    story.append(ChapterHeader(10, "Contact / Support"))
    story.append(Spacer(1, 6*mm))

    story.append(Paragraph(
        "Si vous rencontrez un probleme ou avez une question, plusieurs canaux de support sont a votre disposition.",
        styles['BodyText2']
    ))
    story.append(Spacer(1, 6*mm))

    support_data = [
        [Paragraph('<b>Canal</b>', styles['BodyText2']),
         Paragraph('<b>Contact</b>', styles['BodyText2']),
         Paragraph('<b>Usage</b>', styles['BodyText2'])],
        [Paragraph('Email support', styles['BodyText2']),
         Paragraph('<b>support@baloise.lu</b>', styles['BodyText2']),
         Paragraph('Questions generales, demandes de fonctionnalites', styles['BodyText2'])],
        [Paragraph('Responsable agence', styles['BodyText2']),
         Paragraph('Votre responsable', styles['BodyText2']),
         Paragraph('Problemes d\'attribution, acces, roles', styles['BodyText2'])],
        [Paragraph('Bug technique', styles['BodyText2']),
         Paragraph('<b>support@baloise.lu</b>', styles['BodyText2']),
         Paragraph('Erreurs, dysfonctionnements, problemes d\'affichage', styles['BodyText2'])],
    ]
    support_table = Table(support_data, colWidths=[35*mm, 45*mm, 70*mm])
    support_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BALOISE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#D1D5DB')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(support_table)

    story.append(Spacer(1, 8*mm))

    story.append(Paragraph("Signaler un bug", styles['SectionTitle']))
    story.append(Paragraph(
        "Lorsque vous signalez un bug, merci de fournir les informations suivantes :",
        styles['BodyText2']
    ))

    bug_items = [
        "Une <b>description precise</b> du probleme",
        "Les <b>etapes pour reproduire</b> le bug",
        "Votre <b>navigateur</b> et sa version (Chrome, Firefox, Safari, etc.)",
        "Une <b>capture d'ecran</b> si possible",
        "Votre <b>nom et agence</b>",
    ]
    for item in bug_items:
        story.append(Paragraph(f"  {item}", styles['BodyText2']))

    story.append(Spacer(1, 10*mm))

    # Final note
    final_data = [[Paragraph(
        '<b>Merci d\'utiliser Baloise Lead Manager !</b><br/><br/>'
        "Cette application est en evolution constante. N'hesitez pas a nous faire part "
        "de vos retours et suggestions pour ameliorer votre experience au quotidien.",
        styles['BodyText2']
    )]]
    final_table = Table(final_data, colWidths=[WIDTH - 60*mm])
    final_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BALOISE_LIGHT_BLUE),
        ('GRID', (0, 0), (-1, -1), 1, BALOISE_BLUE),
        ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ('RIGHTPADDING', (0, 0), (-1, -1), 16),
        ('TOPPADDING', (0, 0), (-1, -1), 14),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    story.append(final_table)


# ============================================================
# MAIN
# ============================================================

def generate_pdf():
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, "Baloise_Lead_Manager_Guide_Utilisateur_v2.pdf")

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        topMargin=22*mm,
        bottomMargin=22*mm,
        leftMargin=25*mm,
        rightMargin=25*mm,
        title="Baloise Lead Manager - Guide Utilisateur",
        author="Baloise Assurances Luxembourg",
        subject="Documentation utilisateur v2.0",
    )

    styles = get_styles()
    story = []

    # Build all chapters
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

    # Build the PDF
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"PDF genere avec succes : {output_path}")
    return output_path


if __name__ == "__main__":
    generate_pdf()
