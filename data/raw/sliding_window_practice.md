# GATE Computer Science - Sliding Window Protocol & Link Utilization Practice

## Question GATE-CN-SLIDING-01: Sliding Window Link Utilization and Sequence Bits
**Topic**: Computer Networks / Data Link Layer & Sliding Window
**Question**:
A 100 km long broadcast link has a bandwidth of 100 Mbps and a signal propagation speed of 2 * 10^8 m/s. The data frame size is 1000 bytes (8000 bits), and acknowledgment frames are negligible in size. What is the minimum number of bits required in the sequence number field for Go-Back-N (GBN) to achieve 100% link efficiency (utilization)? What is the minimum number of bits required for Selective Repeat (SR)?

**Key Technical Concepts**: Transmission Time Tt = L/B, Propagation Time Tp = d/v, Link utilization parameter a = Tp / Tt, Optimal sender window size Ws = 1 + 2a, GBN sequence numbers N >= Ws + 1, SR sequence numbers N >= 2 * Ws.

**Step-by-Step Solution & Derivation**:
1. **Transmission Time ($T_t$)**:
   $$T_t = \frac{L}{B} = \frac{1000 \times 8\text{ bits}}{100 \times 10^6\text{ bps}} = \frac{8000}{10^8} = 8 \times 10^{-5}\text{ sec} = 80\ \mu\text{s} = 0.08\text{ ms}$$

2. **Propagation Delay ($T_p$)**:
   $$\text{Distance } d = 100\text{ km} = 10^5\text{ m}$$
   $$\text{Velocity } v = 2 \times 10^8\text{ m/s}$$
   $$T_p = \frac{d}{v} = \frac{10^5}{2 \times 10^8} = 0.5 \times 10^{-3}\text{ sec} = 0.5\text{ ms} = 500\ \mu\text{s}$$

3. **Link Parameter $a$**:
   $$a = \frac{T_p}{T_t} = \frac{500\ \mu\text{s}}{80\ \mu\text{s}} = 6.25$$

4. **Optimal Sender Window Size ($W_s$) for 100% Efficiency ($\eta = 1.0$)**:
   $$\eta = \frac{W_s}{1 + 2a} \implies W_s = 1 + 2a = 1 + 2(6.25) = 1 + 12.5 = 13.5$$
   Since window size must be an integer:
   $$W_s = \lceil 13.5 \rceil = 14\text{ frames}$$

5. **Sequence Number Field Calculations**:
   - **For Go-Back-N (GBN)**:
     - Total required sequence numbers: $N \ge W_s + 1 = 14 + 1 = 15$.
     - Minimum sequence bits: $k = \lceil \log_2(15) \rceil = \mathbf{4\text{ bits}}$ (since $2^4 = 16 \ge 15$).
   - **For Selective Repeat (SR)**:
     - Total required sequence numbers: $N \ge 2 \times W_s = 2 \times 14 = 28$.
     - Minimum sequence bits: $k = \lceil \log_2(28) \rceil = \mathbf{5\text{ bits}}$ (since $2^5 = 32 \ge 28$).

**Correct Answer**: Go-Back-N: 4 bits, Selective Repeat: 5 bits
