# Mathematical Models

The IPT/EPUSP method uses three fundamental laws to determine concrete mix proportions.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   IPT/EPUSP Method                          │
├─────────────────────────────────────────────────────────────┤
│  Input: 3 experimental traces (Rico, Piloto, Pobre)         │
│                                                             │
│  1. Abrams Law  →  fcj = f(a/c)   →  target a/c            │
│  2. Lyse Law    →  m = f(a/c)     →  target m              │
│  3. Molinari Law → C = f(m)       →  cement consumption    │
│                                                             │
│  Output: Final unit trace (1 : a : p : a/c)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Abrams Law (1918)

### Historical Background

Developed by **Duff Abrams** at Lewis Institute (now IIT) in 1918, this empirical law establishes the inverse relationship between concrete strength and water/cement ratio.

### Formula

$$
f_{cj} = \frac{k_1}{k_2^{(a/c)}}
$$

Where:
- **f_cj** = Compressive strength at 28 days (MPa)
- **a/c** = Water/cement ratio (by mass)
- **k₁** = Constant representing theoretical maximum strength
- **k₂** = Constant representing strength reduction rate

### Linearization

For linear regression, the formula is transformed:

$$
\log(f_{cj}) = \log(k_1) - (a/c) \cdot \log(k_2)
$$

This yields a linear equation: `Y = A + B × X`

Where:
- Y = log(fcj)
- X = a/c
- A = log(k₁) → k₁ = 10^A
- B = -log(k₂) → k₂ = 10^(-B)

### Coefficient Interpretation

| Coefficient | Typical Range | Meaning                               |
| ----------- | ------------- | ------------------------------------- |
| k₁          | 80 - 200      | Theoretical max strength with a/c → 0 |
| k₂          | 8 - 15        | Strength reduction sensitivity        |
| R²          | > 0.95        | Regression quality (should be high)   |

### Graph

```
fcj (MPa)
  │
60┤ ●                      Rico (high strength)
  │  ╲
50┤   ╲
  │    ╲
40┤     ●                  Piloto (medium)
  │      ╲
30┤       ╲
  │        ╲
20┤         ●              Pobre (low strength)
  │          ╲
10┤           ╲────────────
  │
  └──────────────────────── a/c
    0.35  0.45  0.55  0.65  0.75
```

---

## 2. Lyse Law

### Description

Establishes a linear relationship between the dry trace ratio (m) and the water/cement ratio (a/c). This law relates workability to cement content.

### Formula

$$
m = k_3 + k_4 \cdot (a/c)
$$

Where:
- **m** = Dry trace ratio (aggregates/cement by mass)
- **a/c** = Water/cement ratio
- **k₃** = Intercept (theoretical m at a/c = 0)
- **k₄** = Slope (sensitivity of m to a/c changes)

### Linear Regression

Direct application of least squares method:

```
m = k₃ + k₄ × (a/c)

Given experimental points: (ac₁, m₁), (ac₂, m₂), (ac₃, m₃)

k₄ = Σ[(acᵢ - āc)(mᵢ - m̄)] / Σ[(acᵢ - āc)²]
k₃ = m̄ - k₄ × āc

Where:
  āc = mean of a/c values
  m̄ = mean of m values
```

### Coefficient Interpretation

| Coefficient | Typical Range | Meaning                        |
| ----------- | ------------- | ------------------------------ |
| k₃          | -3 to 0       | Base aggregate content         |
| k₄          | 8 - 15        | Aggregate sensitivity to water |
| R²          | > 0.98        | Linear correlation quality     |

### Graph

```
m (trace)
│
8 ┤                    ●   Pobre (lean mix)
  │                 ╱
7 ┤              ╱
  │           ╱
6 ┤        ╱
  │     ●             Piloto
5 ┤  ╱
  │╱
4 ┤●                      Rico (rich mix)
  │
  └──────────────────────── a/c
    0.35  0.45  0.55  0.65  0.75
```

---

## 3. Molinari Law

### Description

Relates cement consumption to the dry trace ratio, derived from the concrete mass balance equation.

### Formula

$$
C = \frac{1000}{k_5 + k_6 \cdot m}
$$

Where:
- **C** = Cement consumption (kg/m³)
- **m** = Dry trace ratio
- **k₅** = Constant related to paste volume
- **k₆** = Constant related to aggregate packing

### Derivation

Starting from the mass balance:

