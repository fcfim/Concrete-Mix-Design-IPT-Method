# 🧱 Concrete Mix Design API - IPT/EPUSP Method

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

A modern REST API for concrete mix design using the **IPT/EPUSP method**, widely adopted in Brazil for precise concrete proportioning based on experimental data.

## 🎯 Features

- **IPT/EPUSP Method** - Complete implementation with Abrams, Lyse, and Molinari laws
- **NBR Compliance** - Automatic verification against NBR 6118:2023 and NBR 12655:2022
- **Interactive Playground** - Web interface for real-time testing
- **Dosage Charts** - Visualization of regression curves
- **Clean Architecture** - Maintainable and testable codebase
- **Edge Runtime** - Fast, globally distributed API

---

## 📚 Documentation

| Document                                           | Description                                   |
| -------------------------------------------------- | --------------------------------------------- |
| [API Reference](docs/api-reference.md)             | Complete endpoint documentation with examples |
| [Mathematical Models](docs/mathematical-models.md) | Abrams, Lyse, and Molinari laws explained     |
| [Normative Standards](docs/normative-standards.md) | NBR 6118, NBR 12655, NBR 8953                 |
| [Architecture](docs/architecture.md)               | Clean Architecture layers and data flow       |

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/fcfim/Concrete-Mix-Design-IPT-Method.git
cd Concrete-Mix-Design-IPT-Method

# Install dependencies
npm install

# Start development server
npm run dev
```

### First API Call

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

### Response

```json
{
  "success": true,
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
    }
  }
}
```

---

## 🔬 How It Works

The IPT/EPUSP method uses three experimental traces (Rich, Pilot, Lean) to determine optimal concrete proportions:

```
┌─────────────────────────────────────────────────────────────┐
│   INPUT: 3 Experimental Traces                              │
│   Rico:   m=3.5, a/c=0.45, fcj=42 MPa                       │
│   Piloto: m=5.0, a/c=0.58, fcj=32 MPa                       │
│   Pobre:  m=6.5, a/c=0.72, fcj=22 MPa                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1️⃣ Abrams Law: fcj = k₁ / k₂^(a/c) → target a/c           │
│   2️⃣ Lyse Law:   m = k₃ + k₄ × (a/c) → target m             │
│   3️⃣ Molinari:   C = 1000 / (k₅ + k₆ × m) → cement kg/m³    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│   OUTPUT: Final Unit Trace                                  │
│   1 : 1.56 : 2.36 : 0.49                                    │
│   (cement : sand : gravel : water)                          │
└─────────────────────────────────────────────────────────────┘
```

→ See [Mathematical Models](docs/mathematical-models.md) for detailed formulas.

---

## 📋 API Reference

### `POST /api/v1/dosage`

Calculate concrete mix design from experimental data.

#### Request Body

| Field                          | Type      | Description                    |
| ------------------------------ | --------- | ------------------------------ |
| `experimentalPoints`           | array     | Minimum 3 experimental traces  |
| `experimentalPoints[].m`       | number    | Dry trace ratio (0.1-15)       |
| `experimentalPoints[].ac`      | number    | Water/cement ratio (0.1-1.0)   |
| `experimentalPoints[].fcj`     | number    | Compressive strength (MPa)     |
| `experimentalPoints[].density` | number    | Fresh density (kg/m³)          |
| `target.fck`                   | number    | Characteristic strength (MPa)  |
| `target.sd`                    | number    | Standard deviation (MPa)       |
| `target.aggressivenessClass`   | 1-4       | Environmental class (NBR 6118) |
| `target.elementType`           | "CA"/"CP" | Reinforced/Prestressed         |
| `target.slump`                 | number    | Slump test (mm)                |
| `target.mortarContent`         | number    | Mortar content (%)             |

→ See [API Reference](docs/api-reference.md) for complete documentation.

---

## 🏛️ Normative Standards

This API enforces Brazilian normative requirements:

| Standard           | Description         | Key Rules                        |
| ------------------ | ------------------- | -------------------------------- |
| **NBR 6118:2023**  | Concrete structures | Max a/c, min fck per environment |
| **NBR 12655:2022** | Production control  | f_cj = f_ck + 1.65×Sd formula    |
| **NBR 8953:2015**  | Concrete classes    | Strength classifications         |

→ See [Normative Standards](docs/normative-standards.md) for detailed tables.

---

## 🏗️ Architecture

Clean Architecture with 4 layers:

```
src/
├── app/              # Presentation (Next.js routes, UI)
├── core/
│   ├── domain/       # Entities (TraceResult, DosageTarget)
│   ├── application/  # Use Cases (CalculateDosageUseCase)
│   └── infrastructure/
│       ├── math/     # Abrams, Lyse, Molinari services
│       └── normative/# NBR 6118, NBR 12655 services
└── shared/
    └── lib/schemas/  # Zod validation
```

→ See [Architecture](docs/architecture.md) for data flow diagrams.

---

## 🛠️ Tech Stack

| Technology                                    | Purpose                |
| --------------------------------------------- | ---------------------- |
| [Next.js 15](https://nextjs.org/)             | Framework (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | Type safety            |
| [Zod](https://zod.dev/)                       | Runtime validation     |
| [Recharts](https://recharts.org/)             | Dosage charts          |
| [Tailwind CSS](https://tailwindcss.com/)      | Styling                |
| [shadcn/ui](https://ui.shadcn.com/)           | UI components          |

---

## 📊 Playground

Access the interactive playground at `http://localhost:3000`:

- Pre-filled experimental data
- Real-time calculation
- Dosage charts (Abrams, Lyse, Molinari)
- JSON response viewer
- Dark/Light mode toggle

---

## 📖 References

### Normative Documents

| Standard       | Title                             |
| -------------- | --------------------------------- |
| NBR 6118:2023  | Projeto de estruturas de concreto |
| NBR 12655:2022 | Concreto - Preparo e controle     |
| NBR 8953:2015  | Classificação do concreto         |

### Technical Resources

- [IPT/EPUSP Method - Escola Politécnica USP](https://www.pcc.usp.br/)
- [Duff Abrams Original Paper (1918)](https://en.wikipedia.org/wiki/Duff_Abrams)
- [IBRACON - Instituto Brasileiro do Concreto](https://www.ibracon.org.br/)

---

## 👨‍💻 Author

**Filipe Carboni Fim** - Civil Engineer

[![GitHub](https://img.shields.io/badge/GitHub-@fcfim-181717?logo=github)](https://github.com/fcfim)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-filipefim-0A66C2?logo=linkedin)](https://linkedin.com/in/filipefim)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
