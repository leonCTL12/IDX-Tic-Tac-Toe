# 04: Write docs/DESIGN.md

**What to build:** The brief's documentation deliverable, written against the finished game. It
covers all four required areas: the reading of the brief and the ambiguities found and how they
were resolved; the rule sets considered and rejected, with reasons and measured numbers; the
informal argument that a Draw is impossible and that play always terminates, citing the
exhaustive enumeration already committed in `docs/research/no-draw-variants.md`; and anything
known to be broken or unfinished. It uses the vocabulary of `CONTEXT.md` and stays consistent
with ADR-0001, and it claims Balance only empirically under a stated play policy, never at
perfect play. The rule itself is not restated or altered; `docs/RULES.md` remains the authority.

**Blocked by:** 01 (Take turns and reach both endings), 02 (Start a new game), 03 (Make the two endings visibly different).

**Status:** ready-for-agent

- [ ] Records the reading of the brief and every ambiguity found, with how it was resolved.
- [ ] Lists the rejected rule sets with reasons and measured numbers, consistent with ADR-0001 and the research note.
- [ ] Argues that Draws are impossible and that play always terminates, citing the exhaustive enumeration in `docs/research/no-draw-variants.md`.
- [ ] States honestly anything that is broken or unfinished, including the time-box status.
- [ ] Claims Balance only empirically under a named play policy; does not overclaim it for perfect or competent play.
- [ ] Uses the terms Board, Mark, Line, Line win, Fill win, Draw, Terminal, and Balance as defined in `CONTEXT.md`.
- [ ] Does not change `docs/RULES.md` or re-derive the rule elsewhere.
