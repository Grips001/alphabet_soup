# Requirements: AlphabetSoup

**Defined:** 2026-03-04
**Core Value:** The factory automation loop -- placing machines, routing letters on belts, and watching assemblers produce words -- must feel satisfying and work reliably.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Simulation

- [x] **SIM-01**: Game runs on a fixed-timestep tick engine decoupled from render framerate
- [ ] **SIM-02**: Player can pause, play at 1x, and fast-forward at 2x speed

### Grid & World

- [x] **GRID-01**: World is a 2D tile grid where buildings snap to grid positions
- [ ] **GRID-02**: Player can place buildings with ghost preview showing validity
- [ ] **GRID-03**: Player can demolish placed buildings
- [x] **GRID-04**: Player can pan camera with mouse/keyboard and zoom with scroll wheel

### Transport

- [ ] **TRNS-01**: Player can place conveyor belts that move letter items in a direction
- [ ] **TRNS-02**: Belts support corners and auto-connect when placed in L-shapes
- [ ] **TRNS-03**: Player can place inserters that transfer items between belts and machines
- [ ] **TRNS-04**: Player can place belt splitters that divide item flow
- [ ] **TRNS-05**: Player can place underground belts that tunnel under obstacles

### Production

- [ ] **PROD-01**: Letter quarries at fixed map positions produce a specific letter over time
- [ ] **PROD-02**: Player can place assembler machines and assign a word recipe
- [ ] **PROD-03**: Assemblers consume the correct letters and output a completed word item

### Word System

- [ ] **WORD-01**: Game includes a curated dictionary of common English words organized by tier
- [ ] **WORD-02**: Assembler recipes require feeding specific letters to produce a word
- [ ] **WORD-03**: Completing a word triggers a satisfying visual effect

### Progression

- [ ] **PROG-01**: Completed words routed to a central hub earn currency
- [ ] **PROG-02**: Hub tracks word completion goals and progress
- [ ] **PROG-03**: Currency is spent to purchase machines, belts, and upgrades
- [ ] **PROG-04**: Tech tree unlocks word tiers (3-letter to 4-letter to 5-letter)
- [ ] **PROG-05**: Words using rare letters (Q, Z, X, J) earn bonus currency

### Persistence & UI

- [ ] **UI-01**: HUD displays current currency, selected tool, and production stats
- [ ] **UI-02**: Game state saves to localStorage and can be loaded on return
- [ ] **UI-03**: Save format is versioned for future migration

### Infrastructure

- [x] **INFRA-01**: Project builds with Vite and deploys to Vercel via GitHub integration
- [ ] **INFRA-02**: CI pipeline runs type-check and tests on push

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Transport

- **TRNS-06**: Belt priority splitters (configurable split ratios)
- **TRNS-07**: Belt speed tiers (slow/medium/fast)

### Advanced Production

- **PROD-04**: Word-to-word chaining (completed words as inputs to higher-tier assemblers)
- **PROD-05**: Multiple assembler tiers with different speeds

### Polish

- **UI-04**: Multiple save slots
- **UI-05**: Production statistics panel with throughput graphs
- **UI-06**: Undo/redo for placement actions
- **UI-07**: Sound effects and music

### Content

- **WORD-04**: 6+ letter word tiers
- **WORD-05**: Multiple maps with different quarry layouts
- **WORD-06**: Achievement system

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multiplayer / competitive | Massively increases complexity; single-player factory sim is viable (Shapez.io proves this) |
| Mobile / touch support | Precise tile placement on small screens is frustrating; desktop browser first |
| Real-time combat / enemies | Challenge comes from logistics + vocabulary, not tower defense; splits focus |
| Free-form word typing | Bypasses factory simulation; the factory IS the input method |
| Procedural / infinite maps | Fixed quarry placement creates spatial puzzles; infinite maps dilute routing challenge |
| Idle / offline progression | Undermines active factory-building gameplay |
| Full English dictionary (170k+ words) | Overwhelming, unbalanceable; curated 2,000-5,000 words is better for gameplay |
| React/Vue/Angular UI wrapper | 100% canvas game; UI frameworks add bundle size and impedance mismatch with Phaser |
| Cloud saves / user accounts | localStorage sufficient for v1; no backend needed |
| Blueprint / copy-paste system | Premature for v1; each word recipe creates unique routing, not repeated patterns |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SIM-01 | Phase 1: Foundation | Complete |
| SIM-02 | Phase 4: Progression & Economy | Pending |
| GRID-01 | Phase 1: Foundation | Complete |
| GRID-02 | Phase 2: Resource Production | Pending |
| GRID-03 | Phase 2: Resource Production | Pending |
| GRID-04 | Phase 1: Foundation | Complete |
| TRNS-01 | Phase 2: Resource Production | Pending |
| TRNS-02 | Phase 2: Resource Production | Pending |
| TRNS-03 | Phase 3: Factory Loop | Pending |
| TRNS-04 | Phase 3: Factory Loop | Pending |
| TRNS-05 | Phase 3: Factory Loop | Pending |
| PROD-01 | Phase 2: Resource Production | Pending |
| PROD-02 | Phase 3: Factory Loop | Pending |
| PROD-03 | Phase 3: Factory Loop | Pending |
| WORD-01 | Phase 3: Factory Loop | Pending |
| WORD-02 | Phase 3: Factory Loop | Pending |
| WORD-03 | Phase 4: Progression & Economy | Pending |
| PROG-01 | Phase 4: Progression & Economy | Pending |
| PROG-02 | Phase 4: Progression & Economy | Pending |
| PROG-03 | Phase 4: Progression & Economy | Pending |
| PROG-04 | Phase 4: Progression & Economy | Pending |
| PROG-05 | Phase 4: Progression & Economy | Pending |
| UI-01 | Phase 5: Persistence & Polish | Pending |
| UI-02 | Phase 5: Persistence & Polish | Pending |
| UI-03 | Phase 5: Persistence & Polish | Pending |
| INFRA-01 | Phase 1: Foundation | Complete |
| INFRA-02 | Phase 1: Foundation | Pending |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after roadmap creation*
