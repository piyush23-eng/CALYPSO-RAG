# GATE Computer Science (1990 - 2026): Theory of Computation (TOC) & Compiler Design PYQ Archive

## Question GATE-1999-TOC-01: TOC - Decidability of Context-Free Languages
**Topic**: Theory of Computation / Decidability & Chomsky Hierarchy
**Question**:
Which of the following problems is DECIDABLE for Context-Free Grammars (CFGs)?
(A) Is $L(G) = \Sigma^*$? (Universality)
(B) Is $L(G_1) \cap L(G_2) = \emptyset$? (Disjointness)
(C) Is $L(G) = \emptyset$? (Emptiness)
(D) Is $L(G_1) \subseteq L(G_2)$? (Subset Inclusion)

**Key Technical Concepts**: Decidable vs Undecidable Problems for CFLs, Emptiness Problem ($L(G)=\emptyset$), Finiteness Problem, Membership Problem (CYK Algorithm), Undecidability of Ambiguity, Universality, and Equivalence.

**Step-by-Step Solution & Derivation**:
- **Context-Free Languages Decidability Table**:
  - **Decidable for CFGs**:
    1. **Membership Problem**: Is $w \in L(G)$? (Decidable in $O(n^3)$ via CYK algorithm).
    2. **Emptiness Problem**: Is $L(G) = \emptyset$? (Decidable by checking if start symbol $S$ derives any string of terminals).
    3. **Finiteness Problem**: Is $|L(G)| < \infty$? (Decidable by checking cycles in the reduced grammar graph).
  - **Undecidable for CFGs**:
    1. Universality ($L(G) = \Sigma^*$).
    2. Equivalence ($L(G_1) = L(G_2)$).
    3. Intersection / Disjointness ($L(G_1) \cap L(G_2) = \emptyset$).
    4. Subset Inclusion ($L(G_1) \subseteq L(G_2)$).
    5. Ambiguity of a CFG.
- Hence, only the **Emptiness Problem** is decidable.

**Correct Answer**: (C) Is $L(G) = \emptyset$? (Emptiness)

---

## Question GATE-2012-TOC-02: TOC - Pumping Lemma for Regular Languages
**Topic**: Theory of Computation / Regular Languages & Pumping Lemma
**Question**:
Which of the following languages over the alphabet $\Sigma = \{a, b\}$ is REGULAR?
(A) $L_1 = \{ a^n b^n \mid n \ge 0 \}$
(B) $L_2 = \{ w w^R \mid w \in \{a, b\}^* \}$
(C) $L_3 = \{ a^n b^m \mid n \ne m \}$
(D) $L_4 = \{ a^n b^m \mid n, m \ge 0 \text{ and } (n + m) \text{ is even} \}$

**Key Technical Concepts**: Regular Languages, Finite Automata, Memorylessness, Pumping Lemma, Parity DFA Construction.

**Step-by-Step Solution & Derivation**:
- Analysis of Options:
  - $L_1 = \{a^n b^n \mid n \ge 0\}$: Requires unbounded counting to match the number of $a$'s and $b$'s $\implies$ **Non-regular (Deterministic Context-Free)**.
  - $L_2 = \{w w^R \mid w \in \{a, b\}^*\}$: Palindrome language requiring unbounded stack storage $\implies$ **Non-regular (Context-Free)**.
  - $L_3 = \{a^n b^m \mid n \ne m\}$: Requires comparing count of $a$'s and $b$'s $\implies$ **Non-regular (Context-Free)**.
  - $L_4 = \{a^n b^m \mid (n + m) \equiv 0 \pmod 2\}$:
    - Condition: Total length $(n + m)$ is even, with all $a$'s preceding all $b$'s.
    - We can construct a simple 4-state Deterministic Finite Automaton (DFA) tracking the parity (even/odd) of $a$'s and $b$'s.
    - Since a finite state machine recognizes $L_4$, $L_4$ is **REGULAR**!

**Correct Answer**: (D) $L_4 = \{ a^n b^m \mid n, m \ge 0 \text{ and } (n + m) \text{ is even} \}$

---

## Question GATE-2018-COMP-03: Compiler Design - LR Parsing Conflicts
**Topic**: Compiler Design / Syntax Analysis & LR Parsers
**Question**:
Which of the following statements regarding LR parsers is TRUE?
(A) Every SLR(1) grammar is LR(1), and every LR(1) grammar is LALR(1).
(B) An LR(0) parser can have shift-reduce conflicts but cannot have reduce-reduce conflicts.
(C) LALR(1) parsing tables are obtained by merging LR(1) states having identical core items, which may introduce reduce-reduce conflicts but never shift-reduce conflicts.
(D) Operator precedence parsers can parse all unambiguous context-free grammars.

**Key Technical Concepts**: LR(0), SLR(1), LALR(1), Canonical LR(1), Lookahead Propagation, State Merging Invariants, Shift-Reduce and Reduce-Reduce conflicts.

**Step-by-Step Solution & Derivation**:
- **Grammar Power Hierarchy**:
  $$\text{LR}(0) \subset \text{SLR}(1) \subset \text{LALR}(1) \subset \text{LR}(1)$$
- **State Merging in LALR(1)**:
  - LALR(1) tables merge canonical LR(1) states that have identical core item sets (ignoring lookaheads).
  - Merging cores can NEVER introduce a **Shift-Reduce** conflict because shift actions depend strictly on the next terminal symbol and existing core items.
  - However, merging distinct lookahead sets for reduce items with the same core CAN produce **Reduce-Reduce** conflicts!
- Therefore, statement (C) is strictly true.

**Correct Answer**: (C) LALR(1) parsing tables are obtained by merging LR(1) states having identical core items, which may introduce reduce-reduce conflicts but never shift-reduce conflicts.

---

## Question GATE-2025-COMP-04: Compiler Design - S-Attributed vs L-Attributed SDDs
**Topic**: Compiler Design / Syntax-Directed Translation (SDD)
**Question**:
Consider the differences between S-attributed and L-attributed Syntax-Directed Definitions (SDDs). Which of the following is CORRECT?
(A) S-attributed definitions allow inherited attributes evaluated in top-down order.
(B) Every S-attributed SDD is also an L-attributed SDD.
(C) L-attributed SDDs cannot be evaluated during bottom-up parsing.
(D) Synthesized attributes can depend on siblings to the right in the parse tree.

**Key Technical Concepts**: Syntax-Directed Definition (SDD), Synthesized Attributes (bottom-up), Inherited Attributes (top-down / left siblings), S-Attributed Grammar, L-Attributed Grammar.

**Step-by-Step Solution & Derivation**:
- **S-Attributed SDD**: Uses ONLY synthesized attributes, which are computed from the attribute values of the children nodes in the parse tree (evaluated bottom-up during post-order traversal / LR parsing).
- **L-Attributed SDD**: Allows synthesized attributes AND restricted inherited attributes (where an inherited attribute of node $X_j$ in production $A \rightarrow X_1 X_2 \dots X_n$ can only depend on inherited attributes of $A$ or attributes of left siblings $X_1, \dots, X_{j-1}$).
- **Inclusion**: Since S-attributed definitions use only synthesized attributes, they trivially satisfy all restrictions of L-attributed definitions. Thus, **every S-attributed SDD is an L-attributed SDD**.

**Correct Answer**: (B) Every S-attributed SDD is also an L-attributed SDD.
