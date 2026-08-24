# GATE Computer Science (1990 - 2026): Computer Networks PYQ Archive

## Question GATE-2006-CN-01: Computer Networks - TCP Congestion Control & Window Evolution
**Topic**: Computer Networks / Transport Layer & TCP Congestion Control
**Question**:
A TCP connection has a slow-start threshold (`ssthresh`) of 32 KB and maximum segment size (MSS) of 2 KB. The congestion window size starts at 2 KB (1 MSS). How many Transmission Rounds (RTTs) are required for the congestion window to reach 40 KB, assuming no packet loss occurs?
(A) 4 RTTs
(B) 5 RTTs
(C) 8 RTTs
(D) 9 RTTs

**Key Technical Concepts**: TCP Congestion Control, Slow Start Phase (exponential growth), Congestion Avoidance Phase (additive increase $+1\text{ MSS}$ per RTT), `ssthresh`, `cwnd`.

**Step-by-Step Solution & Derivation**:
- Initial Parameters:
  - $\text{MSS} = 2\text{ KB}$
  - Initial $\text{cwnd} = 2\text{ KB} = 1\text{ MSS}$
  - $\text{ssthresh} = 32\text{ KB} = 16\text{ MSS}$
  - Target $\text{cwnd} = 40\text{ KB} = 20\text{ MSS}$
- Round-by-Round Window Evolution:
  - **Round 0 (Start)**: $\text{cwnd} = 1\text{ MSS} = 2\text{ KB}$
  - **Round 1 (Slow Start)**: $\text{cwnd} = 2\text{ MSS} = 4\text{ KB}$
  - **Round 2 (Slow Start)**: $\text{cwnd} = 4\text{ MSS} = 8\text{ KB}$
  - **Round 3 (Slow Start)**: $\text{cwnd} = 8\text{ MSS} = 16\text{ KB}$
  - **Round 4 (Slow Start)**: $\text{cwnd} = 16\text{ MSS} = 32\text{ KB}$ ($\text{cwnd} = \text{ssthresh} \implies$ Transition to Congestion Avoidance!)
  - **Round 5 (Congestion Avoidance)**: $\text{cwnd} = 16 + 1 = 17\text{ MSS} = 34\text{ KB}$
  - **Round 6 (Congestion Avoidance)**: $\text{cwnd} = 17 + 1 = 18\text{ MSS} = 36\text{ KB}$
  - **Round 7 (Congestion Avoidance)**: $\text{cwnd} = 18 + 1 = 19\text{ MSS} = 38\text{ KB}$
  - **Round 8 (Congestion Avoidance)**: $\text{cwnd} = 19 + 1 = 20\text{ MSS} = 40\text{ KB}$
- Total Rounds needed = 8 RTTs.

**Correct Answer**: (C) 8 RTTs

---

## Question GATE-2014-CN-02: Computer Networks - CSMA/CD Minimum Frame Length
**Topic**: Computer Networks / Data Link Layer & Multiple Access
**Question**:
In a 10 Mbps CSMA/CD network with maximum cable segment length of 1 km and signal propagation speed of $2 \times 10^8\text{ m/s}$, what is the minimum frame size required to ensure collision detection?
(A) 50 bytes
(B) 100 bytes
(C) 125 bytes
(D) 250 bytes

**Key Technical Concepts**: CSMA/CD Collision Detection Condition, Transmission Time $T_t$, Propagation Delay $T_p$, Minimum Frame Size Formula: $T_t \ge 2 \times T_p \implies L_{\min} = 2 \times B \times \frac{d}{v}$.

**Step-by-Step Solution & Derivation**:
- Given values:
  - Bandwidth $B = 10\text{ Mbps} = 10 \times 10^6\text{ bits/sec}$
  - Distance $d = 1\text{ km} = 1000\text{ m}$
  - Propagation velocity $v = 2 \times 10^8\text{ m/s}$
- Calculate one-way propagation delay $T_p$:
  $$T_p = \frac{d}{v} = \frac{1000}{2 \times 10^8} = 5 \times 10^{-6}\text{ sec} = 5\ \mu\text{s}$$
- Condition for collision detection in CSMA/CD:
  $$T_t \ge 2 \times T_p$$
  $$\frac{L_{\min}}{B} \ge 2 \times T_p \implies L_{\min} = 2 \times B \times T_p$$
- Calculate minimum length $L_{\min}$:
  $$L_{\min} = 2 \times (10 \times 10^6\text{ bps}) \times (5 \times 10^{-6}\text{ s}) = 100\text{ bits}$$
  $$L_{\min} = \frac{100}{8} = 12.5\text{ bytes}$$
- For standard round-trip parameters, if segment length is extended to 2 km:
  $$L_{\min} = 2 \times 10 \times 10^6 \times \frac{2000}{2 \times 10^8} = 200\text{ bits} = 25\text{ bytes}$$

**Correct Answer**: 100 bits (12.5 bytes) for 1km link

---

## Question GATE-2020-CN-03: Computer Networks - CIDR Subnetting & Usable Hosts
**Topic**: Computer Networks / Network Layer & IPv4 Addressing
**Question**:
An organization is assigned the network block `192.168.10.0/26`. What is the total number of usable host IP addresses in this subnet, and what is the broadcast address?
(A) 64 hosts, Broadcast: `192.168.10.63`
(B) 62 hosts, Broadcast: `192.168.10.63`
(C) 62 hosts, Broadcast: `192.168.10.64`
(D) 30 hosts, Broadcast: `192.168.10.31`

**Key Technical Concepts**: Classless Inter-Domain Routing (CIDR), Subnet Mask, Network Address, Directed Broadcast Address, Usable Host Range: $2^{32 - \text{prefix}} - 2$.

**Step-by-Step Solution & Derivation**:
- CIDR Prefix length $n = 26$:
  - Number of host bits $h = 32 - 26 = 6\text{ bits}$.
- Total IP addresses in subnet:
  $$\text{Total IPs} = 2^h = 2^6 = 64$$
- Usable host IP addresses:
  $$\text{Usable Hosts} = 2^h - 2 = 64 - 2 = 62\text{ hosts}$$
  *(Subtracting Network ID and Directed Broadcast ID).*
- IP Address Allocation Breakdown:
  - Network ID (first IP, all host bits 0): `192.168.10.0`
  - First usable host: `192.168.10.1`
  - Last usable host: `192.168.10.62`
  - Directed Broadcast Address (last IP, all host bits 1): `192.168.10.63`

**Correct Answer**: (B) 62 hosts, Broadcast: `192.168.10.63`
