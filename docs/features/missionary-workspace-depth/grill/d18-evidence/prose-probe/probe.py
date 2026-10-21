#!/usr/bin/env python3
"""Synthetic counterexamples to prose-integrity shortcuts; never calls an AI.

This is not a production validator, language-quality evaluation, or proof that a
model preserves meaning. It demonstrates why simple scanners and text offsets
cannot establish that claim. Standard library only, invented text, no network.
"""

from collections import Counter
from difflib import SequenceMatcher
import hashlib
import json
import platform
import re
import unicodedata


outcomes = []


def check(name, passed, observation):
    assert passed, name
    outcomes.append({"name": name, "passed": True, "observation": observation})


def digits(value):
    return re.findall(r"\d+(?:[.,]\d+)?", value)


def digest(value):
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


original = "We have not reached 50 families."
changed = "We have reached 50 families."
check("same_numbers_do_not_preserve_negation", digits(original) == digits(changed),
      "The same number appears in both sentences even though the outcome is reversed.")
check("high_similarity_does_not_preserve_meaning", SequenceMatcher(None, original, changed).ratio() > 0.90,
      "A change reversing the claim still has over 90 percent character-sequence similarity.")
original = "Maya thanked Jordan."
changed = "Jordan thanked Maya."
check("same_names_do_not_preserve_roles", sorted(original.rstrip('.').split()) == sorted(changed.rstrip('.').split()),
      "Identical word inventory can reverse who performed the action.")
check("same_numeric_value_does_not_preserve_currency", digits("The goal is USD 500.") == digits("The goal is EUR 500."),
      "Digit checking misses a currency change.")
check("same_numeric_value_does_not_preserve_period", digits("We need 500 each month.") == digits("We need 500 this year."),
      "Digit checking misses a material funding-period change.")
check("shortening_can_drop_material_conditions", "if funds permit" not in "We will travel in June." and len("We will travel in June.") < len("We will travel in June if funds permit."),
      "A shorter grammatical sentence can remove the condition that made the statement true.")
check("lengthening_can_add_unsupported_history", "again" not in "We met with the group." and "again" in "We met with the group again.",
      "One added word invents a previous meeting without adding any number or name.")
check("rephrasing_can_strengthen_uncertainty", digits("We hope to visit 5 schools.") == digits("We will visit 5 schools."),
      "Changing hope into certainty is material even when names and numbers stay fixed.")
check("word_count_is_not_language_neutral", len("Thank you for your prayers".split()) == 5 and len("皆さんのお祈りに感謝します".split()) == 1,
      "Whitespace splitting is not a meaningful cross-language length metric.")
check("unicode_representation_is_not_character_count", len("é") == 1 and len("e\u0301") == 2 and unicodedata.normalize("NFC", "e\u0301") == "é",
      "Equivalent visible text may have distinct code point counts; arbitrary offsets can split a grapheme.")
prefix = "Hello 🌍 "
check("browser_utf16_offset_is_not_python_codepoint_offset", len(prefix.encode("utf-16-le")) // 2 != len(prefix),
      "UTF-16 code units and code points differ; raw offsets are not an editor-neutral selection identity.")
block_a = {"id": "paragraph-a", "text": "Thank you for praying."}
block_b = {"id": "paragraph-b", "text": "Thank you for praying."}
check("text_digest_alone_does_not_identify_target", digest(block_a["text"]) == digest(block_b["text"]) and block_a["id"] != block_b["id"],
      "Repeated text has the same digest in different blocks; stable semantic target identity is also needed.")
before = ["donation-link", "unsubscribe-link"]
after = ["donation-link", "donation-link", "unsubscribe-link"]
check("placeholder_set_equality_misses_duplication", set(before) == set(after) and Counter(before) != Counter(after),
      "A set comparison permits duplicated protected references; identity, multiplicity and structure matter.")
old_link = {"label": "Give", "href": "https://example.invalid/approved"}
new_link = {"label": "Give", "href": "https://example.invalid/other"}
check("visible_text_diff_misses_link_target_change", old_link["label"] == new_link["label"] and old_link["href"] != new_link["href"],
      "Identical visible wording does not preserve the structured link destination.")
source_quote = 'Maya said, "We may visit."'
changed_quote = 'Maya said, "We will visit."'
check("quote_attribution_does_not_authorize_rewriting", source_quote.split('"')[0] == changed_quote.split('"')[0] and source_quote != changed_quote,
      "Keeping the speaker name does not preserve what the speaker actually said.")
source = {"revision": 7, "target_id": "paragraph-a", "text": "Our planned visit."}
current = {"revision": 8, "target_id": "paragraph-a", "text": "Our postponed visit."}
check("same_target_id_does_not_authorize_stale_apply", source["target_id"] == current["target_id"] and digest(source["text"]) != digest(current["text"]),
      "An unchanged block ID does not make a suggestion generated from an old draft applicable.")

print(json.dumps({
    "purpose": "Synthetic prose-integrity counterexamples, not model-quality or production-validator proof",
    "runtime": platform.python_version(),
    "model_calls": 0,
    "cases_passed": len(outcomes),
    "cases_total": len(outcomes),
    "outcomes": outcomes,
}, ensure_ascii=False, indent=2))
