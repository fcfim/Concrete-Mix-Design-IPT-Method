# Normative Standards

This API implements Brazilian normative standards for concrete design and durability.

---

## NBR 6118:2023

**Title:** Projeto de estruturas de concreto — Procedimento

**Scope:** Design of reinforced and prestressed concrete structures.

### Durability Requirements (Table 7.1)

The API enforces minimum requirements based on Environmental Aggressiveness Class (CAA):

| CAA | Aggressiveness | Environment        | Risk          |
| --- | -------------- | ------------------ | ------------- |
| I   | Weak           | Rural, submerged   | Insignificant |
| II  | Moderate       | Urban              | Low           |
| III | Strong         | Marine, industrial | High          |
| IV  | Very Strong    | Industrial, splash | Elevated      |

### Minimum Concrete Class (Table 7.1)

| CAA | Reinforced (CA) | Prestressed (CP) |
| --- | --------------- | ---------------- |
| I   | C20             | C25              |
| II  | C25             | C30              |
| III | C30             | C35              |
| IV  | C40             | C45              |

### Maximum Water/Cement Ratio (Table 7.1)

| CAA | Reinforced (CA) | Prestressed (CP) |
| --- | --------------- | ---------------- |
| I   | 0.65            | 0.60             |
| II  | 0.60            | 0.55             |
| III | 0.55            | 0.50             |
| IV  | 0.45            | 0.45             |

### Minimum Cement Content (Table 7.1)

| CAA | Reinforced (CA) | Prestressed (CP) |
| --- | --------------- | ---------------- |
| I   | 260 kg/m³       | 280 kg/m³        |
| II  | 280 kg/m³       | 300 kg/m³        |
| III | 320 kg/m³       | 320 kg/m³        |
| IV  | 360 kg/m³       | 360 kg/m³        |

### API Implementation

```typescript
// src/core/infrastructure/normative/nbr-6118.service.ts

const durabilityLimits = {
  1: { // CAA I
    CA: { fckMin: 20, acMax: 0.65, cMin: 260 },
    CP: { fckMin: 25, acMax: 0.60, cMin: 280 }
  },
  2: { // CAA II
    CA: { fckMin: 25, acMax: 0.60, cMin: 280 },
    CP: { fckMin: 30, acMax: 0.55, cMin: 300 }
  },
  3: { // CAA III
    CA: { fckMin: 30, acMax: 0.55, cMin: 320 },
    CP: { fckMin: 35, acMax: 0.50, cMin: 320 }
  },
  4: { // CAA IV
    CA: { fckMin: 40, acMax: 0.45, cMin: 360 },
    CP: { fckMin: 45, acMax: 0.45, cMin: 360 }
  }
};
```

### Warnings Generated

The API generates warnings when:

- **a/c exceeds limit:** Calculated a/c ratio is higher than maximum allowed
- **fck below minimum:** Target fck is below minimum for aggressiveness class
- **Cement consumption low:** Calculated cement is below minimum required

---

## NBR 12655:2022

**Title:** Concreto de cimento Portland — Preparo, controle, recebimento e aceitação

**Scope:** Requirements for concrete production, control, and acceptance.

### Dosage Strength Formula (Section 6.4)

The required dosage strength (f_cj) is calculated from characteristic strength (f_ck):

$$
f_{cj} = f_{ck} + 1.65 \cdot S_d
$$

Where:
- **f_cj** = Required average strength at dosage (MPa)
- **f_ck** = Characteristic compressive strength (MPa)
- **S_d** = Standard deviation (MPa)
- **1.65** = Statistical factor for 5% quantile

### Standard Deviation Values

| Condition                   | S_d (MPa) |
| --------------------------- | --------- |
| Type A (rigorous control)   | 4.0       |
| Type B (reasonable control) | 5.5       |
| Type C (regular control)    | 7.0       |

### Example Calculation

```
Given:
  fck = 30 MPa (C30 concrete)
  Sd = 5.5 MPa (Type B control)

Calculate:
  fcj = 30 + 1.65 × 5.5
  fcj = 30 + 9.08
  fcj = 39.08 MPa

Result: The concrete must be dosed to achieve 
        average strength of 39.08 MPa
```

### API Implementation

```typescript
// src/core/infrastructure/normative/nbr-12655.service.ts

export class NBR12655Service {
  private static readonly QUANTILE_FACTOR = 1.65;

  static calculateFcjTarget(fck: number, sd: number): number {
    return fck + this.QUANTILE_FACTOR * sd;
  }
}
```

---

## NBR 8953:2015

**Title:** Concreto para fins estruturais — Classificação pela massa específica, por grupos de resistência e consistência

**Scope:** Classification of structural concrete.

### Strength Classes (Group I)

| Class | f_ck (MPa) | Typical Use                          |
| ----- | ---------- | ------------------------------------ |
| C20   | 20         | Foundations, low aggressiveness      |
| C25   | 25         | Residential buildings                |
| C30   | 30         | Commercial buildings                 |
| C35   | 35         | High-rise buildings                  |
| C40   | 40         | Prestressed, aggressive environments |
| C45   | 45         | Bridges, special structures          |
| C50   | 50         | High-performance applications        |

### Strength Classes (Group II - High Performance)

| Class | f_ck (MPa) |
| ----- | ---------- |
| C55   | 55         |
| C60   | 60         |
| C70   | 70         |
| C80   | 80         |
| C90   | 90         |
| C100  | 100        |

### Consistency Classes (Slump)

| Class | Slump (mm) | Application         |
| ----- | ---------- | ------------------- |
| S10   | 10 ± 10    | Roller compacted    |
| S50   | 50 ± 10    | Pavement            |
| S100  | 100 ± 20   | Structural elements |
| S160  | 160 ± 30   | Pumped concrete     |
| S220  | 220 ± 30   | High workability    |

---

## Compliance Verification

The API performs automatic compliance checks:

```
┌──────────────────────────────────────────────────────────┐
│                   COMPLIANCE CHECK                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. INPUT: CAA=II, fck=30, elementType=CA               │
│                                                          │
│  2. NBR 12655:                                          │
│     fcj = 30 + 1.65 × 5.5 = 39.08 MPa ✓                │
│                                                          │
│  3. NBR 6118 (CAA II, CA):                              │
│     ├─ fck ≥ 25 MPa? → 30 ≥ 25 ✓                       │
│     ├─ a/c ≤ 0.60?   → 0.486 ≤ 0.60 ✓                  │
│     └─ C ≥ 280 kg/m³? → 432 ≥ 280 ✓                    │
│                                                          │
│  4. RESULT: COMPLIANT                                    │
│     warnings: []                                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## References

1. ABNT NBR 6118:2023 - *Projeto de estruturas de concreto — Procedimento*

2. ABNT NBR 12655:2022 - *Concreto de cimento Portland — Preparo, controle, recebimento e aceitação — Procedimento*

3. ABNT NBR 8953:2015 - *Concreto para fins estruturais — Classificação pela massa específica, por grupos de resistência e consistência*

### Official Links

- [ABNT Catálogo](https://www.abntcatalogo.com.br/) - Official ABNT store
- [IBRACON](https://www.ibracon.org.br/) - Brazilian Concrete Institute
