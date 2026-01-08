# API Testing Documentation

Complete guide for testing the Concrete Mix Design IPT/EPUSP API.

## Overview

The API testing suite validates the `/api/v1/dosage` endpoint using Vitest. Tests verify both happy paths and error handling scenarios.

---

## Test Suite Structure

```
src/tests/
├── dosage-api.test.ts       # API integration tests
├── integration/
│   └── api/                 # Additional API integration tests
└── unit/
    ├── math/                # Mathematical calculations tests
    └── normative/           # Normative compliance tests
```

---

## Running Tests

### Prerequisites

1. Ensure the development server is running:
   ```bash
   npm run dev
   ```

2. Server must be available at `http://localhost:3000`

### Execute Tests

```bash
# Run API tests
npm run test:api

# Or run directly with Vitest
npx vitest run src/tests/dosage-api.test.ts
```

---

## Test Cases

### 1. Health Check / API Info (GET)

| Test         | Description                          |
| ------------ | ------------------------------------ |
| **Endpoint** | `GET /api/v1/dosage`                 |
| **Purpose**  | Verify API availability and metadata |
| **Expected** | Status 200, API name and version     |

**Assertions:**
- Response status is `200`
- `data.name` contains "Concrete Mix Design API"
- `data.version` equals "1.0.0"
- `data.normativeReferences` contains "NBR 6118:2023"

---

### 2. Complete Dosage Calculation (POST - Happy Path)

| Test         | Description                        |
| ------------ | ---------------------------------- |
| **Endpoint** | `POST /api/v1/dosage`              |
| **Purpose**  | Verify complete dosage calculation |
| **Expected** | Status 200, complete trace data    |

**Input Payload:**
```json
{
  "experimentalPoints": [
    { "m": 3.5, "ac": 0.45, "fcj": 42, "density": 2350 },
    { "m": 5.0, "ac": 0.58, "fcj": 32, "density": 2300 },
    { "m": 6.5, "ac": 0.72, "fcj": 22, "density": 2250 }
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

**Assertions:**
- Response status is `200`
- `data.success` is `true`
- `data.data.finalTrace` contains `cement`, `sand`, `gravel`, `water`
- `data.data.consumption.cement` > 0
- `data.data.consumption.water` > 0
- `data.data.parameters.fcjTarget` ≈ 39.075 (fck + 1.65×sd)

---

### 3. Validation Error - Insufficient Points (POST)

| Test         | Description                                       |
| ------------ | ------------------------------------------------- |
| **Endpoint** | `POST /api/v1/dosage`                             |
| **Purpose**  | Reject input with less than 3 experimental points |
| **Expected** | Status 400, validation error                      |

**Input Payload:**
```json
{
  "experimentalPoints": [
    { "m": 3.5, "ac": 0.45, "fcj": 42, "density": 2350 }
  ],
  "target": { "fck": 30, "sd": 5.5 }
}
```

**Assertions:**
- Response status is `400`
- `data.success` is `false`
- `data.error` is defined

---

### 4. Validation Error - Negative fck (POST)

| Test         | Description                             |
| ------------ | --------------------------------------- |
| **Endpoint** | `POST /api/v1/dosage`                   |
| **Purpose**  | Reject negative characteristic strength |
| **Expected** | Status 400, validation error            |

**Input Payload:**
```json
{
  "experimentalPoints": [
    { "m": 3.5, "ac": 0.45, "fcj": 42, "density": 2350 },
    { "m": 5.0, "ac": 0.58, "fcj": 32, "density": 2300 },
    { "m": 6.5, "ac": 0.72, "fcj": 22, "density": 2250 }
  ],
  "target": { "fck": -30, "sd": 5.5 }
}
```

**Assertions:**
- Response status is `400`
- `data.success` is `false`

---

## Test Coverage Summary

| Category          | Tests | Status   |
| ----------------- | ----- | -------- |
| Health Check      | 1     | ✅        |
| Happy Path        | 1     | ✅        |
| Validation Errors | 2     | ✅        |
| **Total**         | **4** | **100%** |

---

## Validation Rules Tested

| Rule                          | Test Case    |
| ----------------------------- | ------------ |
| Minimum 3 experimental points | Test #3      |
| fck must be positive          | Test #4      |
| Required fields present       | Tests #3, #4 |
| Mathematical consistency      | Test #2      |

---

## Mathematical Verification

### fcj Target Calculation

Per NBR 12655, the target dosage strength (fcj) is calculated as:

```
fcj = fck + 1.65 × sd
```

For the test case:
- fck = 30 MPa
- sd = 5.5 MPa
- fcj = 30 + 1.65 × 5.5 = **39.075 MPa**

This value is verified in Test #2.

---

## Adding New Tests

To add new test cases:

1. Edit `src/tests/dosage-api.test.ts`
2. Follow the existing pattern:

```typescript
it("TEST_NAME", async () => {
  const payload = { /* test data */ };
  
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  expect(response.status).toBe(200); // or expected status
  const data = await response.json();
  // Add assertions
});
```

---

## Troubleshooting

| Issue             | Solution                                |
| ----------------- | --------------------------------------- |
| Connection failed | Ensure `npm run dev` is running         |
| Port conflict     | Check if port 3000 is available         |
| Timeout           | Increase Vitest timeout in config       |
| Type errors       | Run `npm run build` to check TypeScript |

---

## Related Documentation

- [API Reference](./api-reference.md) - Complete API specification
- [Architecture](./architecture.md) - System architecture
- [Normative Standards](./normative-standards.md) - NBR compliance details
