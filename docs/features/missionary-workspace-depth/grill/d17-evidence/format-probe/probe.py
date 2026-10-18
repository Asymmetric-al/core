#!/usr/bin/env python3
"""Synthetic file-format counterexamples, NOT a Core importer or parser qualification.

Run with Python's standard library only. No real contact data, network, dependencies,
spreadsheet execution, or extraction to disk. The assertions expose information loss
and ambiguity in tempting shortcuts; they do not prove production upload safety.
"""

import codecs
import csv
import io
import json
import platform
import warnings
import zipfile
from pathlib import PurePosixPath
from xml.etree import ElementTree as ET


outcomes = []


def check(name, condition, observation):
    assert condition, name
    outcomes.append({"name": name, "passed": True, "observation": observation})


def rows(text, delimiter=","):
    return list(csv.reader(io.StringIO(text, newline=""), delimiter=delimiter, strict=True))


quoted = 'Name,City\r\n"Rivera, Ana","Dallas, Texas"\r\n'
check("comma_split_is_not_csv", len(quoted.splitlines()[1].split(",")) == 4 and len(rows(quoted)[1]) == 2,
      "Quoted comma-containing names and cities are two cells, not four.")
multiline = 'Name,Address\nMaya,"Line 1\nLine 2"\n'
check("physical_lines_are_not_records", len(multiline.splitlines()) == 3 and len(rows(multiline)) == 2,
      "Physical line counting miscounts a multiline address.")
check("embedded_quotes_roundtrip", rows('Name\n"Ana ""A"" Rivera"\n')[1][0] == 'Ana "A" Rivera',
      "Doubled quote escaping must survive parsing.")
bom = codecs.BOM_UTF8 + "Name\nZoë\n".encode()
check("bom_is_not_header_content", bom.decode("utf-8").startswith("\ufeff") and rows(bom.decode("utf-8-sig"))[0] == ["Name"],
      "A transport BOM must not become part of a mapping key.")
check("semicolon_is_a_real_dialect", rows('Name;City\nZoë;Paris\n', ";")[1] == ["Zoë", "Paris"],
      "The reviewed separator is part of the immutable interpretation.")
check("tabs_are_a_real_dialect", rows('Name\tCity\nZoë\tParis\n', "\t")[1] == ["Zoë", "Paris"],
      "Tab-delimited exports need explicit supported dialect handling.")
ambiguous = 'Name;Label\nAna;Friends, family\n'
check("wrong_dialect_can_parse_without_error", len(rows(ambiguous)[0]) == 1 and len(rows(ambiguous)[1]) == 2,
      "Syntactic parsing alone does not establish the correct delimiter.")
check("empty_cell_is_not_empty_row", rows('Name,Email\nMaya,\n\n')[1] == ["Maya", ""] and rows('Name,Email\nMaya,\n\n')[2] == [],
      "An absent email and a wholly blank row are different outcomes.")
duplicate_headers = list(csv.DictReader(io.StringIO('Email,Email\none@example.invalid,two@example.invalid\n')))[0]
check("dict_mapping_can_destroy_duplicate_columns", duplicate_headers == {"Email": "two@example.invalid"},
      "Headers require ordinal identities; converting directly to a dictionary loses the first column.")
extra = list(csv.DictReader(io.StringIO('Name,Email\nMaya,maya@example.invalid,extra\n')))[0]
check("ragged_rows_need_validation", extra[None] == ["extra"],
      "Parser success can leave unmapped extra cells.")
try:
    rows('Name\n"unterminated\n')
    strict_failed = False
except csv.Error:
    strict_failed = True
check("broken_quotes_are_not_repaired_by_guess", strict_failed,
      "Malformed quoting requires a structural correction, not silent row reconstruction.")
legacy = b"Name\nZo\xeb\n"
try:
    legacy.decode("utf-8", errors="strict")
    strict_decode_failed = False
except UnicodeDecodeError:
    strict_decode_failed = True
check("invalid_utf8_does_not_justify_replacement", strict_decode_failed and "\ufffd" in legacy.decode("utf-8", errors="replace"),
      "Replacement decoding destroys a supplied name while appearing successful.")
check("legacy_encoding_requires_named_interpretation", legacy.decode("cp1252") == "Name\nZoë\n",
      "An explicitly selected supported encoding can preserve the source; detection is not proof.")
check("leading_zero_identifier_is_text", rows('ID\n000123\n')[1][0] == "000123" and str(int("000123")) != "000123",
      "Numeric conversion destroys source identity and postal/phone formatting.")
large = "12345678901234567"
check("floating_point_is_not_identifier_storage", str(int(float(large))) != large,
      "Binary floating point loses a supplied 17-digit identifier; this is not a simulation of Excel.")
check("title_case_is_not_name_cleanup", "van der Waals".title() != "van der Waals",
      "Automatic title casing changes a valid supplied name.")
check("full_name_does_not_imply_family_name", len("Sukarno".split()) == 1 and len("小林康宏".split()) == 1,
      "A fixed first/last split cannot reconstruct international name structure.")
check("plus_address_stripping_conflates_values", "person+one@example.invalid" != "person+two@example.invalid",
      "Import transport must not invent provider-specific identity normalization.")
literal = '=HYPERLINK("https://example.invalid", "Open")'
stream = io.StringIO(newline="")
csv.writer(stream).writerow([literal])
check("csv_quoting_does_not_remove_formula_prefix", rows(stream.getvalue())[0][0] == literal,
      "Correct CSV escaping preserves the formula-looking text; spreadsheet execution is a separate risk.")
check("plus_phone_is_not_an_attack_to_strip", rows('Phone\n+442071234567\n')[1][0] == "+442071234567",
      "Security at export/render boundaries must not corrupt valid international phone text.")

