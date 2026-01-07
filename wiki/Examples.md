# Examples

Code examples for integrating with the Concrete Mix Design API.

---

## JavaScript / Node.js

### Using Fetch API

```javascript
const calculateDosage = async () => {
  const response = await fetch('http://localhost:3000/api/v1/dosage', {
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
  
  if (data.success) {
    console.log('Traço Unitário:');
    console.log(`  1 : ${data.data.finalTrace.sand.toFixed(2)} : ${data.data.finalTrace.gravel.toFixed(2)} : ${data.data.finalTrace.water.toFixed(2)}`);
    console.log('\nConsumo por m³:');
    console.log(`  Cimento: ${data.data.consumption.cement} kg/m³`);
    console.log(`  Areia: ${data.data.consumption.sand} kg/m³`);
    console.log(`  Brita: ${data.data.consumption.gravel} kg/m³`);
    console.log(`  Água: ${data.data.consumption.water} L/m³`);
  } else {
    console.error('Erro:', data.error.message);
  }
};

calculateDosage();
```

### Using Axios

```javascript
const axios = require('axios');

const calculateDosage = async () => {
  try {
    const { data } = await axios.post('http://localhost:3000/api/v1/dosage', {
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
    });

    console.log('Resultado:', data.data.finalTrace);
  } catch (error) {
    console.error('Erro:', error.response?.data?.error);
  }
};

calculateDosage();
```

---

## Python

### Using Requests

```python
import requests

def calculate_dosage():
    url = "http://localhost:3000/api/v1/dosage"
    
    payload = {
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
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    if data["success"]:
        trace = data["data"]["finalTrace"]
        consumption = data["data"]["consumption"]
        
        print("=== Resultado da Dosagem ===")
        print(f"\nTraço Unitário: 1 : {trace['sand']:.2f} : {trace['gravel']:.2f} : {trace['water']:.2f}")
        print(f"\nConsumo por m³:")
        print(f"  Cimento: {consumption['cement']} kg/m³")
        print(f"  Areia:   {consumption['sand']} kg/m³")
        print(f"  Brita:   {consumption['gravel']} kg/m³")
        print(f"  Água:    {consumption['water']} L/m³")
        
        print(f"\nParâmetros:")
        params = data["data"]["parameters"]
        print(f"  fcj alvo: {params['fcjTarget']:.2f} MPa")
        print(f"  a/c alvo: {params['targetAC']:.3f}")
        print(f"  m alvo:   {params['targetM']:.2f}")
    else:
        print(f"Erro: {data['error']['message']}")

if __name__ == "__main__":
    calculate_dosage()
```

### Using aiohttp (Async)

```python
import asyncio
import aiohttp

async def calculate_dosage():
    url = "http://localhost:3000/api/v1/dosage"
    
    payload = {
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
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
            data = await response.json()
            print(f"Traço: 1 : {data['data']['finalTrace']['sand']:.2f}")

asyncio.run(calculate_dosage())
```

---

## C# / .NET

```csharp
using System.Net.Http;
using System.Text;
using System.Text.Json;

public class DosageCalculator
{
    private readonly HttpClient _httpClient;
    
    public DosageCalculator()
    {
        _httpClient = new HttpClient();
    }
    
    public async Task<DosageResult> CalculateAsync()
    {
        var request = new
        {
            experimentalPoints = new[]
            {
                new { m = 3.5, ac = 0.45, fcj = 42, density = 2350 },
                new { m = 5.0, ac = 0.58, fcj = 32, density = 2300 },
                new { m = 6.5, ac = 0.72, fcj = 22, density = 2250 }
            },
            target = new
            {
                fck = 30,
                sd = 5.5,
                aggressivenessClass = 2,
                elementType = "CA",
                slump = 100,
                mortarContent = 52
            }
        };
        
        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await _httpClient.PostAsync(
            "http://localhost:3000/api/v1/dosage", 
            content
        );
        
        var responseJson = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<DosageResult>(responseJson);
    }
}
```

---

## PHP

```php
<?php

function calculateDosage() {
    $url = "http://localhost:3000/api/v1/dosage";
    
    $data = [
        "experimentalPoints" => [
            ["m" => 3.5, "ac" => 0.45, "fcj" => 42, "density" => 2350],
            ["m" => 5.0, "ac" => 0.58, "fcj" => 32, "density" => 2300],
            ["m" => 6.5, "ac" => 0.72, "fcj" => 22, "density" => 2250]
        ],
        "target" => [
            "fck" => 30,
            "sd" => 5.5,
            "aggressivenessClass" => 2,
            "elementType" => "CA",
            "slump" => 100,
            "mortarContent" => 52
        ]
    ];
    
    $options = [
        "http" => [
            "header" => "Content-Type: application/json\r\n",
            "method" => "POST",
            "content" => json_encode($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    $result = json_decode($response, true);
    
    if ($result["success"]) {
        $trace = $result["data"]["finalTrace"];
        echo "Traço: 1 : " . number_format($trace["sand"], 2) . 
             " : " . number_format($trace["gravel"], 2) . 
             " : " . number_format($trace["water"], 2);
    }
}

calculateDosage();
```

---

## Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

type DosageRequest struct {
    ExperimentalPoints []ExperimentalPoint `json:"experimentalPoints"`
    Target             Target              `json:"target"`
}

type ExperimentalPoint struct {
    M       float64 `json:"m"`
    AC      float64 `json:"ac"`
    FCJ     float64 `json:"fcj"`
    Density float64 `json:"density"`
}

type Target struct {
    FCK                float64 `json:"fck"`
    SD                 float64 `json:"sd"`
    AggressivenessClass int    `json:"aggressivenessClass"`
    ElementType        string  `json:"elementType"`
    Slump              int     `json:"slump"`
    MortarContent      int     `json:"mortarContent"`
}

func main() {
    request := DosageRequest{
        ExperimentalPoints: []ExperimentalPoint{
            {M: 3.5, AC: 0.45, FCJ: 42, Density: 2350},
            {M: 5.0, AC: 0.58, FCJ: 32, Density: 2300},
            {M: 6.5, AC: 0.72, FCJ: 22, Density: 2250},
        },
        Target: Target{
            FCK: 30, SD: 5.5, AggressivenessClass: 2,
            ElementType: "CA", Slump: 100, MortarContent: 52,
        },
    }
    
    jsonData, _ := json.Marshal(request)
    
    resp, err := http.Post(
        "http://localhost:3000/api/v1/dosage",
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    
    fmt.Printf("Resultado: %+v\n", result)
}
```

---

## Common Use Cases

### 1. Batch Processing

```javascript
const concreteClasses = [20, 25, 30, 35, 40];

const results = await Promise.all(
  concreteClasses.map(fck => 
    fetch('/api/v1/dosage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experimentalPoints: [...],
        target: { fck, sd: 5.5, aggressivenessClass: 2, elementType: 'CA' }
      })
    }).then(r => r.json())
  )
);

console.table(results.map((r, i) => ({
  'fck (MPa)': concreteClasses[i],
  'Cement (kg/m³)': r.data.consumption.cement,
  'a/c': r.data.parameters.targetAC.toFixed(3)
})));
```

### 2. Validation Before Submit

```javascript
const validateInput = (data) => {
  const errors = [];
  
  if (data.experimentalPoints.length < 3) {
    errors.push('Minimum 3 experimental points required');
  }
  
  if (data.target.fck < 10 || data.target.fck > 100) {
    errors.push('fck must be between 10-100 MPa');
  }
  
  return errors;
};
```
