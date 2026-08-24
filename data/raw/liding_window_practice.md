# GATE Computer Science - Sliding Window Protocol Practice

## Question GATE-CN-SLIDING-01: Sliding Window Link Utilization and Sequence Bits
**Topic**: Computer Networks / Data Link Layer & Sliding Window
**Question**:
A 100 km long link has a bandwidth of 100 Mbps and propagation speed of 2 * 10^8 m/s. Frame size is 1000 bytes. What are the minimum sequence number bits required for 100% efficiency in Go-Back-N and Selective Repeat?

**Key Technical Concepts**: Transmission Time Tt = L/B, Propagation Time Tp = d/v, Link utilization parameter a = Tp / Tt, Optimal window size W = 1 + 2a, GBN sequence numbers >= W + 1, SR sequence numbers >= 2W.

**Step-by-Step Solution & Derivation**:
1. Transmission Time: Tt = 8000 bits / (100 * 10^6 bps) = 80 microseconds = 0.08 ms.
2. Propagation Time: Tp = 100000 m / (2 * 10^8 m/s) = 500 microseconds = 0.5 ms.
3. Parameter a = Tp / Tt = 500 / 80 = 6.25.
4. Window size for 100% efficiency: W = 1 + 2a = 1 + 12.5 = 13.5 -> W = 14 frames.
5. In Go-Back-N (GBN): Total sequence numbers N >= W + 1 = 15 -> Bits k = ceil(log2(15)) = 4 bits.
6. In Selective Repeat (SR): Total sequence numbers N >= 2 * W = 28 -> Bits k = ceil(log2(28)) = 5 bits.

**Correct Answer**: GBN: 4 bits, SR: 5 bits
