from __future__ import annotations

import csv
import re
import unicodedata
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RAW_FILE = ROOT / "data" / "raw" / "courtship-dynamics-survey.csv"
PROCESSED_DIR = ROOT / "data" / "processed"
PROCESSED_FILE = PROCESSED_DIR / "courtship-dynamics-survey-processed.csv"
ISSUES_FILE = PROCESSED_DIR / "courtship-dynamics-survey-issues.csv"
REPORT_FILE = PROCESSED_DIR / "courtship-dynamics-survey-cleaning-report.md"

PROCESSED_EXPORT_FIELDS = [
    "response_id",
    "submitted_at_utc",
    "origin_category",
    "origin_group",
    "origin_mode",
    "contact_initiator",
    "initial_contact_clean",
    "time_to_meeting_category",
    "time_to_meeting_context",
    "invitation_initiator",
    "response_rhythm",
    "first_date_invite_clean",
    "post_date_first_message",
    "routine_clean",
    "routine_category",
    "age_range",
    "location_normalized",
    "location_resolution",
    "gender",
    "sexual_orientation",
    "data_quality_flags",
    "consistency_status",
    "consistency_notes",
]

RAW_TEXT_FIELD_PAIRS = [
    ("initial_contact_raw", "initial_contact_clean"),
    ("first_date_invite_raw", "first_date_invite_clean"),
    ("routine_raw", "routine_clean"),
    ("location_raw", "location_clean"),
]

SOURCE_FIELDS = [
    "Carimbo de data/hora",
    "Onde tudo começou?",
    "Quem deu o primeiro passo e iniciou o contato?",
    "Como foi esse \"Oi\" inicial?",
    "Quanto tempo de conversa online antes do primeiro encontro?",
    "E quem soltou o \"vamos marcar\"?",
    "No começo, como era o ritmo das respostas?",
    "Como foi o convite para o primeiro encontro?",
    "Acabou o primeiro encontro... quem mandou a primeira mensagem depois?",
    "Depois desse dia, o papo virou rotina?",
    "Idade",
    "Localização (Cidade/Estado)",
    "Gênero",
    "Orientação Sexual",
]


STATE_NAMES = {
    "SP": "Sao Paulo",
    "SC": "Santa Catarina",
}

NARRATIVE_REPLACEMENTS = [
    (re.compile(r"\bCS\b", re.IGNORECASE), "CounterStrike"),
    (re.compile(r"\bpq\b", re.IGNORECASE), "porque"),
    (re.compile(r"\btb\b", re.IGNORECASE), "também"),
    (re.compile(r"\bmsg\b", re.IGNORECASE), "mensagem"),
    (re.compile(r"\bface\b", re.IGNORECASE), "facebook"),
    (re.compile(r"\bq\b", re.IGNORECASE), "que"),
    (re.compile(r"\bnao\b", re.IGNORECASE), "não"),
    (re.compile(r"\bja\b", re.IGNORECASE), "já"),
    (re.compile(r"\bso\b", re.IGNORECASE), "só"),
]


def clean_text(value: str) -> str:
    value = value or ""
    value = value.replace("\ufeff", "")
    value = re.sub(r"\s+", " ", value.replace("\r", " ").replace("\n", " "))
    return value.strip()


def fold_text(value: str) -> str:
    cleaned = clean_text(value).lower()
    normalized = unicodedata.normalize("NFKD", cleaned)
    return "".join(char for char in normalized if not unicodedata.combining(char))


def title_case_ascii(value: str) -> str:
    return " ".join(part.capitalize() for part in clean_text(value).split())


def apply_case_style(source: str, replacement: str) -> str:
    if not source:
        return replacement
    if any(char.isupper() for char in replacement[1:]):
        return replacement
    if source.isupper():
        return replacement.upper()
    if source[0].isupper():
        return replacement[:1].upper() + replacement[1:]
    return replacement