ns = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
sheet = ET.fromstring('''<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<dimension ref="A1:XFD1048576"/><sheetData>
<row r="1"><c r="A1"><f>1+1</f><v>7</v></c><c r="B1"><f>CONCAT(A2,B2)</f></c></row>
<row r="2" hidden="1"><c r="A2" t="inlineStr"><is><t>Hidden contact</t></is></c></row>
</sheetData><mergeCells><mergeCell ref="A2:B2"/></mergeCells></worksheet>''')
cells = sheet.findall(".//s:c", ns)
check("formula_cache_can_disagree_with_formula", cells[0].find("s:f", ns).text == "1+1" and cells[0].find("s:v", ns).text == "7",
      "A parser can read an outdated/incorrect cached result; it cannot certify recalculation.")
check("missing_cache_is_not_empty_contact_value", cells[1].find("s:f", ns) is not None and cells[1].find("s:v", ns) is None,
      "No cached result is distinguishable from an intentionally empty string.")
check("hidden_rows_remain_in_file", sheet.find(".//s:row[@hidden='1']/s:c/s:is/s:t", ns).text == "Hidden contact",
      "Iterating XML cells ignores the user's visible-sheet view unless visibility is explicitly handled.")
check("merged_cells_do_not_supply_repeated_facts", len(sheet.findall(".//s:mergeCell", ns)) == 1 and len(cells) == 3,
      "A merged region does not authorize copying its value into every covered contact row.")
check("declared_dimensions_are_not_observed_cell_count", sheet.find("s:dimension", ns).attrib["ref"] == "A1:XFD1048576" and len(cells) == 3,
      "Sparse dimensions must not allocate the worksheet's maximum rectangular grid.")
rich = ET.fromstring('<si xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><r><t>Zoë </t></r><r><t>小林</t></r></si>')
check("rich_text_runs_are_one_text_value", "".join(t.text or "" for t in rich.findall(".//s:t", ns)) == "Zoë 小林",
      "Discarding later runs silently truncates a contact field.")
safe_cell = ET.Element("c", {"t": "inlineStr"})
ET.SubElement(ET.SubElement(safe_cell, "is"), "t").text = literal
check("explicit_text_output_has_no_formula_element", safe_cell.find("f") is None and safe_cell.find("is/t").text == literal,
      "Typed XLSX text is structurally distinct from a formula; no spreadsheet application was executed.")
archive = io.BytesIO()
with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as z:
    z.writestr("xl/worksheets/sheet1.xml", "A" * 100_000)
with zipfile.ZipFile(io.BytesIO(archive.getvalue())) as z:
    info = z.infolist()[0]
    check("compressed_size_is_not_resource_size", info.file_size == 100_000 and info.compress_size < 1000,
          "A small input can expand by more than 100x; enforce actual streamed expanded-byte budgets.")
traversal = PurePosixPath("../outside.xml")
check("archive_paths_need_validation", ".." in traversal.parts,
      "A ZIP member name is untrusted; the probe never extracts it.")
duplicate_archive = io.BytesIO()
with warnings.catch_warnings():
    warnings.simplefilter("ignore", UserWarning)
    with zipfile.ZipFile(duplicate_archive, "w") as z:
        z.writestr("xl/workbook.xml", "first")
        z.writestr("xl/workbook.xml", "second")
with zipfile.ZipFile(io.BytesIO(duplicate_archive.getvalue())) as z:
    names = z.namelist()
    check("duplicate_zip_parts_are_ambiguous", len(names) != len(set(names)),
          "Different consumers may select different package parts; reject duplicate normalized names.")
doctype = '<!DOCTYPE x [<!ENTITY value "Contact">]><x>&value;</x>'
check("xml_declaration_requires_explicit_guard", "<!DOCTYPE" in doctype and ET.fromstring(doctype).text == "Contact",
      "Even a standard parser can expand an internal entity; production must prohibit DTD/entity processing.")

# Added after independent review identified that populated-cell counting misses
# explicit empty fields/elements. These expose the budget gap; they do not test a
# production enforcement implementation or qualify parser memory/CPU limits.
empty_csv = ("," * 16_383 + "\n") * 31
empty_records = rows(empty_csv)
explicit_slots = sum(len(row) for row in empty_records)
populated_slots = sum(bool(cell) for row in empty_records for cell in row)
check("populated_only_budget_misses_explicit_csv_empties",
      len(empty_csv.encode()) < 10 * 1_048_576 and populated_slots == 0 and explicit_slots == 507_904,
      "A 507,904-byte CSV has zero populated cells but exceeds 500,000 explicit field slots; empty fields still consume parser work.")
overwide = rows("," * 16_384 + "\n")[0]
check("csv_record_width_needs_a_profile_bound", len(overwide) == 16_385 and not any(overwide),
      "A syntactically valid empty CSV row exceeds the proposed 16,384-field profile; parser success is not profile acceptance.")
empty_xml = ET.fromstring('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:XFD1048576"/><sheetData><row r="1"><c r="A1"/><c r="B1"/></row></sheetData></worksheet>')
present_cells = empty_xml.findall(".//s:c", ns)
check("explicit_empty_xml_cells_differ_from_absent_sparse_coordinates",
      len(present_cells) == 2 and all(cell.find("s:v", ns) is None for cell in present_cells),
      "Two explicit empty cell elements consume two slots; the enormous declared rectangular range is neither allocated nor counted as present cells.")

print(json.dumps({
    "purpose": "Synthetic falsification of unsafe file interpretation shortcuts; not a production importer/security/capacity proof",
    "runtime": platform.python_version(),
    "cases_passed": len(outcomes),
    "cases_total": len(outcomes),
    "outcomes": outcomes,
}, indent=2, ensure_ascii=False))
