import { describe, it, expect } from "vitest";

const BASE_URL = "http://localhost:3000/api/v1/dosage";

describe("Dosage API Integration Tests", () => {
  // Teste 1: GET Method (Health Check/Info)
  it("GET /api/v1/dosage - should return 200 and method metadata", async () => {
    try {
      const response = await fetch(BASE_URL);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.name).toContain("Concrete Mix Design API");
      expect(data.version).toBe("1.0.0");
      expect(data.normativeReferences).toContain("NBR 6118:2023");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Connection failed: ${msg} (Make sure server is running on port 3000)`
      );
    }
  });

  // Teste 2: POST Valid Data (Happy Path)
  it("POST /api/v1/dosage - should calculate complete dosage correctly", async () => {
    const payload = {
      experimentalPoints: [
        { m: 3.5, ac: 0.45, fcj: 42, density: 2350 },
        { m: 5.0, ac: 0.58, fcj: 32, density: 2300 },
        { m: 6.5, ac: 0.72, fcj: 22, density: 2250 },
      ],
      target: {
        fck: 30,
        sd: 5.5,
        aggressivenessClass: 2,
        elementType: "CA",
        slump: 100,
        mortarContent: 52,
      },
    };

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.success).toBe(true);

    // Verificações de estrutura
    expect(data.data.finalTrace).toHaveProperty("cement");
    expect(data.data.finalTrace).toHaveProperty("sand");
    expect(data.data.finalTrace).toHaveProperty("gravel");
    expect(data.data.finalTrace).toHaveProperty("water");

    // Verificações de valores lógicos (não negativos)
    expect(data.data.consumption.cement).toBeGreaterThan(0);
    expect(data.data.consumption.water).toBeGreaterThan(0);

    // Verificação de consistência matemática básica
    // fcj alvo deve ser calculado como fck + 1.65*sd (aprox, dependendo da norma usada no backend)
    // 30 + 1.65*5.5 = 39.075
    expect(data.data.parameters.fcjTarget).toBeCloseTo(39.075, 1);
  });

  // Teste 3: Validation Error (Missing Data)
  it("POST /api/v1/dosage - should return 400 for insufficient experimental points", async () => {
    const payload = {
      experimentalPoints: [
        { m: 3.5, ac: 0.45, fcj: 42, density: 2350 },
        // Só um ponto, precisa de 3
      ],
      target: {
        fck: 30,
        sd: 5.5,
      },
    };

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(400); // Bad Request
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  // Teste 4: Validation Error (Invalid Values)
  it("POST /api/v1/dosage - should return 400 for negative fck", async () => {
    const payload = {
      experimentalPoints: [
        { m: 3.5, ac: 0.45, fcj: 42, density: 2350 },
        { m: 5.0, ac: 0.58, fcj: 32, density: 2300 },
        { m: 6.5, ac: 0.72, fcj: 22, density: 2250 },
      ],
      target: {
        fck: -30, // Inválido
        sd: 5.5,
      },
    };

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
  });
});
