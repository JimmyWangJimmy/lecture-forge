#!/usr/bin/env python3
"""从 PPTX / PDF / DOCX / MD / TXT 提取纯文本，输出带页码标记的文本。

用法：
    python3 extract.py input.pptx                # → stdout
    python3 extract.py a.pptx b.pdf -o out.txt   # → 合并写文件
    python3 extract.py slides/ -o out.txt        # 目录批量

依赖（按需）：
    PPTX / DOCX  → pip install python-pptx python-docx   （或仅用内置 zipfile，见下）
    PDF          → pip install pypdf

本脚本对 PPTX/DOCX 优先用 python-pptx/python-docx；
缺失时回退到「zipfile + XML 正则」，不装任何库也能跑。
"""
import argparse
import os
import re
import sys
import zipfile


# ---------- PPTX ----------
def extract_pptx(path):
    try:
        from pptx import Presentation
        prs = Presentation(path)
        out = []
        for i, slide in enumerate(prs.slides, 1):
            out.append(f"\n=== p{i} ===")
            for shape in slide.shapes:
                if shape.has_text_frame:
                    t = shape.text_frame.text.strip()
                    if t:
                        out.append(t)
                if getattr(shape, "has_table", False):
                    for row in shape.table.rows:
                        out.append(" | ".join(c.text.strip() for c in row.cells))
        return "\n".join(out)
    except ImportError:
        return _pptx_raw(path)


def _pptx_raw(path):
    """不装 python-pptx 的兜底：直接解 zip 读 slideN.xml。"""
    with zipfile.ZipFile(path) as z:
        slides = sorted(
            (n for n in z.namelist() if re.match(r"^ppt/slides/slide\d+\.xml$", n)),
            key=lambda n: int(re.search(r"\d+", n).group()),
        )
        out = []
        for i, name in enumerate(slides, 1):
            xml = z.read(name).decode("utf-8", "ignore")
            texts = [
                m.group(1)
                .replace("&lt;", "<").replace("&gt;", ">")
                .replace("&amp;", "&").replace("&quot;", '"')
                for m in re.finditer(r"<a:t>([\s\S]*?)</a:t>", xml)
            ]
            out.append(f"\n=== p{i} ===")
            out.append("\n".join(texts))
        return "\n".join(out)


# ---------- PDF ----------
def extract_pdf(path):
    try:
        from pypdf import PdfReader
    except ImportError:
        try:
            from PyPDF2 import PdfReader
        except ImportError:
            sys.exit("需要 pypdf：pip install pypdf")
    reader = PdfReader(path)
    out = []
    for i, page in enumerate(reader.pages, 1):
        out.append(f"\n=== p{i} ===")
        out.append((page.extract_text() or "").strip())
    return "\n".join(out)


# ---------- DOCX ----------
def extract_docx(path):
    try:
        from docx import Document
        return "\n".join(p.text for p in Document(path).paragraphs if p.text.strip())
    except ImportError:
        with zipfile.ZipFile(path) as z:
            xml = z.read("word/document.xml").decode("utf-8", "ignore")
            paras = []
            for p in re.findall(r"<w:p[\s>][\s\S]*?</w:p>", xml):
                t = "".join(re.findall(r"<w:t[^>]*>([\s\S]*?)</w:t>", p))
                if t.strip():
                    paras.append(t)
            return "\n".join(paras)


# ---------- 纯文本 ----------
def extract_text(path):
    with open(path, encoding="utf-8", errors="ignore") as f:
        return f.read()


HANDLERS = {
    ".pptx": extract_pptx,
    ".pdf": extract_pdf,
    ".docx": extract_docx,
    ".md": extract_text,
    ".markdown": extract_text,
    ".txt": extract_text,
}


def collect(paths):
    files = []
    for p in paths:
        if os.path.isdir(p):
            for name in sorted(os.listdir(p)):
                full = os.path.join(p, name)
                if os.path.isfile(full) and os.path.splitext(name)[1].lower() in HANDLERS:
                    files.append(full)
        else:
            files.append(p)
    return files


def main():
    ap = argparse.ArgumentParser(description="提取 PPTX/PDF/DOCX/MD/TXT 为纯文本")
    ap.add_argument("inputs", nargs="+", help="文件或目录")
    ap.add_argument("-o", "--output", help="输出文件（默认 stdout）")
    ap.add_argument("--max-chars", type=int, default=0,
                    help="截断到 N 字符（0 = 不截断）")
    args = ap.parse_args()

    parts = []
    for f in collect(args.inputs):
        ext = os.path.splitext(f)[1].lower()
        handler = HANDLERS.get(ext)
        if not handler:
            print(f"[skip] 不支持 {f}", file=sys.stderr)
            continue
        try:
            text = handler(f)
            parts.append(f"\n\n########## {os.path.basename(f)} ##########\n\n{text}")
            print(f"[ok] {f} → {len(text)} 字符", file=sys.stderr)
        except Exception as e:  # noqa: BLE001
            print(f"[err] {f}: {e}", file=sys.stderr)

    merged = "".join(parts)
    if args.max_chars and len(merged) > args.max_chars:
        merged = merged[: args.max_chars] + "\n\n[...已截断]"
        print(f"[warn] 截断到 {args.max_chars} 字符", file=sys.stderr)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(merged)
        print(f"[done] → {args.output}（{len(merged)} 字符）", file=sys.stderr)
    else:
        sys.stdout.write(merged)


if __name__ == "__main__":
    main()