def normalize_narrative_text(value: str) -> str:
    cleaned = clean_text(value)
    for pattern, replacement in NARRATIVE_REPLACEMENTS:
        cleaned = pattern.sub(lambda match: apply_case_style(match.group(0), replacement), cleaned)
    cleaned = re.sub(r"(?<=\S)\.{3,}", "...", cleaned)
    cleaned = re.sub(r"\.\.\.(?=\S)", "... ", cleaned)
    cleaned = re.sub(r"…(?=\S)", "… ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


def normalize_timestamp(value: str) -> str:
    parsed = datetime.strptime(clean_text(value), "%Y/%m/%d %I:%M:%S %p GMT+0")
    return parsed.replace(tzinfo=timezone.utc).isoformat()


def normalize_origin(value: str) -> tuple[str, str, str]:
    folded = fold_text(value)
    mapping = {
        "barzinho / balada": ("bar_balada", "social_environment", "offline"),
        "trabalho / faculdade": ("trabalho_faculdade", "work_school", "offline"),
        "instagram (dm ou stories)": ("instagram", "online_communities", "online"),
        "tinder / bumble / apps de relacionamento em geral": ("dating_apps", "dating_apps", "online"),
        "jogo online": ("jogo_online", "online_communities", "online"),
        "rua": ("rua", "spontaneous_public", "offline"),
        "chat": ("chat", "online_communities", "online"),
    }
    return mapping.get(folded, ("outro", "other", "unknown"))


def normalize_initiative(value: str) -> str:
    folded = fold_text(value)
    mapping = {
        "eu": "respondent",
        "a outra pessoa": "other_person",
        "foi meio que ao mesmo tempo / natural": "mutual_natural",
    }
    return mapping.get(folded, "unknown")


def normalize_time_to_meeting(value: str) -> tuple[str, str]:
    folded = fold_text(value)
    mapping = {
        "nao comecou online, entao... ja estava la": ("no_online_phase", "offline_start"),
        "menos de uma semana": ("less_than_one_week", "online_before_meeting"),
        "cerca de um mes": ("about_one_month", "online_before_meeting"),
        "mais de um mes (pensei que nao ia acontecer nunca)": ("more_than_one_month", "online_before_meeting"),
    }
    return mapping.get(folded, ("unknown", "unknown"))


def normalize_invitation_initiator(value: str) -> str:
    folded = fold_text(value)
    mapping = {
        "eu chamei": "respondent",
        "a outra pessoa chamou": "other_person",
        "surgiu naturalmente no meio do assunto": "mutual_natural",
    }
    return mapping.get(folded, "unknown")


def normalize_response_rhythm(value: str) -> str:
    folded = fold_text(value)
    mapping = {
        "instantaneo (respondia na hora)": "fast",
        "ritmo normal (levava alguns minutos/uma horinha)": "moderate",
        "demorado (so respondia a noite ou horas depois)": "slow",
    }
    return mapping.get(folded, "unknown")


def normalize_first_message_after_date(value: str) -> str:
    folded = fold_text(value)
    mapping = {
        "a outra pessoa mandou primeiro": "other_person",
        "eu mandei logo que cheguei em casa": "respondent",
    }
    return mapping.get(folded, "unknown")


def normalize_routine(value: str) -> tuple[str, str]:
    folded = fold_text(value)
    if not folded:
        return "unknown", "unknown"
    if "esfria" in folded or "nao fosse o mesmo" in folded:
        return "declining", "no_or_declining"
    if "aument" in folded:
        return "increasing", "yes"
    if "virou rotina" in folded or "todo dia" in folded or "todos os dias" in folded or folded.startswith("sim"):
        return "established", "yes"
    if "manteve" in folded:
        return "stable", "yes"
    return "other", "unknown"


def normalize_age_range(value: str) -> tuple[str, str, str]:
    cleaned = clean_text(value)
    folded = fold_text(value)
    mapping = {
        "18 a 24 anos": ("18_24", "18", "24"),
        "25 a 34 anos": ("25_34", "25", "34"),
        "35 a 44 anos": ("35_44", "35", "44"),
    }
    return mapping.get(folded, (cleaned or "unknown", "", ""))


def normalize_gender(value: str) -> str:
    folded = fold_text(value)
    return {"feminino": "female"}.get(folded, "unknown")


def normalize_orientation(value: str) -> str:
    folded = fold_text(value)
    mapping = {
        "heterossexual": "heterosexual",
        "bissexual": "bisexual",
        "pansexual": "pansexual",
    }
    return mapping.get(folded, "unknown")


def normalize_location(value: str) -> dict[str, str]:
    cleaned = clean_text(value)
    folded = fold_text(value)

    exact_mapping = {
        "terra sem lei": {
            "city_normalized": "",
            "state_code_normalized": "",
            "state_name_normalized": "",
            "location_normalized": "Others",
            "location_resolution": "other_reported_location",
        },
        "sp": {
            "city_normalized": "",
            "state_code_normalized": "SP",
            "state_name_normalized": STATE_NAMES["SP"],
            "location_normalized": "SP",
            "location_resolution": "state_only",
        },
        "sc": {
            "city_normalized": "",
            "state_code_normalized": "SC",
            "state_name_normalized": STATE_NAMES["SC"],
            "location_normalized": "SC",
            "location_resolution": "state_only",
        },
        "sao paulo": {
            "city_normalized": "Sao Paulo",
            "state_code_normalized": "SP",
            "state_name_normalized": STATE_NAMES["SP"],
            "location_normalized": "Sao Paulo, SP",
            "location_resolution": "city_inferred_state",
        },
        "atibaia sp": {
            "city_normalized": "Atibaia",
            "state_code_normalized": "SP",
            "state_name_normalized": STATE_NAMES["SP"],
            "location_normalized": "Atibaia, SP",
            "location_resolution": "city_state_exact",
        },
        "mairipora sp": {
            "city_normalized": "Mairipora",
            "state_code_normalized": "SP",
            "state_name_normalized": STATE_NAMES["SP"],
            "location_normalized": "Mairipora, SP",
            "location_resolution": "city_state_exact",
        },
        "florianopolis / santa catarina, brasil": {
            "city_normalized": "Florianopolis",
            "state_code_normalized": "SC",
            "state_name_normalized": STATE_NAMES["SC"],
            "location_normalized": "Florianopolis, SC",
            "location_resolution": "city_state_country_exact",
        },
    }

    if folded in exact_mapping:
        return {"location_clean": cleaned, **exact_mapping[folded]}

    suffix_match = re.match(r"^(?P<city>.+?)\s+(?P<state>sp|sc)$", folded)
    if suffix_match:
        state_code = suffix_match.group("state").upper()
        city = title_case_ascii(suffix_match.group("city"))
        return {
            "location_clean": cleaned,
            "city_normalized": city,
            "state_code_normalized": state_code,
            "state_name_normalized": STATE_NAMES[state_code],
            "location_normalized": f"{city}, {state_code}",
            "location_resolution": "city_state_pattern",
        }

    return {
        "location_clean": cleaned,
        "city_normalized": "",
        "state_code_normalized": "",
        "state_name_normalized": "",
        "location_normalized": "",
        "location_resolution": "unmapped",
    }


def build_issue(issue_type: str, severity: str, field: str, details: str) -> dict[str, str]:
    return {
        "issue_type": issue_type,
        "severity": severity,
        "field": field,
        "details": details,
    }


def collect_issues(processed_row: dict[str, str]) -> list[dict[str, str]]:
    issues: list[dict[str, str]] = []

    if processed_row["origin_mode"] == "online" and processed_row["time_to_meeting_category"] == "no_online_phase":
        issues.append(
            build_issue(
                "possible_inconsistency_online_origin",
                "warning",
                "time_to_meeting_category",
                "Origin indicates an online start, but the response says there was no online phase before the first meeting.",
            )
        )

    if processed_row["location_resolution"] == "unmapped":
        issues.append(
            build_issue(
                "location_unmapped",
                "warning",
                "location_raw",
                "Location could not be normalized to city/state without guessing.",
            )
        )

    invite_folded = fold_text(processed_row["first_date_invite_clean"])
    organic_inclusion_markers = ["aconteceu", "se incluiu", "incluiu", "ja na rua"]
    has_organic_inclusion_context = any(marker in invite_folded for marker in organic_inclusion_markers)
    if "nao teve" in invite_folded and not has_organic_inclusion_context and processed_row["invitation_initiator"] != "mutual_natural":
        issues.append(
            build_issue(
                "possible_inconsistency_invitation",
                "warning",
                "first_date_invite_clean",
                "Invite description says there was no clear invitation, but the structured field assigns the initiative to one side.",
            )
        )

    return issues


def build_verification_stats(raw_rows: list[dict[str, str]], processed_rows: list[dict[str, str]]) -> Counter:
    stats: Counter = Counter()
    stats["raw_rows_total"] = len(raw_rows)
    stats["processed_rows_total"] = len(processed_rows)

    raw_signatures = [tuple(row[field] for field in SOURCE_FIELDS) for row in raw_rows]
    duplicate_signature_count = sum(count - 1 for count in Counter(raw_signatures).values() if count > 1)
    stats["duplicate_raw_rows"] = duplicate_signature_count

    for raw_field, clean_field in RAW_TEXT_FIELD_PAIRS:
        changed_count = sum(1 for row in processed_rows if row[raw_field] != row[clean_field])
        stats[f"field_changes::{raw_field}"] = changed_count

    return stats


def export_processed_rows(processed_rows: list[dict[str, str]]) -> list[dict[str, str]]:
    return [{field: row[field] for field in PROCESSED_EXPORT_FIELDS} for row in processed_rows]


def build_processed_rows() -> tuple[list[dict[str, str]], list[dict[str, str]], Counter, Counter]:
    with RAW_FILE.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        raw_rows = [{clean_text(key): value or "" for key, value in row.items()} for row in reader]

    processed_rows: list[dict[str, str]] = []
    issues_rows: list[dict[str, str]] = []
    stats: Counter = Counter()

    for index, raw in enumerate(raw_rows, start=1):
        origin_category, origin_group, origin_mode = normalize_origin(raw["Onde tudo começou?"])
        time_to_meeting_category, time_context = normalize_time_to_meeting(raw["Quanto tempo de conversa online antes do primeiro encontro?"])
        routine_category, routine_flag = normalize_routine(raw["Depois desse dia, o papo virou rotina?"])
        age_range, age_min, age_max = normalize_age_range(raw["Idade"])
        location = normalize_location(raw["Localização (Cidade/Estado)"])

        processed_row = {
            "response_id": str(index),
            "submitted_at_raw": raw["Carimbo de data/hora"],
            "submitted_at_utc": normalize_timestamp(raw["Carimbo de data/hora"]),
            "origin_raw": raw["Onde tudo começou?"],
            "origin_category": origin_category,
            "origin_group": origin_group,
            "origin_mode": origin_mode,
            "contact_initiator_raw": raw["Quem deu o primeiro passo e iniciou o contato?"],
            "contact_initiator": normalize_initiative(raw["Quem deu o primeiro passo e iniciou o contato?"]),
            "initial_contact_raw": raw["Como foi esse \"Oi\" inicial?"],
            "initial_contact_clean": normalize_narrative_text(raw["Como foi esse \"Oi\" inicial?"]),
            "time_to_meeting_raw": raw["Quanto tempo de conversa online antes do primeiro encontro?"],
            "time_to_meeting_category": time_to_meeting_category,
            "time_to_meeting_context": time_context,
            "invitation_initiator_raw": raw["E quem soltou o \"vamos marcar\"?"],
            "invitation_initiator": normalize_invitation_initiator(raw["E quem soltou o \"vamos marcar\"?"]),
            "response_rhythm_raw": raw["No começo, como era o ritmo das respostas?"],
            "response_rhythm": normalize_response_rhythm(raw["No começo, como era o ritmo das respostas?"]),
            "first_date_invite_raw": raw["Como foi o convite para o primeiro encontro?"],
            "first_date_invite_clean": normalize_narrative_text(raw["Como foi o convite para o primeiro encontro?"]),
            "post_date_first_message_raw": raw["Acabou o primeiro encontro... quem mandou a primeira mensagem depois?"],
            "post_date_first_message": normalize_first_message_after_date(raw["Acabou o primeiro encontro... quem mandou a primeira mensagem depois?"]),
            "routine_raw": raw["Depois desse dia, o papo virou rotina?"],
            "routine_clean": normalize_narrative_text(raw["Depois desse dia, o papo virou rotina?"]),
            "routine_category": routine_category,
            "routine_flag": routine_flag,
            "age_range_raw": raw["Idade"],
            "age_range": age_range,
            "age_min": age_min,
            "age_max": age_max,
            "location_raw": raw["Localização (Cidade/Estado)"],
            **location,
            "gender_raw": raw["Gênero"],
            "gender": normalize_gender(raw["Gênero"]),
            "sexual_orientation_raw": raw["Orientação Sexual"],
            "sexual_orientation": normalize_orientation(raw["Orientação Sexual"]),
        }

        row_issues = collect_issues(processed_row)
        issue_types = [issue["issue_type"] for issue in row_issues]
        processed_row["data_quality_flags"] = "; ".join(issue_types)
        processed_row["consistency_status"] = "needs_review" if any("possible_inconsistency" in item for item in issue_types) else "ok"
        processed_row["consistency_notes"] = "; ".join(issue["details"] for issue in row_issues)

        processed_rows.append(processed_row)
        stats["responses_total"] += 1
        stats[f"origin_group::{origin_group}"] += 1
        stats[f"response_rhythm::{processed_row['response_rhythm']}"] += 1
        stats[f"routine_category::{routine_category}"] += 1
        stats[f"location_resolution::{processed_row['location_resolution']}"] += 1
        stats[f"consistency_status::{processed_row['consistency_status']}"] += 1

        for issue in row_issues:
            stats[f"issue::{issue['issue_type']}"] += 1
            issues_rows.append(
                {
                    "response_id": processed_row["response_id"],
                    "submitted_at_utc": processed_row["submitted_at_utc"],
                    **issue,
                }
            )

    verification_stats = build_verification_stats(raw_rows, processed_rows)
    return processed_rows, issues_rows, stats, verification_stats


def write_csv(path: Path, rows: list[dict[str, str]], fieldnames: list[str] | None = None) -> None:
    resolved_fieldnames = fieldnames or (list(rows[0].keys()) if rows else [])
    if not resolved_fieldnames:
        return
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=resolved_fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def write_report(stats: Counter, verification_stats: Counter, processed_rows: list[dict[str, str]], issues_rows: list[dict[str, str]]) -> None:
    lines = [
        "# Cleaning Report",
        "",
        f"- Source file: {RAW_FILE.relative_to(ROOT).as_posix()}",
        f"- Processed responses: {stats['responses_total']}",
        f"- Processed dataset: {PROCESSED_FILE.relative_to(ROOT).as_posix()}",
        f"- Issues dataset: {ISSUES_FILE.relative_to(ROOT).as_posix()}",
        "",
        "## What was normalized",
        "",
        "- Trimmed headers and text values, collapsed internal line breaks and repeated spaces.",
        "- Converted submission timestamps to ISO 8601 UTC.",
        "- Mapped structured answers to analysis-friendly categories for origin, initiative, time to meeting, invitation initiative, response rhythm, post-date messaging, age range, gender, and sexual orientation.",
        "- Standardized location data internally and exported the final normalized location plus its resolution method.",
        "- Read the original source values for verification and exported only cleaned and normalized columns in the processed dataset.",
        "",
        "## Verification",
        "",
        "These checks validate the processing pipeline internally. They are not additional analytical variables in the processed CSV.",
        "",
        f"- Raw rows read: {verification_stats['raw_rows_total']}",
        f"- Processed rows written: {verification_stats['processed_rows_total']}",
        f"- Duplicate raw response rows found: {verification_stats['duplicate_raw_rows']}",
        f"- initial_contact_clean required normalization relative to the raw source in {verification_stats['field_changes::initial_contact_raw']} rows.",
        f"- first_date_invite_clean required normalization relative to the raw source in {verification_stats['field_changes::first_date_invite_raw']} rows.",
        f"- routine_clean required normalization relative to the raw source in {verification_stats['field_changes::routine_raw']} rows.",
        f"- location_clean required normalization relative to the raw source in {verification_stats['field_changes::location_raw']} rows.",
        "",
        "## Location normalization",
        "",
    ]

    for row in processed_rows:
        lines.append(
            f"- Response {row['response_id']}: '{row['location_raw']}' -> '{row['location_normalized'] or '[unmapped]'}' ({row['location_resolution']})"
        )

    lines.extend(
        [
            "",
            "## Issues found",
            "",
            f"- Rows with issues: {len({issue['response_id'] for issue in issues_rows})}",
            f"- Total issue records: {len(issues_rows)}",
        ]
    )

    if issues_rows:
        for issue in issues_rows:
            lines.append(
                f"- Response {issue['response_id']}: {issue['issue_type']} [{issue['field']}] {issue['details']}"
            )
    else:
        lines.append("- No issues were detected by the validation rules.")

    REPORT_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    processed_rows, issues_rows, stats, verification_stats = build_processed_rows()
    processed_export_rows = export_processed_rows(processed_rows)
    write_csv(PROCESSED_FILE, processed_export_rows, PROCESSED_EXPORT_FIELDS)
    write_csv(ISSUES_FILE, issues_rows, ["response_id", "submitted_at_utc", "issue_type", "severity", "field", "details"])
    write_report(stats, verification_stats, processed_rows, issues_rows)
    print(f"Wrote {len(processed_rows)} rows to {PROCESSED_FILE}")
    print(f"Wrote {len(issues_rows)} issues to {ISSUES_FILE}")
    print(f"Wrote report to {REPORT_FILE}")


if __name__ == "__main__":
    main()