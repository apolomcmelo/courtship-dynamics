# Methodology

## Overview

This project studies how romantic interactions begin and evolve by collecting real-life narratives and transforming them into structured behavioral data.

The goal is not to study opinions about dating, but to analyze **actual interaction patterns** reported by participants. These patterns are then used to generate controlled scenarios that allow the comparison between observed interaction patterns, perceived partner preference, and potential relationship outcomes described in scientific literature.

The methodology combines qualitative narrative collection with lightweight behavioral modeling.

---

## Research Approach

The project follows a multi-stage process:

1. Narrative data collection
2. Data cleaning and normalization
3. Behavioral variable extraction
4. Pattern identification
5. Scenario generation
6. Reaction comparison (real vs. perceived)

Each stage is described below.

---

## 1. Narrative Data Collection

Data is collected through anonymous surveys where participants describe real situations involving the beginning of a romantic interaction.

The survey focuses on **events rather than opinions**.

Participants are asked about:

- Where the interaction started
- Who initiated contact
- The form of the first interaction
- Time between first contact and first meeting
- Who proposed the meeting
- Early communication dynamics
- What happened after the first meeting
- Whether the interaction evolved into a routine

Some questions are structured (multiple choice), while others are open-ended to capture richer context.

The goal is to preserve **natural descriptions of social behavior** rather than force participants into predefined models.

---

## 2. Data Cleaning and Normalization

Survey responses contain natural variability, including:

- spelling variations
- synonymous answers
- informal descriptions
- inconsistent location formats

To allow analysis, responses are normalized into structured variables while preserving the raw data.

Examples of normalization:

Location normalization:
- "sao paulo"
- "São Paulo"
- "SP"

→ normalized to:

São Paulo

Interaction origin categories may also be normalized, such as:

- work / school
- social environment
- dating apps
- online communities
- spontaneous encounters

Raw responses are always preserved alongside normalized fields.

---

## 3. Behavioral Variable Extraction

Narrative responses are coded into behavioral variables.

Examples of extracted variables include:

Interaction origin
- work / school
- social venue
- online platform
- gaming environment
- spontaneous public interaction

Initiative
- male
- female
- mutual / natural emergence

Time to first meeting
- immediate
- less than one week
- about one month
- more than one month

Response dynamics
- fast
- moderate
- slow

Conversation trajectory
- increasing engagement
- stable interaction
- declining interaction

This step converts qualitative narratives into analyzable behavioral signals.

---

## 4. Pattern Identification

Once normalized, the dataset is explored to identify recurring patterns such as:

- common environments where interactions start
- typical time between first contact and first meeting
- initiative patterns
- communication dynamics
- escalation of interaction frequency

Because the dataset originates from real experiences, these patterns reflect **observed social dynamics rather than theoretical expectations**.

---

## 5. Scenario Generation

Observed patterns are used to construct realistic interaction scenarios representing early-stage romantic encounters. Scenario structures are derived from recurring interaction patterns identified during the pattern identification stage.

Each scenario describes a sequence of events including:

- context of the interaction
- form of first contact
- messaging dynamics
- timing of invitations
- behavioral cues displayed by the participants

These scenarios are not intended to reproduce specific real cases, but rather to represent **typical interaction structures** observed in the dataset.

The scenarios are then used to construct fictional characters that share the same situational context but differ in selected behavioral traits and interaction styles.

Participants are asked to evaluate these characters and indicate which one they would be more likely to date or meet in real life. In some cases, participants may be asked to **rank multiple options** according to their preference.

The purpose of this stage is to capture **perceived partner preference** based on behavioral signals presented in the scenarios.

---

## 6. Preference vs. Idealization Analysis

A core objective of this project is to explore the difference between:

1. **Perceived attractiveness of behavioral traits in early interactions**
2. **Long-term compatibility or likely relationship outcomes**

Participants' choices among scenario characters represent their **immediate preference** when evaluating potential partners.

These preferences are later contrasted with findings from scientific literature in fields such as:

- evolutionary psychology
- social psychology
- relationship science
- behavioral economics

For example, certain behavioral traits (e.g., high novelty-seeking, risk-taking, or highly adventurous behavior) may increase perceived attractiveness in early encounters but may also correlate with lower long-term relationship stability according to existing research.

By comparing participant choices with documented behavioral outcomes, the project explores potential gaps between:

- **what people are attracted to**
- **what tends to produce stable relationship outcomes**

---

## 7. Outcome Modeling

Based on established findings in relationship research, the project will associate certain behavioral profiles with probable relationship trajectories.

These outcomes are not predictions about individuals, but **probabilistic behavioral tendencies** grounded in existing research.

Examples of modeled outcomes may include:

- likelihood of long-term commitment
- relationship stability
- novelty-seeking vs. routine compatibility
- communication consistency
- attachment patterns

After participants select or rank preferred characters, the system can reveal potential long-term implications associated with those behavioral profiles.

This allows the project to highlight contrasts between **initial attraction signals** and **long-term relational dynamics**.

---

## Research Objective

The broader goal of this project is to better understand the relationship between:

- behavioral signals displayed in early romantic interactions
- perceived desirability of those signals
- and their potential long-term relationship implications.

Rather than prescribing correct choices, the project aims to illuminate the often complex relationship between **attraction, perception, and relationship outcomes**.

The project also seeks to explore whether intuitive partner preferences align with behavioral patterns associated with long-term relationship stability.
---

## Data Philosophy

This project prioritizes:

- real experiences over hypothetical opinions
- narrative richness over rigid survey structures
- transparency of data transformations
- reproducibility of analysis

All transformations from raw data to structured variables are documented in the repository.

---

## Limitations

The dataset is exploratory and may include biases such as:

- limited sample size
- demographic concentration
- self-reported narratives
- recall bias

Results should therefore be interpreted as **behavioral signals and exploratory patterns**, not universal conclusions.

---

## Future Directions

Potential extensions of this project include:

- larger datasets
- demographic segmentation
- automated narrative coding
- probabilistic interaction models
- simulation of interaction dynamics

The long-term goal is to better understand how early-stage romantic interactions actually unfold in contemporary social environments.
