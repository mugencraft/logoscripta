# LogoScripta 🚀

- Clean Code Hexagon Domain Driven Onion Architecture
- ETL foundation with type-safe data processing
- CLI application
- API server Controller
- React backend
- Database ORM integration
- Testing infrastructure

LogoScripta is a modern TypeScript-based **full-stack** platform that combines an **ETL toolkit** with an *educational framework* for developers at all skill levels, implementing a **GitHub** repository *analysis tool*, and **[Obsidian][obsidian]** *Plugins* and *Theme* lists of repositories.

Built with **domain-driven design** principles and *[clean hexagonal architecture][domain-driven-hexagon]*, LogoScripta demonstrates how to create maintainable, scalable TypeScript applications while solving real-world data challenges.
By combining [Drizzle ORM][drizzle], [Zod][zod], [tRPC][trpc], [React][react], [Tanstack][tanstack] and [TypeScript][typescript] in a cohesive application, LogoScripta bridges theory and practice in software development.

## #️⃣ Table of Content

- [LogoScripta 🚀](#logoscripta-)
  - [#️⃣ Table of Content](#️⃣-table-of-content)
  - [🎯 Key Features](#-key-features)
    - [For Github and Obsidian Enthusiasts](#for-github-and-obsidian-enthusiasts)
    - [For Data Professionals](#for-data-professionals)
    - [For Educators and Students](#for-educators-and-students)
    - [For Full-stack Developers](#for-full-stack-developers)
    - [For TypeScript Developers](#for-typescript-developers)
    - [For TanStack Developers](#for-tanstack-developers)
  - [🏗️ Architecture](#️-architecture)
  - [📁 Project Structure](#-project-structure)
  - [⚙️ Configuration](#️-configuration)
  - [🚀 Quick Start](#-quick-start)
    - [Installation](#installation)
    - [Basic Usage](#basic-usage)
  - [🤝 Contributing](#-contributing)
  - [📋 Code Standards](#-code-standards)
  - [📚 References](#-references)
    - [Our Architectural Adaptations](#our-architectural-adaptations)
  - [📄 License](#-license)
  - [💪 Support](#-support)

## 🎯 Key Features

LogoScripta demonstrates modern TypeScript development practices through:

- 🔌 **Data Collection and Integration**:
  - **GitHub** and **Obsidian** API integration with type-safe adapters
  - **Repositories** analysis advanced data grid
  - **Lists** of repositories
  - **Obsidian** Plugins and Themes repository lists

- 🏛️ **Clean, Layered Architecture**
  - **Hexagonal Domain Driven** architecture
  - **SOLID** principles applied throughout codebase
  - **Type-safe** interfaces between all layers

- 🔌 **Complete TanStack Integration for React Backend**
  - **Router**: Type-safe routing with nested layouts
  - **Query**: Data fetching with cache management
  - **Table**: Advanced headless data tables
  - **Form**: Type-safe form handling with validation

- 💾 **Modern Data Management**
  - **tRPC**: End-to-end type-safe API
  - **Drizzle ORM**: Type-safe database operations with SQLite
  - **NoSql** JSON column in SQLite for SQL noSQL solutions
  - **Change Tracking**: Built-in versioning for all data sources
  - **Custom Storage**: JSON and CSV export/import

- 📊 **UI Components and Visualization**
  - **Shadcn/UI**: Accessible Radix-based component library
  - **Recharts**: Interactive data visualizations
  - **Tailwind CSS**: Utility-first styling system
  - **Dark/Light Modes**: Complete theme support
  - **DataTable**: Advanced data grid with Tanstack Table

- 🧰 **Developer Experience**
  - **CLI Tools**: Comprehensive command-line interface
  - **API Server**: Full tRPC backend implementation
  - **Hot Reloading**: Fast development workflow
  - **Type Safety**: End-to-end type checking

### For Github and Obsidian Enthusiasts

- Track and analyze the entire Obsidian plugin and theme ecosystem
- Monitor trends, discover new projects
- Maintain your own curated lists of repositories
- With rich metadata and visualization

### For Data Professionals

- Extract, transform, and load data from GitHub and Obsidian APIs
- Track historical changes with automatic versioning
- Create custom repository collections with search and filtering
- Analyze GitHub trends with configurable data visualizations

### For Educators and Students

- Use as a teaching tool for full-stack TypeScript development
- Reference real-world implementations of software design principles
- Modify and extend the platform as a learning exercise
- Leverage comprehensive documentation and clear code examples

### For Full-stack Developers

- Learn advanced patterns with a clean domain-driven approach
- Understand TanStack tools in a comprehensive implementation
- Explore modern front-end techniques and type-safe backends

### For TypeScript Developers

Study a full type-safe implementation from Drizzle DB schema to tRPC APIs to React UI.

### For TanStack Developers

Experience the complete [TanStack][tanstack] suite working together: [Router][tanstack-router], [Table][tanstack-table], [Form][tanstack-form], [Query][tanstack-query], [Ranger][tanstack-ranger].

## 🏗️ Architecture

LogoScripta follows an onion hexagonal domain driven architecture emphasizing SOLID principles:

1. **Core Layer**: Contains foundational utilities and infrastructure components that are domain-agnostic:
   - Change tracking for version control
   - File system operations
   - Logging infrastructure
   - Serialization utilities for data persistence
   - Shared utilities and helpers

2. **Domain Layer**: The heart of the application, containing:
   - Business models (Repositories, Lists, Topics, etc.)
   - Value objects for immutable domain concepts
   - Domain services for business logic
   - Port interfaces (Commands and Queries)
   - Configuration management

3. **Application Layer**: Orchestrates use cases by:
   - Implementing application services
   - Coordinating domain objects
   - Processing commands from interfaces
   - Managing integrations through factories
   - Providing facades for complex operations

4. **Infrastructure Layer**: External integrations and data persistence:
   - Database layer with ORM mappings
   - Data Repository implementations
   - Adapter implementations for external services (GitHub, Obsidian)
   - Error handling for external systems

5. **Interfaces Layer**: User-facing interfaces that consume the application:
   - CLI commands and processors
   - tRPC API endpoints and handlers
   - React-based web UI and components
   - Data visualization and interaction

## 📁 Project Structure

- 📦 `src/`: Source code
  - 📂 `application/`: Orchestrates domain logic and external integrations
    - 📂 `commands/`: Command handlers for business operations
    - 📂 `integration/`: External service integrators and processors
  - 📂 `core/`: Domain-agnostic utilities and infrastructure
    - 📂 `changes/`: Version control and change tracking mechanisms
    - 📂 `fs/`: File system abstractions and operations
    - 📂 `logging/`: Structured logging facilities
    - 📂 `serialization/`: Data format conversions (CSV, JSON)
    - 📂 `utils/`: Shared helper functions
  - 📂 `domain/`: Core business logic and rules
    - 📂 `config/`: Application configuration management
    - 📂 `models/`: Entity definitions and business rules
    - 📂 `ports/`: Interface contracts for infrastructure
    - 📂 `services/`: Pure domain logic and business operations
    - 📂 `value-objects/`: Immutable domain concepts
  - 📂 `infrastructure/`: Technical implementations and adapters
    - 📂 `persistence/`: Database connectivity and ORM mappings
    - 📂 `adapters/`: External API integrations
      - 📂 `github/`: GitHub API client and transformers
      - 📂 `obsidian/`: Obsidian community data handlers
  - 📂 `interfaces/`: User interaction layers
    - 📂 `backend/`: Web UI server-side components
    - 📂 `cli/`: Command-line interface definitions
    - 📂 `server/`: API and service endpoints
  - 📂 `shared/`: Cross-cutting concerns and common types
  - 📂 `ui/`: Presentation layer components
    - 📂 `components/`: Reusable UI building blocks
    - 📂 `theme/`: Visual styling system
  - 📜 `index.ts`: CLI application entry point
  - 📜 `main.tsx`: Web application entry point
- 📜 `index.html`: HTML entry point for web application
- 📦 `test/`: Test suites and fixtures

## ⚙️ Configuration

LogoScripta uses a configuration file for managing settings. Create one using:

```sh
pnpm run dev config init
```

Example configuration:

```json
{
  "github": {
    "token": "<your-token>",
  },
  "paths": {
    "db": "./data/sqlite.db",
    "github": "./data/github",
    "obsidian": "./data/obsidian"
  },
  "logging": {
    "level": "info"
  }
}
```

## 🚀 Quick Start

### Installation

```sh
pnpm add -g logoscripta
```

### Basic Usage

1. Clone and install dependencies:

```sh
git clone https://github.com/mugencraft/logoscripta.git
cd logoscripta
pnpm install
```

2. Initialize configuration:

```sh
pnpm run dev config init
pnpm run dev config show -v

# Push database schema to database
pnpx drizzle-kit push
```

3. Start collecting data:

```sh
# Fetch GitHub repositories metadata from a source,
# generates snapshots and changelogs:
# data/github/repos/o/owner_repo-name/changelog.json
# data/github/repos/o/owner_repo-name/2024-01-01.json
# data/github/repos/o/owner_repo-name/2024-01-02.json
pnpm run dev github metadata -r owner/repo-name
pnpm run dev github metadata --source my-list.csv

# Validate and Sync GitHub repositories snapshots to DB
pnpm run dev github list validate
pnpm run dev github list sync

# Fetch and process all Obsidian community files
# generate some files like:
# data/obsidian/community-plugins/changelog.json
# data/obsidian/community-plugins/2024-01-01.json
# data/obsidian/community-plugins/2024-01-02.json
# data/github/repos/o/owner_repo-name/2024-01-01.json
# data/github/repos/o/owner_repo-name/2024-01-02.json
pnpm run dev obsidian releases fetch

# Optional: Fetch with specific options
pnpm run dev obsidian releases fetch --skip-github --force

# View history of changes
pnpm run dev obsidian releases history --type plugins
# Get removal history
pnpm run dev obsidian releases history --type plugins --changes added,removed
# Check changes since a specific date
pnpm run dev obsidian releases history --type themes --from 2024-01-01
```

4. Launch the the application:

In separate terminal windows:

```sh
# Start the backend server
pnpm run server

# Start the frontend development server
pnpm run dev:vite
```

## 🤝 Contributing

LogoScripta welcomes contributors at all skill levels, especially those beginning their coding journey.

## 📋 Code Standards

Please follow our [CODING_STANDARDS.md](./CODING_STANDARDS.md) guidelines:

- Use TypeScript for type safety
- Follow SOLID principles
- Include tests for new features
- Document public APIs and complex logic

## 📚 References

Our architecture draws inspiration from and extends several established patterns:

- [Domain-Driven Hexagon][domain-driven-hexagon]: The foundational architectural approach we've adapted.

### Our Architectural Adaptations

- **Type-Safe Data Flow**: End-to-end type safety from database schema (Drizzle) through API layer (tRPC) to UI components.

- **Domain Invariants**: Enforced through a combination of Drizzle schema definitions and Zod validators, eliminating the need for separate validation layers.

- **Services with Integrated Queries**: Unlike traditional DDD approaches that separate queries and commands completely, we pragmatically integrate them within services where appropriate for simplicity.

- **Simplified Architecture**: We've intentionally omitted certain elements commonly found in complex DDD implementations:
  - No explicit DTO objects - we use inferred types from our ORM schemas
  - No event-driven architecture - we use direct service calls for most operations
  - No separate use case layer - application commands fulfill this role

- **Ports & Adapters**: Clean separation of domain logic from technical implementations through explicit port interfaces.

These adaptations make our architecture more approachable while maintaining the core benefits of domain-driven design.

## 📄 License

MIT License - see LICENSE file for details

## 💪 Support

- GitHub Issues: Report bugs and feature requests

[typescript]: https://www.typescriptlang.org/
[domain-driven-hexagon]: https://github.com/Sairyss/domain-driven-hexagon
[drizzle]: https://orm.drizzle.team/
[zod]: https://zod.dev/
[trpc]: https://trpc.io/
[react]: https://react.dev/
[tanstack]: https://tanstack.com/
[tanstack-router]: https://tanstack.com/router/
[tanstack-query]: https://tanstack.com/query/
[tanstack-table]: https://tanstack.com/table/
[tanstack-form]: https://tanstack.com/form/
[tanstack-ranger]: https://tanstack.com/ranger/
[obsidian]:https://obsidian.md/
