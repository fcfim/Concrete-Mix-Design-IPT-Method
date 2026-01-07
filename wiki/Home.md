# Welcome to the Concrete Mix Design API Wiki

This wiki provides comprehensive documentation for the **Concrete Mix Design API** using the IPT/EPUSP method.

## 📚 Quick Navigation

| Page                                       | Description                         |
| ------------------------------------------ | ----------------------------------- |
| [Getting Started](Getting-Started)         | Installation and first API call     |
| [API Reference](API-Reference)             | Complete endpoint documentation     |
| [Mathematical Models](Mathematical-Models) | Abrams, Lyse, Molinari laws         |
| [Normative Standards](Normative-Standards) | NBR 6118, NBR 12655, NBR 8953       |
| [Examples](Examples)                       | Code examples in multiple languages |
| [FAQ](FAQ)                                 | Frequently asked questions          |

---

## 🎯 What is this API?

This API implements the **IPT/EPUSP method** for concrete mix design, developed by the Instituto de Pesquisas Tecnológicas (IPT) and Escola Politécnica da USP (EPUSP).

### Key Features

- ✅ **Accurate Calculations** - Based on empirical laws with high R² values
- ✅ **NBR Compliant** - Automatic verification against Brazilian standards
- ✅ **REST API** - Easy integration with any programming language
- ✅ **Interactive Playground** - Test directly in your browser

### How It Works

```
Input: 3 Experimental Traces (Rico, Piloto, Pobre)
                    ↓
         Abrams Law → target a/c
         Lyse Law → target m
         Molinari Law → cement consumption
                    ↓
Output: Final Unit Trace (1 : a : p : a/c)
```

---

## 🚀 Quick Example

```bash
curl -X POST https://your-api.com/api/v1/dosage \
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
      "elementType": "CA"
    }
  }'
```

**Response:**
```json
{
  "finalTrace": { "cement": 1, "sand": 1.56, "gravel": 2.36, "water": 0.49 },
  "consumption": { "cement": 432, "sand": 674, "gravel": 1019, "water": 212 }
}
```

---

## 📖 Learn More

- **[Getting Started](Getting-Started)** - Set up the API in 5 minutes
- **[Mathematical Models](Mathematical-Models)** - Understand the formulas
- **[Examples](Examples)** - Code in JavaScript, Python, and more
