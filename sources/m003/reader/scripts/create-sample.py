"""Generate the original, three-page PDF shipped with the reader.

Run with Python and ReportLab installed. Output is deterministic so that
regenerating this sample does not introduce unnecessary binary changes.
"""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "samples" / "quiet-reading.pdf"
WIDTH, HEIGHT = 420, 595
MARGIN = 42
INK = colors.HexColor("#342E29")
MUTED = colors.HexColor("#82776A")
ACCENT = colors.HexColor("#8B493A")
PAPER = colors.HexColor("#FFFCF6")
RULE = colors.HexColor("#E6DDD0")

pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))
BODY = ParagraphStyle(
    "Body",
    fontName="STSong-Light",
    fontSize=13.5,
    leading=23,
    textColor=INK,
    wordWrap="CJK",
)


def label(pdf, text, x, y, size=10, color=MUTED):
    pdf.setFillColor(color)
    pdf.setFont("STSong-Light", size)
    pdf.drawString(x, y, text)


def paragraph(pdf, text, top, size=13.5, leading=23):
    style = ParagraphStyle("section", parent=BODY, fontSize=size, leading=leading)
    block = Paragraph(text, style)
    _, height = block.wrap(WIDTH - 2 * MARGIN, HEIGHT)
    block.drawOn(pdf, MARGIN, top - height)
    return top - height


def page_base(pdf, number, destination, title):
    pdf.setFillColor(PAPER)
    pdf.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
    pdf.bookmarkPage(destination)
    pdf.addOutlineEntry(title, destination, level=0)
    label(pdf, "云金阅读", MARGIN, HEIGHT - 43, 11, ACCENT)
    label(pdf, "给自己一段安静的时间", WIDTH - 166, HEIGHT - 43, 9)
    pdf.setStrokeColor(RULE)
    pdf.setLineWidth(0.6)
    pdf.line(MARGIN, 48, WIDTH - MARGIN, 48)
    label(pdf, "原创阅读样本 · 云金阅读", MARGIN, 29, 8)
    label(pdf, f"{number:02d} / 03", WIDTH - 81, 29, 9)


def cover(pdf):
    page_base(pdf, 1, "begin", "从一页开始")
    label(pdf, "READ A LITTLE, EVERY DAY", MARGIN, 483, 9, ACCENT)
    label(pdf, "把时间，", MARGIN, 425, 34, INK)
    label(pdf, "留给阅读。", MARGIN, 379, 34, INK)
    paragraph(pdf, "一本书，一盏灯，一小段不被打扰的时光。<br/>欢迎来到你的随身书房。", 342, 12.5, 21)

    pdf.setStrokeColor(ACCENT)
    pdf.setLineWidth(1.2)
    pdf.line(MARGIN, 265, MARGIN + 30, 265)
    label(pdf, "从这里开始", MARGIN, 238, 12, ACCENT)
    entries = [
        ("01", "从一页开始", "begin", "1"),
        ("02", "在字里行间停一停", "pause", "2"),
        ("03", "让阅读成为日常", "everyday", "3"),
    ]
    for index, (number, title, destination, page) in enumerate(entries):
        y = 201 - index * 35
        label(pdf, number, MARGIN, y, 9, MUTED)
        label(pdf, title, MARGIN + 30, y, 12, INK)
        label(pdf, page, WIDTH - MARGIN - 8, y, 10, ACCENT)
        pdf.linkRect("", destination, (MARGIN, y - 8, WIDTH - MARGIN, y + 18), relative=0, thickness=0)
    label(pdf, "轻点目录，或者翻到下一页。", MARGIN, 83, 9)
    pdf.showPage()


def pause(pdf):
    page_base(pdf, 2, "pause", "在字里行间停一停")
    label(pdf, "01 / 阅读随笔", MARGIN, 494, 10, ACCENT)
    label(pdf, "在字里行间，", MARGIN, 448, 27, INK)
    label(pdf, "停一停。", MARGIN, 410, 27, INK)
    y = paragraph(
        pdf,
        "雨落在窗沿，像有人轻轻敲门。桌上的书翻到一半，茶还温着。我把手机放远了一些，读完那一段，又从头读了一遍。原来慢下来，并不需要等到一个特别的日子。",
        369,
    )
    y = paragraph(
        pdf,
        "有时，我们急着知道故事的结尾，却忘了留意沿途的句子。一次犹豫、一声问候、一条傍晚的街道，都藏着作者留给读者的小小礼物。把目光停住一会儿，礼物就会慢慢显露。",
        y - 17,
    )
    paragraph(
        pdf,
        "不必要求自己每次读很多。今天读两页，明天读一章，都很好。读过的文字会在心里找到位置，等到某个需要它的时刻，再轻轻地回应你。",
        y - 17,
    )
    pdf.showPage()


def everyday(pdf):
    page_base(pdf, 3, "everyday", "让阅读成为日常")
    label(pdf, "02 / 随身书房", MARGIN, 494, 10, ACCENT)
    label(pdf, "让阅读，", MARGIN, 448, 27, INK)
    label(pdf, "成为日常。", MARGIN, 410, 27, INK)
    y = paragraph(
        pdf,
        "为一本书留出固定的位置，也为阅读留出一个小小的空隙。也许是清晨出门前，也许是午后的片刻休息，也许是睡前关灯之前。时间不长，却足够让一天多一点从容。",
        369,
    )
    y = paragraph(
        pdf,
        "把喜欢的 PDF 加入书架，就能带着它继续出发。找到舒服的缩放比例，让一页文字贴合眼前的屏幕。读到哪里，就从哪里接着读；暂时离开，也不用急着和故事道别。",
        y - 17,
    )
    paragraph(
        pdf,
        "等你合上这本小册，下一本书已经在等你。它可能带你去一座从未到过的城市，也可能让你重新认识熟悉的生活。愿每一次打开书页，都有一点新的发现。",
        y - 17,
    )
    label(pdf, "愿你读得自在。", MARGIN, 88, 12, ACCENT)
    pdf.showPage()


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(OUTPUT), pagesize=(WIDTH, HEIGHT), invariant=1, pageCompression=1)
    pdf.setTitle("把时间，留给阅读")
    pdf.setAuthor("云金阅读")
    pdf.setSubject("云金阅读原创欢迎样本，含三页中文内容与可点击目录")
    cover(pdf)
    pause(pdf)
    everyday(pdf)
    pdf.save()
    print(f"Created {OUTPUT}")


if __name__ == "__main__":
    main()