```
γ_conc = C × (1 + m + a/c)

Where γ_conc = fresh concrete density (≈ 2300-2400 kg/m³)

Rearranging:
C = γ_conc / (1 + m + a/c)

For unit volume (1000 L = 1 m³):
C = 1000 / [(1/γ_c) + (m/γ_agg) + (a/c)/γ_water]

Simplifying to Molinari form:
C = 1000 / (k₅ + k₆ × m)
```

### Coefficient Interpretation

| Coefficient | Typical Range | Meaning                    |
| ----------- | ------------- | -------------------------- |
| k₅          | 0.1 - 0.5     | Paste/cement volume factor |
| k₆          | 0.4 - 0.7     | Aggregate volume factor    |
| R²          | > 0.99        | Correlation quality        |

### Graph

```
C (kg/m³)
│
700┤●                     m = 3.5 (rich)
   │ ╲
600┤  ╲
   │   ╲
500┤    ╲
   │     ●                m = 5.0 (medium)
400┤      ╲
   │       ╲
300┤        ╲●            m = 6.5 (lean)
   │         ╲
200┤          ╲───────────
   │
   └────────────────────── m
     3    4    5    6    7    8
```

---

## 4. Linear Regression Method

### Least Squares

All laws use least squares regression to fit coefficients:

```typescript
// For Y = A + B × X
function linearRegression(points: {x: number, y: number}[]) {
  const n = points.length;
  const sumX = Σ(xᵢ);
  const sumY = Σ(yᵢ);
  const sumXY = Σ(xᵢ × yᵢ);
  const sumX2 = Σ(xᵢ²);
  
  const slope = (n × sumXY - sumX × sumY) / (n × sumX2 - sumX²);
  const intercept = (sumY - slope × sumX) / n;
  
  return { slope, intercept };
}
```

### R² (Coefficient of Determination)

Measures regression quality (0 to 1):

$$
R^2 = 1 - \frac{SS_{res}}{SS_{tot}}
$$

Where:
- SS_res = Σ(yᵢ - ŷᵢ)² (residual sum of squares)
- SS_tot = Σ(yᵢ - ȳ)² (total sum of squares)

| R² Value    | Interpretation         |
| ----------- | ---------------------- |
| > 0.99      | Excellent fit          |
| 0.95 - 0.99 | Good fit               |
| 0.90 - 0.95 | Acceptable             |
| < 0.90      | Poor fit - verify data |

---

## Complete Calculation Flow

```
1. INPUT: Experimental Points
   Rico:   m=3.5, a/c=0.45, fcj=42 MPa, γ=2350
   Piloto: m=5.0, a/c=0.58, fcj=32 MPa, γ=2300
   Pobre:  m=6.5, a/c=0.72, fcj=22 MPa, γ=2250

2. TARGET: fck=30 MPa, Sd=5.5 MPa, CAA II

3. STEP 1: Calculate fcj_target (NBR 12655)
   fcj = fck + 1.65 × Sd = 30 + 1.65 × 5.5 = 39.08 MPa

4. STEP 2: Apply Abrams Law
   Fit: fcj = 125.29 / 11.007^(a/c)
   Find a/c for fcj=39.08 → a/c = 0.486

5. STEP 3: Check NBR 6118 limits
   CAA II max a/c = 0.60 → 0.486 ≤ 0.60 ✓

6. STEP 4: Apply Lyse Law
   m = -1.48 + 11.11 × 0.486 = 3.92

7. STEP 5: Apply Molinari Law
   C = 1000 / (0.2952 + 0.5157 × 3.92) = 432 kg/m³

8. STEP 6: Calculate Unit Trace
   Total aggregates = 3.92 (from m)
   Sand ratio = 52% (mortar content)
   a = 3.92 × 0.52 / (1 - 0.52) = 4.24... (adjusted)
   
   Final: 1 : 1.56 : 2.36 : 0.49

9. OUTPUT:
   - Cement: 432 kg/m³
   - Sand: 674 kg/m³
   - Gravel: 1019 kg/m³
   - Water: 212 L/m³
```

---

## References

1. ABRAMS, D. A. *Design of Concrete Mixtures*. Bulletin 1, Structural Materials Research Laboratory, Lewis Institute, Chicago, 1918.

2. HELENE, P.; TERZIAN, P. *Manual de Dosagem e Controle do Concreto*. PINI, São Paulo, 1992.

3. MEHTA, P. K.; MONTEIRO, P. J. M. *Concrete: Microstructure, Properties, and Materials*. 4th ed., McGraw-Hill, 2014.
