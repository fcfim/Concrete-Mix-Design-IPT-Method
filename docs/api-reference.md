# API Reference

Complete reference for the Concrete Mix Design IPT/EPUSP API.

## Base URL

```
https://your-domain.com/api/v1
```

For local development:
```
http://localhost:3000/api/v1
```

---

## Endpoints

### POST /dosage

Calculate concrete mix design using the IPT/EPUSP method.

#### Request Headers

| Header         | Value              | Required |
| -------------- | ------------------ | -------- |
| `Content-Type` | `application/json` | Yes      |

#### Request Body

```json
{
  "experimentalPoints": [
    {
      "m": 3.5,
      "ac": 0.45,
      "fcj": 42,
      "density": 2350
    },
    {
      "m": 5.0,
      "ac": 0.58,
      "fcj": 32,
      "density": 2300
    },
    {
      "m": 6.5,
      "ac": 0.72,
      "fcj": 22,
      "density": 2250
    }
  ],
  "target": {
    "fck": 30,
    "sd": 5.5,
    "aggressivenessClass": 2,
    "elementType": "CA",
    "slump": 100,
    "mortarContent": 52
  }
}
```

#### Request Parameters

##### Experimental Points (array, min 3 items)

| Field     | Type   | Range       | Description                           |
| --------- | ------ | ----------- | ------------------------------------- |
| `m`       | number | 0.1 - 15    | Dry trace ratio (aggregate/cement)    |
| `ac`      | number | 0.1 - 1.0   | Water/cement ratio                    |
| `fcj`     | number | 1 - 200     | Compressive strength at 28 days (MPa) |
| `density` | number | 1500 - 3000 | Fresh concrete density (kg/m³)        |

##### Target Parameters

| Field                 | Type   | Options/Range | Description                             |
| --------------------- | ------ | ------------- | --------------------------------------- |
| `fck`                 | number | 10 - 100      | Characteristic strength (MPa)           |
| `sd`                  | number | 2 - 10        | Standard deviation (MPa)                |
| `aggressivenessClass` | number | 1, 2, 3, 4    | Environmental aggressiveness (NBR 6118) |
| `elementType`         | string | "CA", "CP"    | Reinforced or Prestressed concrete      |
| `slump`               | number | 0 - 250       | Slump test (mm)                         |
| `mortarContent`       | number | 40 - 65       | Mortar content (%)                      |

#### Aggressiveness Classes (CAA)

| Class | Environment        | Min fck (CA) | Min fck (CP) | Max a/c (CA) |
| ----- | ------------------ | ------------ | ------------ | ------------ |
| I     | Rural, submerged   | 20 MPa       | 25 MPa       | 0.65         |
| II    | Urban              | 25 MPa       | 30 MPa       | 0.60         |
| III   | Marine, industrial | 30 MPa       | 35 MPa       | 0.55         |
| IV    | Industrial, splash | 40 MPa       | 45 MPa       | 0.45         |

---

#### Success Response (200 OK)

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
      "abrams": {
        "k1": 125.29,
        "k2": 11.007,
        "r2": 0.9951
      },
      "lyse": {
        "k3": -1.48,
        "k4": 11.11,
        "r2": 0.9995
      },
      "molinari": {
        "k5": 0.2952,
        "k6": 0.5157,
        "r2": 0.9998
      }
    },
    "warnings": []
  }
}
```

#### Response Fields

| Field                  | Description                           |
| ---------------------- | ------------------------------------- |
| `finalTrace`           | Unit trace (cement:sand:gravel:water) |
| `consumption`          | Material consumption per m³           |
| `parameters.fcjTarget` | Required dosage strength (MPa)        |
| `parameters.targetAC`  | Calculated water/cement ratio         |
| `parameters.targetM`   | Calculated dry trace ratio            |
| `coefficients`         | Regression coefficients for each law  |
| `warnings`             | Normative warnings (if any)           |

---

#### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos",
    "details": [
      {
        "path": ["target", "fck"],
        "message": "Resistência fck deve estar entre 10 e 100 MPa"
      }
    ]
  }
}
```

#### Error Codes

| Code                | HTTP Status | Description                              |
| ------------------- | ----------- | ---------------------------------------- |
| `VALIDATION_ERROR`  | 400         | Invalid input data                       |
| `CALCULATION_ERROR` | 422         | Unable to calculate (invalid regression) |
| `INTERNAL_ERROR`    | 500         | Server error                             |

---

## Example: cURL

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

## Example: JavaScript/Fetch

```javascript
const response = await fetch('/api/v1/dosage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    experimentalPoints: [
      { m: 3.5, ac: 0.45, fcj: 42, density: 2350 },
      { m: 5.0, ac: 0.58, fcj: 32, density: 2300 },
      { m: 6.5, ac: 0.72, fcj: 22, density: 2250 }
    ],
    target: {
      fck: 30,
      sd: 5.5,
      aggressivenessClass: 2,
      elementType: 'CA',
      slump: 100,
      mortarContent: 52
    }
  })
});

const data = await response.json();
console.log(data.data.finalTrace);
// { cement: 1, sand: 1.56, gravel: 2.36, water: 0.49 }
```

## Example: Python

```python
import requests

response = requests.post(
    "http://localhost:3000/api/v1/dosage",
    json={
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
    }
)

data = response.json()
print(f"Traço: 1 : {data['data']['finalTrace']['sand']:.2f} : {data['data']['finalTrace']['gravel']:.2f}")
# Traço: 1 : 1.56 : 2.36
```

---

## Testing

For comprehensive API testing documentation, including test cases, assertions, and coverage details, see:

📋 **[API Testing Documentation](./api-testing.md)**

### Quick Test Commands

```bash
# Run API integration tests
npm run test:api

# Ensure dev server is running first
npm run dev
```

### Test Coverage

| Category          | Tests |
| ----------------- | ----- |
| Health Check      | 1     |
| Happy Path        | 1     |
| Validation Errors | 2     |
| **Total**         | **4** |
