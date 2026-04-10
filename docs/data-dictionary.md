# Data Dictionary

## Scope

This document describes the cleaned datasets generated from the raw survey file:

- `data/processed/courtship-dynamics-survey-processed.csv`
- `data/processed/courtship-dynamics-survey-issues.csv`

The processed dataset is analysis-oriented. It keeps cleaned free-text fields and normalized categorical variables. Raw source values are not exported in the processed CSV.

## Processing Principles

- Source: `data/raw/courtship-dynamics-survey.csv`
- Timestamp normalization: converted to ISO 8601 in UTC
- Text cleaning: trim leading and trailing whitespace, collapse internal line breaks, collapse repeated spaces
- Category normalization: map survey answers to analysis-friendly codes
- Location normalization: represent locations as `City, UF` when city and state are identified; represent state-only answers as `UF`
- Conservative handling: if a value cannot be normalized without guessing, leave it blank or flag it for review

## Processed Dataset

File: `data/processed/courtship-dynamics-survey-processed.csv`

| Column | Type | Description | Allowed values / format |
| --- | --- | --- | --- |
| `response_id` | integer-like string | Sequential identifier assigned during processing, preserving row order from the raw file. | `1`, `2`, `3`, ... |
| `submitted_at_utc` | datetime string | Submission timestamp normalized to UTC. | ISO 8601, example: `2026-03-02T21:37:11+00:00` |
| `origin_category` | categorical | Specific normalized category for where the interaction started. | `bar_balada`, `trabalho_faculdade`, `instagram`, `dating_apps`, `jogo_online`, `rua`, `chat`, `outro` |
| `origin_group` | categorical | Broader grouping of interaction origin. | `social_environment`, `work_school`, `dating_apps`, `online_communities`, `spontaneous_public`, `other` |
| `origin_mode` | categorical | Whether the interaction started online or offline. | `online`, `offline`, `unknown` |
| `contact_initiator` | categorical | Who initiated the first contact. | `respondent`, `other_person`, `mutual_natural`, `unknown` |
| `initial_contact_clean` | text | Cleaned description of the first contact or opening interaction. | Free text |
| `time_to_meeting_category` | categorical | Normalized category for time elapsed between online contact and first meeting. | `no_online_phase`, `less_than_one_week`, `about_one_month`, `more_than_one_month`, `unknown` |
| `time_to_meeting_context` | categorical | Context for interpreting the time-to-meeting category. | `offline_start`, `online_before_meeting`, `unknown` |
| `invitation_initiator` | categorical | Who initiated the first meeting invitation. | `respondent`, `other_person`, `mutual_natural`, `unknown` |
| `response_rhythm` | categorical | Speed of replies at the start of the interaction. | `fast`, `moderate`, `slow`, `unknown` |
| `first_date_invite_clean` | text | Cleaned description of how the first meeting was proposed. | Free text |
| `post_date_first_message` | categorical | Who sent the first message after the first meeting. | `respondent`, `other_person`, `unknown` |
| `routine_clean` | text | Cleaned description of whether communication became routine after the first meeting. | Free text |
| `routine_category` | categorical | Normalized pattern of post-date communication trajectory. | `increasing`, `declining`, `established`, `stable`, `other`, `unknown` |
| `age_range` | categorical | Normalized age bracket. | `18_24`, `25_34`, `35_44`, or original cleaned value if unmapped |
| `location_normalized` | text | Final normalized location used for analysis. | `City, UF`, `UF`, `City, Country`, `Others`, or blank if unmapped |
| `location_resolution` | categorical | How location normalization was resolved. | `state_only`, `city_inferred_state`, `city_state_exact`, `city_state_country_exact`, `city_country_exact`, `city_state_pattern`, `other_reported_location`, `unmapped` |
| `gender` | categorical | Normalized participant gender. | `female`, `unknown` |
| `sexual_orientation` | categorical | Normalized sexual orientation. | `heterosexual`, `bisexual`, `pansexual`, `unknown` |
| `data_quality_flags` | text | Semicolon-separated issue codes raised during validation. Blank means no issues were flagged. | Example: `possible_inconsistency_invitation` |
| `consistency_status` | categorical | Summary status from validation checks. | `ok`, `needs_review` |
| `consistency_notes` | text | Human-readable explanation of the validation result. | Free text; blank when no issue was flagged |

## Location Rules

| Situation | Output example |
| --- | --- |
| State only identified | `SC` |
| City and state identified | `Atibaia, SP` |
| City, state, and country in source | `Florianopolis, SC` |
| Foreign city identified without state | `Cascais, Portugal` |
| Ambiguous but intentionally grouped as non-standard location | `Others` with `location_resolution = other_reported_location` |
| Ambiguous or non-geographic answer not covered by a rule | blank `location_normalized` with `location_resolution = unmapped` |

## Issues Dataset

File: `data/processed/courtship-dynamics-survey-issues.csv`

This file contains one row per validation issue, not one row per response. A response can appear multiple times if multiple issues are detected.

| Column | Type | Description | Allowed values / format |
| --- | --- | --- | --- |
| `response_id` | integer-like string | Response identifier matching the processed dataset. | `1`, `2`, `3`, ... |
| `submitted_at_utc` | datetime string | UTC timestamp matching the processed dataset. | ISO 8601 |
| `issue_type` | categorical | Machine-readable issue code. | `possible_inconsistency_invitation`, `location_unmapped`, `possible_inconsistency_online_origin` |
| `severity` | categorical | Severity assigned by the validation rule. | `warning` |
| `field` | text | Field that triggered the issue. This may refer to an internal validation field name, including source-oriented names not exported in the processed CSV. | Example: `first_date_invite_clean`, `location_raw` |
| `details` | text | Human-readable explanation of the issue. | Free text |

## Current Known Issue Types

| Issue type | Meaning |
| --- | --- |
| `possible_inconsistency_invitation` | The structured invitation answer conflicts with the free-text invitation description. |
| `location_unmapped` | The source location could not be normalized without guessing. |
| `possible_inconsistency_online_origin` | The origin suggests an online start, but the time-to-meeting answer says there was no online phase. |

## Notes For Analysis

- `initial_contact_clean`, `first_date_invite_clean`, and `routine_clean` are cleaned narrative fields and may still require coding for advanced qualitative analysis.
- `Others` in `location_normalized` means the answer was intentionally grouped into a non-specific location bucket instead of forcing a geographic guess.
- Blank normalized location fields should be treated as missing data rather than inferred values.
- `consistency_status = needs_review` should be inspected before drawing strong conclusions from a small sample.