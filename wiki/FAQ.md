# FAQ - Frequently Asked Questions

Common questions about the Concrete Mix Design API.

---

## General Questions

### What is the IPT/EPUSP method?

The IPT/EPUSP method is a concrete mix design approach developed by the Instituto de Pesquisas Tecnológicas (IPT) and Escola Politécnica da USP (EPUSP) in Brazil. It uses three experimental traces to determine optimal concrete proportions through empirical laws (Abrams, Lyse, Molinari).

### Why do I need 3 experimental points?

The method requires a minimum of 3 points to fit the regression curves:
- **Rico (Rich)** - High cement content
- **Piloto (Pilot)** - Medium cement content  
- **Pobre (Lean)** - Low cement content

These points establish the relationships between strength, water/cement ratio, trace ratio, and cement consumption.

### What are the k1, k2, k3, k4, k5, k6 coefficients?

These are the regression coefficients from each empirical law:
- **k1, k2** - Abrams Law coefficients (strength vs a/c)
- **k3, k4** - Lyse Law coefficients (trace vs a/c)
- **k5, k6** - Molinari Law coefficients (cement consumption vs trace)

### What is R² and why is it important?

R² (coefficient of determination) measures how well the regression fits the data:
- **R² > 0.99** - Excellent fit
- **R² 0.95-0.99** - Good fit
- **R² < 0.95** - May indicate data issues

Low R² values suggest the experimental data may have errors or the model doesn't fit well.

---

## Technical Questions

### What is the difference between fck and fcj?

| Term    | Description                                                                                   |
| ------- | --------------------------------------------------------------------------------------------- |
| **fck** | Characteristic compressive strength - the value specified in the project (e.g., C30 = 30 MPa) |
| **fcj** | Required average strength for dosage - calculated as fck + 1.65 × Sd                          |

The API automatically calculates fcj from fck using NBR 12655.

### What is aggressivenessClass?

Environmental Aggressiveness Class (CAA) per NBR 6118:

| Class | Environment | Example                        |
| ----- | ----------- | ------------------------------ |
| 1     | Weak        | Rural, submerged structures    |
| 2     | Moderate    | Urban areas                    |
| 3     | Strong      | Marine, industrial             |
| 4     | Very Strong | Industrial, tidal splash zones |

Each class has minimum requirements for fck, maximum a/c, and minimum cement content.

### What is elementType (CA vs CP)?

| Type   | Description                                |
| ------ | ------------------------------------------ |
| **CA** | Concreto Armado (Reinforced Concrete)      |
| **CP** | Concreto Protendido (Prestressed Concrete) |

Prestressed concrete has stricter durability requirements per NBR 6118.

### What is mortarContent?

The percentage of mortar (cement + sand + water) in the concrete mix, typically between 40-65%. It affects workability and segregation resistance.

---

## API Questions

### What happens if a/c exceeds the normative limit?

The API will:
1. Calculate the optimal a/c from Abrams Law
2. Check against NBR 6118 limits
3. Return a warning in the `warnings` array
4. NOT modify the calculated value - you must decide how to proceed

### Can I use more than 3 experimental points?

Yes! The regression will be fitted using all provided points. More points generally improve accuracy, especially if they span a wide range of a/c values.

### What units are used?

| Parameter           | Unit  |
| ------------------- | ----- |
| Strength (fck, fcj) | MPa   |
| Standard deviation  | MPa   |
| Slump               | mm    |
| Density             | kg/m³ |
| Cement consumption  | kg/m³ |
| Water consumption   | L/m³  |

### Why doesn't the Slump value affect the results?

In the pure IPT/EPUSP method, the experimental points (Rich, Pilot, Lean) are produced with the **same target slump** as the final project. Therefore, the water-cement ratio (a/c) and cement consumption (C) derived from these points already inherently include the water demand required to achieve that slump.

If you need to correct for a different slump, you should ideally perform new experimental mixes. The API receives the `slump` parameter for documentation and compliance checking purposes, but it does not apply artificial mathematical corrections to the water consumption, preserving the empirical nature of the method.

### How do I interpret the finalTrace?

The final trace is expressed as unit proportions relative to cement:

```
1 : 1.56 : 2.36 : 0.49
cement : sand : gravel : water
```

To calculate materials for 1 m³:
1. Get cement consumption from `consumption.cement`
2. Multiply ratios by cement amount

---

## Troubleshooting

### Error: VALIDATION_ERROR

**Cause:** Input data doesn't meet schema requirements.

**Solution:** Check the error details for specific field issues:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": ["target", "fck"], "message": "Must be between 10-100" }
    ]
  }
}
```

### Error: CALCULATION_ERROR

**Cause:** Mathematical calculation failed (e.g., invalid regression).

**Possible causes:**
- Experimental points are too close together
- Data points don't follow expected trends
- Numerical overflow

**Solution:** Verify experimental data is correct and spans a reasonable range.

### Low R² values

**Possible causes:**
- Measurement errors in experimental data
- Inconsistent testing procedures
- Materials with unusual properties

**Solution:** 
- Verify experimental procedures
- Check for outliers
- Consider re-testing

### Warnings about normative limits

The API may return warnings like:
- "a/c calculado (0.65) ultrapassa limite máximo (0.60) para CAA II"
- "fck especificado (20 MPa) está abaixo do mínimo (25 MPa) para CAA II"

These are informational - the API still returns calculated values, but you should review and adjust as needed.

---

## Best Practices

### 1. Validate Input Before Sending

```javascript
if (experimentalPoints.length < 3) {
  throw new Error('Minimum 3 points required');
}

if (target.fck < 10 || target.fck > 100) {
  throw new Error('Invalid fck value');
}
```

### 2. Handle Warnings Appropriately

```javascript
const result = await calculateDosage(input);

if (result.data.warnings.length > 0) {
  console.warn('Normative warnings:', result.data.warnings);
  // Display to user or log for review
}
```

### 3. Store Coefficients for Auditing

```javascript
// Save regression coefficients for future reference
const auditLog = {
  timestamp: new Date(),
  input: inputData,
  coefficients: result.data.coefficients,
  result: result.data.finalTrace
};
```

### 4. Verify R² Values

```javascript
const { abrams, lyse, molinari } = result.data.coefficients;

if (abrams.r2 < 0.95 || lyse.r2 < 0.95 || molinari.r2 < 0.95) {
  console.warn('Low R² detected - verify experimental data');
}
```

---

## Still Have Questions?

- Check the [API Reference](API-Reference) for detailed endpoint documentation
- Review [Mathematical Models](Mathematical-Models) for formula explanations
- Open an issue on [GitHub](https://github.com/fcfim/Concrete-Mix-Design-IPT-Method/issues)
