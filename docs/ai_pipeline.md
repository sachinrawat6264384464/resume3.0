# CloudOps AI Assessment Platform — AI Evaluation & Speech Pipeline

## 1. 5-Pillar Technical Assessment Rubric

Every spoken answer submitted by a candidate is processed through the 5-pillar scoring model:

| Evaluation Pillar | Standard Weight | Definition |
|---|---|---|
| **Technical Accuracy** | **40%** | Precision of technical statements, correctness of commands, flags, tools, and avoidance of hallucinations. |
| **Concept Coverage** | **25%** | Percentage of target core concepts and expected keywords addressed by the candidate. |
| **Reasoning Quality** | **20%** | Articulation of cause-and-effect, failure modes, trade-offs, and architectural decision rationales. |
| **Practical Knowledge** | **10%** | Demonstration of real-world production triage runbooks, CLI flags, metrics, and log inspection. |
| **Communication Clarity** | **5%** | Structural organization, brevity, and logical flow of the spoken response. |

$$\text{Overall Score} = (0.40 \times \text{Tech}) + (0.25 \times \text{Concept}) + (0.20 \times \text{Reasoning}) + (0.10 \times \text{Practical}) + (0.05 \times \text{Comm})$$

---

## 2. Observable Verbal Confidence Analysis

The platform measures communication confidence strictly through observable speech indicators without making psychological or pseudo-scientific claims:

### Verbal Signals Analyzed:
1. **Speech Cadence (Words Per Minute)**: Calculates WPM from audio recording duration. Baseline conversational cadence: 110–160 WPM.
2. **Filler Word Frequency**: Detects occurrences of conversational crutches (`"um"`, `"uh"`, `"like"`, `"you know"`, `"basically"`, `"actually"`, `"kind of"`, `"maybe"`). High filler density (> 6% of words) decreases verbal fluency score.
3. **Hesitation Pauses**: Detects unnatural pauses and fragmented phrasing.
4. **Structural Coherence**: Evaluates whether the candidate answered directly with structured progression.

### Standard Privacy Notice:
> *"The confidence indicator is an estimate derived from observable verbal patterns (hesitation pauses, speech pacing, filler-word frequency, and structural clarity). It is not a psychological assessment."*

---

## 3. Stage Gate Progression Rule

- **Default Passing Bar**: **80.0%**
- **Progression Logic**:
  - Stage 1 is unlocked upon starting.
  - Stage 2 remains locked until the candidate scores $\ge 80\%$ on Stage 1.
  - Stage 3 remains locked until the candidate scores $\ge 80\%$ on Stage 2.
  - Stage 4 remains locked until the candidate scores $\ge 80\%$ on Stage 3.
  - If a stage score is $< 80\%$, the assessment halts further progression and generates an immediate remediation roadmap.
  - Administrators can review the candidate's audio/video recording and issue a manual override with compliance audit justification.

---

## 4. 90-Day Automated Recording Retention Pipeline

To satisfy enterprise privacy and storage lifecycle requirements:

1. Every recording is tagged at creation with `expires_at = NOW() + 90 days`.
2. An asynchronous background worker (`APScheduler`) executes periodically.
3. Finds active recordings where `expires_at <= NOW()` and `deleted_at IS NULL`.
4. Deletes the physical video chunk from Google Drive / Local Object Storage.
5. Updates database record: `deleted_at = NOW()`, `deletion_status = 'RETENTION_PURGED'`.
6. Creates an immutable `AuditLog` entry.
7. Deletion is strictly **idempotent**.
