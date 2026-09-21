# 03: Make the two endings visibly different

**What to build:** The variant becomes visible in play. When a Line win occurs, exactly the
three cells of the winning Line are highlighted, driven entirely by the engine's reported Line.
When a Fill win occurs, the Board is presented as full with no Line highlighted, in a treatment
visually distinct from a Line win, so it is clear there was no Line at all. A Line completed on
the ninth move highlights its Line and is not shown as a Fill win. The interface decides nothing:
it renders the engine's reported reason and Line and performs no rule check.

**Blocked by:** 01 (Take turns and reach both endings), 02 (Start a new game).

**Status:** ready-for-agent

- [ ] A Line win highlights exactly the three cells of the winning Line reported by the engine.
- [ ] When no Line is reported, no cell is highlighted.
- [ ] A Fill win presents the full Board with no Line highlighted, visually distinct from a Line win.
- [ ] A Line win on the ninth move highlights the Line rather than being presented as a Fill win.
- [ ] Highlight and distinct-Fill treatment are driven only by the engine's status; the interface holds no rule logic.
- [ ] Starting a new game clears any highlight and ending treatment.
