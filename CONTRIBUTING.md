# Contributing Guidelines

Thank you for your interest in improving the Agentic Placement Intelligence Platform.

## Development Workflow

### 1. Fork and Clone
Clone your fork locally:
```bash
git clone https://github.com/nimeshsurvegg-lgtm/agentic-placement-intelligence.git
cd agentic-placement-intelligence
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Local Development Server
Start the local application server:
```bash
npm run dev
# or
npm start
```
The server runs by default at `http://localhost:3000`.

### 4. Code Standards & Tenets
- **Zero Dead Buttons**: Every action button or form control must connect to verified backend endpoints.
- **Explainable Decisions**: AI outputs must show contributing factors and confidence metrics.
- **Human-in-the-Loop**: Disqualification and risk labeling require human officer confirmation.
- **DPDP Act Compliance**: Respect student data boundaries and consent verification.

### 5. Running Automated Verification
Before submitting a pull request, run the test suite to ensure all unit and integration checks pass:
```bash
npm test
```

### 6. Submitting a Pull Request
1. Create a focused feature branch (`git checkout -b feature/your-feature-name`).
2. Commit your changes with descriptive messages.
3. Push to your branch and open a Pull Request against the `main` branch.
