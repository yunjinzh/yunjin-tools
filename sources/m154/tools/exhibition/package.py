"""Build the standalone Windows ZIP from a finished site. Usage: python package.py output.zip"""
import argparse
import json
import os
from pathlib import Path
import tempfile
from zipfile import ZIP_DEFLATED, ZIP_STORED, ZipFile

HERE = Path(__file__).resolve().parent
CHAPTERS = ("cbd", "hutong", "waterfront", "palace", "avenue")


def build(dist, output):
    dist = dist.resolve()
    if not all((dist / page).is_file() for page in ("index.html", "explore.html")):
        raise ValueError(f"Missing 3D application in {dist}")
    rows = json.loads((dist / "exhibit/chapters.json").read_text(encoding="utf-8"))
    by_id = {row["id"]: row for row in rows}
    selection = []
    for key in CHAPTERS:
        src = dist / "exhibit" / (key + ".mp4")
        with src.open("rb") as film:
            if film.read(12)[4:8] != b"ftyp" or src.stat().st_size < 1024:
                raise ValueError(f"Incomplete MP4: {src}")
        selection.append({k: by_id[key][k] for k in ("id", "name", "district", "caption")})
    data = json.dumps(selection, ensure_ascii=False, separators=(",", ":")).replace("<", r"\u003c")
    player = (HERE / "offline/player.html").read_text(encoding="utf-8").replace("/*CHAPTER_DATA*/", data)
    output = output.resolve()
    if output.is_relative_to(dist):
        raise ValueError("Place the resulting ZIP outside dist/")
    output.parent.mkdir(parents=True, exist_ok=True)
    handle, temporary = tempfile.mkstemp(prefix=output.stem + "-", suffix=".zip", dir=output.parent)
    os.close(handle)
    try:
        with ZipFile(temporary, "w", compression=ZIP_DEFLATED, compresslevel=6) as archive:
            archive.writestr("观看展览.html", player)
            archive.writestr("启动三维漫游.cmd", (HERE / "offline/start.cmd").read_text().replace("\n", "\r\n").encode("ascii"))
            server = (HERE / "offline/serve.ps1").read_text(encoding="utf-8").replace("\n", "\r\n")
            archive.writestr("serve.ps1", server.encode("utf-8-sig"))
            for file in sorted(dist.rglob("*")):
                if not file.is_file() or file.is_symlink():
                    continue
                packed = file.suffix.lower() in {".mp4", ".png", ".jpg", ".jpeg", ".webp", ".woff2"}
                archive.write(file, "dist/" + file.relative_to(dist).as_posix(),
                              compress_type=ZIP_STORED if packed else ZIP_DEFLATED)
        with ZipFile(temporary) as archive:
            broken = archive.testzip()
            if broken:
                raise ValueError(f"Invalid archive member: {broken}")
        os.replace(temporary, output)
    finally:
        Path(temporary).unlink(missing_ok=True)
    print(f"{output} ({output.stat().st_size / 1048576:.1f} MiB)")


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("output", type=Path)
    cli.add_argument("--dist", type=Path, default=HERE.parents[1] / "dist")
    options = cli.parse_args()
    build(options.dist, options.output)
