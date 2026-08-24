# GATE Computer Science (1990 - 2026): Computer Organization & Architecture (COA) and Discrete Mathematics PYQ Archive

## Question GATE-2005-COA-01: COA - Cache Memory Address Division & Tag Bits
**Topic**: Computer Organization / Memory Hierarchy & Cache Mapping
**Question**:
Consider a 4-way set-associative cache memory with a total cache size of 32 KB. The block size is 64 bytes, and the CPU generates 32-bit byte-addressable physical memory addresses. How many bits are required for the Tag, Set Index, and Block Offset fields respectively?
(A) Tag: 20 bits, Set Index: 6 bits, Block Offset: 6 bits
(B) Tag: 19 bits, Set Index: 7 bits, Block Offset: 6 bits
(C) Tag: 18 bits, Set Index: 8 bits, Block Offset: 6 bits
(D) Tag: 21 bits, Set Index: 5 bits, Block Offset: 6 bits

**Key Technical Concepts**: Cache Memory, 4-Way Set Associative, Block Offset, Set Index calculation, Tag Bits derivation: $\text{Physical Address Bits} = \text{Tag} + \text{Set Index} + \text{Word/Block Offset}$.

**Step-by-Step Solution & Derivation**:
1. Physical Address Size: 32 bits.
2. Block Size: $64\text{ bytes} = 2^6\text{ bytes} \implies$ **Block Offset = 6 bits**.
3. Total Cache Size: $32\text{ KB} = 32 \times 1024\text{ bytes} = 32768\text{ bytes}$.
4. Number of Cache Blocks (Lines):
   $$\text{Total Lines} = \frac{\text{Total Cache Size}}{\text{Block Size}} = \frac{32 \times 1024}{64} = 512\text{ lines}$$
5. Number of Sets in 4-Way Set Associative:
   $$\text{Number of Sets} = \frac{\text{Total Lines}}{K} = \frac{512}{4} = 128\text{ sets} = 2^7\text{ sets}$$
   $$\implies \textbf{Set Index = 7 bits}$$
6. Calculate Tag Bits:
   $$\text{Tag Bits} = 32 - (\text{Set Index} + \text{Block Offset}) = 32 - (7 + 6) = 32 - 13 = \mathbf{19\text{ bits}}$$
- Address Division: **Tag = 19 bits, Set Index = 7 bits, Block Offset = 6 bits**.

**Correct Answer**: (B) Tag: 19 bits, Set Index: 7 bits, Block Offset: 6 bits

---

## Question GATE-2019-COA-02: COA - Pipelining Speedup & Stall Cycles
**Topic**: Computer Organization / Instruction Pipelining & Performance
**Question**:
A 5-stage instruction pipeline has stage delays of 150 ps, 120 ps, 160 ps, 140 ps, and 110 ps. The pipeline register overhead between stages is 10 ps. If a non-pipelined system takes the sum of stage delays to execute an instruction, what is the ideal speedup of the pipelined processor for a large number of instructions without hazards?
(A) 4.00
(B) 4.12
(C) 4.35
(D) 5.00

**Key Technical Concepts**: Pipelining, Clock Cycle Time (bottleneck stage delay + register overhead), Non-pipelined execution time, Asymptotic Speedup: $\lim_{n \to \infty} S = \frac{t_{\text{non-pipelined}}}{\tau_{\text{pipelined}}}$.

**Step-by-Step Solution & Derivation**:
- **Non-Pipelined Execution Time**:
  $$t_{\text{non-pipe}} = 150 + 120 + 160 + 140 + 110 = 680\text{ ps}$$
- **Pipelined Clock Cycle Time $\tau$**:
  The clock period is determined by the slowest (bottleneck) stage delay plus the pipeline register latch delay $d = 10\text{ ps}$:
  $$\tau = \max(150, 120, 160, 140, 110) + 10\text{ ps} = 160 + 10 = 170\text{ ps}$$
- **Speedup Calculation for $n \to \infty$**:
  $$\text{Speedup} = \frac{t_{\text{non-pipe}}}{\tau} = \frac{680\text{ ps}}{170\text{ ps}} = \mathbf{4.00}$$

**Correct Answer**: (A) 4.00

---

## Question GATE-2010-DM-03: Discrete Math - Graph Theory Eulerian & Hamiltonian Graphs
**Topic**: Discrete Mathematics / Graph Theory & Connectivity
**Question**:
Which of the following conditions is NECESSARY and SUFFICIENT for a connected undirected graph $G = (V, E)$ to contain an Eulerian Circuit (Euler tour)?
(A) The graph is planar and bipartite.
(B) Every vertex in $G$ has an even degree.
(C) The graph has a spanning tree of depth at most $|V|/2$.
(D) The sum of degrees of all vertices equals $2|E|$.

