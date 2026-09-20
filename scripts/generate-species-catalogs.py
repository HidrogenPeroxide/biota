#!/usr/bin/env python3
"""Convert the Qinghai species workbooks into frontend-ready JSON."""

from __future__ import annotations

import json
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "data" / "species-catalogs"
OUTPUT = ROOT / "src" / "data" / "speciesCatalogs.json"
NS = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def read_rows(path: Path) -> list[dict[str, str]]:
    with zipfile.ZipFile(path) as archive:
        shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        shared = [
            clean("".join(node.itertext()))
            for node in shared_root.findall("main:si", NS)
        ]
        sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))

    rows: list[dict[str, str]] = []
    for row in sheet.findall(".//main:sheetData/main:row", NS):
        values: dict[str, str] = {}
        for cell in row.findall("main:c", NS):
            column = re.match(r"[A-Z]+", cell.attrib["r"])
            if column is None:
                continue
            value_node = cell.find("main:v", NS)
            value = "" if value_node is None else value_node.text or ""
            if cell.attrib.get("t") == "s" and value:
                value = shared[int(value)]
            elif cell.attrib.get("t") == "inlineStr":
                inline = cell.find("main:is", NS)
                value = "" if inline is None else "".join(inline.itertext())
            values[column.group()] = clean(value)
        rows.append(values)
    return rows


def parse_catalog(path: Path, kind: str) -> list[dict[str, object]]:
    rows = read_rows(path)
    if not rows:
        raise ValueError(f"{path.name} is empty")

    expected = (
        ["\u5e8f\u53f7", "\u76ee\u540d", "\u79d1\u540d", "\u7269\u79cd", "\u5b66\u540d"]
        if kind == "animals"
        else ["\u5e8f\u53f7", "\u79d1\u540d", "\u5c5e\u540d", "\u7269\u79cd", "\u5b66\u540d"]
    )
    header = [rows[0].get(column, "") for column in "ABCDE"]
    if header != expected:
        raise ValueError(f"Unexpected columns in {path.name}: {header}")

    catalog: list[dict[str, object]] = []
    for row in rows[1:]:
        if not any(row.get(column, "") for column in "ABCDE"):
            continue
        sequence = row.get("A", "")
        if not sequence.isdigit():
            raise ValueError(f"Invalid sequence number in {path.name}: {sequence!r}")

        common = row.get("D", "") or None
        scientific = row.get("E", "") or None
        if kind == "animals":
            entry = {
                "id": int(sequence),
                "order": row.get("B", ""),
                "family": row.get("C", ""),
                "commonName": common,
                "scientificName": scientific,
            }
        else:
            entry = {
                "id": int(sequence),
                "family": row.get("B", ""),
                "genus": row.get("C", ""),
                "commonName": common,
                "scientificName": scientific,
            }
        catalog.append(entry)

    return catalog


def main() -> None:
    result = {
        "animals": parse_catalog(SOURCE_DIR / "qinghai-animals.xlsx", "animals"),
        "plants": parse_catalog(SOURCE_DIR / "qinghai-plants.xlsx", "plants"),
    }
    OUTPUT.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"Generated {OUTPUT.relative_to(ROOT)} "
        f"({len(result['animals'])} animals, {len(result['plants'])} plants)"
    )


if __name__ == "__main__":
    main()
