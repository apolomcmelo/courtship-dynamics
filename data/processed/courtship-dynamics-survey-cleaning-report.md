# Cleaning Report

- Source file: data/raw/courtship-dynamics-survey.csv
- Processed responses: 10
- Processed dataset: data/processed/courtship-dynamics-survey-processed.csv
- Issues dataset: data/processed/courtship-dynamics-survey-issues.csv

## What was normalized

- Trimmed headers and text values, collapsed internal line breaks and repeated spaces.
- Converted submission timestamps to ISO 8601 UTC.
- Mapped structured answers to analysis-friendly categories for origin, initiative, time to meeting, invitation initiative, response rhythm, post-date messaging, age range, gender, and sexual orientation.
- Standardized location data internally and exported the final normalized location plus its resolution method.
- Read the original source values for verification and exported only cleaned and normalized columns in the processed dataset.

## Verification

These checks validate the processing pipeline internally. They are not additional analytical variables in the processed CSV.

- Raw rows read: 10
- Processed rows written: 10
- Duplicate raw response rows found: 0
- initial_contact_clean required normalization relative to the raw source in 7 rows.
- first_date_invite_clean required normalization relative to the raw source in 8 rows.
- routine_clean required normalization relative to the raw source in 3 rows.
- location_clean required normalization relative to the raw source in 3 rows.

## Location normalization

- Response 1: 'SC' -> 'SC' (state_only)
- Response 2: 'São Paulo ' -> 'Sao Paulo, SP' (city_inferred_state)
- Response 3: 'Atibaia SP' -> 'Atibaia, SP' (city_state_exact)
- Response 4: 'Atibaia SP' -> 'Atibaia, SP' (city_state_exact)
- Response 5: 'Mairiporã SP' -> 'Mairipora, SP' (city_state_exact)
- Response 6: 'sao paulo' -> 'Sao Paulo, SP' (city_inferred_state)
- Response 7: 'Terra sem lei' -> 'Others' (other_reported_location)
- Response 8: 'São paulo ' -> 'Sao Paulo, SP' (city_inferred_state)
- Response 9: 'Florianopolis / Santa Catarina,  Brasil' -> 'Florianopolis, SC' (city_state_country_exact)
- Response 10: 'SP' -> 'SP' (state_only)

## Issues found

- Rows with issues: 0
- Total issue records: 0
- No issues were detected by the validation rules.
