#!/usr/bin/env python3
"""Assemble the pre-rendered low-bandwidth textbook pages for the offline HTML."""

from pathlib import Path
import sys

from PIL import Image
from reportlab.pdfgen import canvas


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: make-offline-pdf.py <jpg-directory> <output.pdf>")

    image_dir = Path(sys.argv[1])
    output = Path(sys.argv[2])
    pages = sorted(image_dir.glob("page-*.jpg"))
    if len(pages) != 114:
        raise SystemExit(f"expected 114 rendered pages, found {len(pages)}")

    first = Image.open(pages[0])
    first_size = (first.width * 72 / 95, first.height * 72 / 95)
    document = canvas.Canvas(str(output), pagesize=first_size, pageCompression=1)

    for page in pages:
        with Image.open(page) as image:
            width = image.width * 72 / 95
            height = image.height * 72 / 95
        document.setPageSize((width, height))
        document.drawImage(str(page), 0, 0, width=width, height=height)
        document.showPage()

    document.save()


if __name__ == "__main__":
    main()

