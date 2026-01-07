# Getting Started

Complete guide to set up and use the Concrete Mix Design API.

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/fcfim/Concrete-Mix-Design-IPT-Method.git
cd Concrete-Mix-Design-IPT-Method
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## Your First API Call

### Using cURL

```bash
curl -X POST http://localhost:3000/api/v1/dosage \
  -H "Content-Type: application/json" \
  -d '{
    "experimentalPoints": [
      {"m": 3.5, "ac": 0.45, "fcj": 42, "density": 2350},
      {"m": 5.0, "ac": 0.58, "fcj": 32, "density": 2300},
      {"m": 6.5, "ac": 0.72, "fcj": 22, "density": 2250}
    ],
    "target": {
      "fck": 30,
      "sd": 5.5,
      "aggressivenessClass": 2,
      "elementType": "CA",
      "slump": 100,
      "mortarContent": 52
    }
  }'
```

### Expected Response

```json
{
  "success": true,
  "meta": {
    "method": "IPT/EPUSP",
    "version": "1.0.0",
    "timestamp": "2026-01-07T19:30:00.000Z"
  },
  "data": {
    "finalTrace": {
      "cement": 1,
      "sand": 1.56,
      "gravel": 2.36,
      "water": 0.49
    },
    "consumption": {
      "cement": 432,
      "sand": 674,
      "gravel": 1019,
      "water": 212
    },
    "parameters": {
      "fcjTarget": 39.08,
      "targetAC": 0.486,
      "targetM": 3.92
    },
    "coefficients": {
      "abrams": { "k1": 125.29, "k2": 11.007, "r2": 0.9951 },
      "lyse": { "k3": -1.48, "k4": 11.11, "r2": 0.9995 },
      "molinari": { "k5": 0.2952, "k6": 0.5157, "r2": 0.9998 }
    },
    "warnings": []
  }
}
```

---

## Understanding the Input

### Experimental Points

You need **at least 3 experimental traces** representing different mix proportions:

| Trace              | Description           | Typical m | Typical a/c |
| ------------------ | --------------------- | --------- | ----------- |
| **Rico (Rich)**    | High cement content   | 3-4       | 0.40-0.50   |
| **Piloto (Pilot)** | Medium cement content | 4.5-5.5   | 0.50-0.60   |
| **Pobre (Lean)**   | Low cement content    | 6-7       | 0.65-0.75   |

Each point requires:
- `m` - Dry trace ratio (aggregates/cement)
- `ac` - Water/cement ratio
- `fcj` - 28-day compressive strength (MPa)
- `density` - Fresh concrete density (kg/m³)

### Target Parameters

| Parameter             | Description                   | Example |
| --------------------- | ----------------------------- | ------- |
| `fck`                 | Characteristic strength (MPa) | 30      |
| `sd`                  | Standard deviation (MPa)      | 5.5     |
| `aggressivenessClass` | Environment (1-4)             | 2       |
| `elementType`         | "CA" or "CP"                  | "CA"    |
| `slump`               | Slump test (mm)               | 100     |
| `mortarContent`       | Mortar content (%)            | 52      |

---

## Interactive Playground

Access the web interface at `http://localhost:3000`:

1. Enter your experimental points
2. Set target parameters
3. Click "Calcular Dosagem"
4. View results and charts

---

## Next Steps

- [API Reference](API-Reference) - Complete endpoint documentation
- [Mathematical Models](Mathematical-Models) - Understand the formulas
- [Examples](Examples) - More code examples