**Key Technical Concepts**: Eulerian Circuit (Euler's Theorem 1736), Eulerian Trail, Even Degree Invariant, Handshaking Lemma.

**Step-by-Step Solution & Derivation**:
- **Euler's Theorem for Undirected Graphs**:
  1. A connected undirected graph contains an **Eulerian Circuit** (a closed walk traversing every edge exactly once and returning to the start vertex) if and only if **every vertex has an even degree**.
  2. A connected undirected graph contains an **Eulerian Trail** (open path traversing every edge once) if and only if **exactly 0 or 2 vertices have odd degrees**.
- Therefore, statement (B) is the exact necessary and sufficient condition.

**Correct Answer**: (B) Every vertex in $G$ has an even degree.

---

## Question GATE-2026-MATH-04: Engineering Mathematics - Bayes' Theorem & Conditional Probability
**Topic**: Engineering Mathematics / Probability & Bayes' Theorem
**Question**:
A diagnostic test for a disease has a 99% true positive rate (sensitivity) and a 95% true negative rate (specificity). The disease is present in 0.5% of the general population. If a randomly chosen patient tests positive, what is the posterior probability that the patient actually has the disease?
(A) 99.0%
(B) 90.4%
(C) 9.04%
(D) 0.5%

**Key Technical Concepts**: Bayes' Theorem, Prior Probability $P(D)$, Sensitivity $P(+\mid D)$, False Positive Rate $P(+\mid D^c) = 1 - \text{Specificity}$, Posterior Probability $P(D\mid +)$.

**Step-by-Step Solution & Derivation**:
- Given Probabilities:
  - $P(D) = 0.005$ (Disease prior)
  - $P(D^c) = 1 - 0.005 = 0.995$ (Healthy prior)
  - $P(+\mid D) = 0.99$ (True positive sensitivity)
  - $P(-\mid D^c) = 0.95 \implies P(+\mid D^c) = 1 - 0.95 = 0.05$ (False positive rate)
- Apply Bayes' Theorem:
  $$P(D\mid +) = \frac{P(+\mid D) \times P(D)}{P(+\mid D) \times P(D) + P(+\mid D^c) \times P(D^c)}$$
- Substitute numerical values:
  $$\text{Numerator} = 0.99 \times 0.005 = 0.00495$$
  $$\text{Denominator} = 0.00495 + (0.05 \times 0.995) = 0.00495 + 0.04975 = 0.05470$$
  $$P(D\mid +) = \frac{0.00495}{0.05470} \approx 0.09049 \implies \mathbf{9.05\%}$$
- Due to the low base rate (0.5%), a positive test result yields ~9.05% actual probability of disease.

**Correct Answer**: (C) 9.04% (approx 9.05%)

---

## Question GATE-2022-COA-05: COA - Hard Disk Rotational Speed, Seek Time & Total Transfer Time
**Topic**: Computer Organization and Architecture / Storage Hierarchy & Hard Disk Access Time
**Question**:
Consider a hard disk with a rotational speed of 15000 rpm. The time to move the read/write head from a track to its adjacent track is 1 millisecond. Initially, the head is on track 0. The number of sectors per track is 400. The sector size is 1024 bytes. It is necessary to transfer data from 10 randomly located sectors in each of the following tracks in the order: 5, 12 and 7. The total time for the data transfer (in milliseconds) from the hard disk is _______. (rounded off to one decimal place)

**Key Technical Concepts**: Hard Disk Architecture, Rotational Speed (RPM to ms/rev), Average Rotational Latency ($T_{\text{rev}}/2$), Track-to-Track Seek Time, Sector Transfer Time ($T_{\text{rev}}/\text{sectors\_per\_track}$), Random Sector Access Time on a Track.

**Step-by-Step Solution & Derivation**:
1. **Rotational Calculations**:
   - Rotational Speed $N = 15000\text{ rpm} = \frac{15000}{60}\text{ rev/sec} = 250\text{ rev/sec}$.
   - Time for one full revolution:
     $$T_{\text{rev}} = \frac{1}{250}\text{ sec} = \frac{1000}{250}\text{ ms} = 4\text{ ms}$$
   - Average Rotational Latency (time to reach start of a random sector):
     $$T_{\text{rot\_avg}} = \frac{T_{\text{rev}}}{2} = \frac{4\text{ ms}}{2} = 2\text{ ms}$$
   - Sector Transfer Time (time for disk head to pass over 1 sector):
     $$T_{\text{transfer\_sector}} = \frac{T_{\text{rev}}}{\text{Sectors per track}} = \frac{4\text{ ms}}{400} = 0.01\text{ ms}$$

2. **Time to Read 10 Randomly Located Sectors on ONE Track**:
   - For each randomly located sector on the track, the disk must rotate on average by half a revolution ($2\text{ ms}$) and then read the sector ($0.01\text{ ms}$):
     $$T_{\text{sector\_access}} = T_{\text{rot\_avg}} + T_{\text{transfer\_sector}} = 2\text{ ms} + 0.01\text{ ms} = 2.01\text{ ms}$$
   - For 10 randomly located sectors on that track:
     $$T_{\text{track\_read}} = 10 \times 2.01\text{ ms} = 20.1\text{ ms}$$

3. **Seek Time Calculations**:
   - Time to move between adjacent tracks = $1\text{ ms/track}$.
   - Head movement trajectory: $\text{Track 0} \rightarrow \text{Track 5} \rightarrow \text{Track 12} \rightarrow \text{Track 7}$.
     - From Track 0 to Track 5: $|5 - 0| \times 1\text{ ms} = 5\text{ ms}$.
     - From Track 5 to Track 12: $|12 - 5| \times 1\text{ ms} = 7\text{ ms}$.
     - From Track 12 to Track 7: $|7 - 12| \times 1\text{ ms} = 5\text{ ms}$.
   - Total Seek Time:
     $$\text{Total Seek Time} = 5\text{ ms} + 7\text{ ms} + 5\text{ ms} = 17\text{ ms}$$

4. **Total Data Transfer Time**:
   - Data is read from 3 tracks (5, 12, and 7):
     $$\text{Total Data Read Time} = 3 \times T_{\text{track\_read}} = 3 \times 20.1\text{ ms} = 60.3\text{ ms}$$
   - Total System Time:
     $$\text{Total Time} = \text{Total Seek Time} + \text{Total Data Read Time} = 17\text{ ms} + 60.3\text{ ms} = \mathbf{77.3\text{ ms}}$$

**Correct Answer**: 77.3 ms (Range: 77.0 to 77.5 ms)

