# LogoScripta 🚀

- Clean Code Hexagon Domain Driven Onion Architecture
- ETL foundation with type-safe data processing
- Content Management and Tagging Systems
- CLI application
- API server Controller
- React backend
- Database ORM integration
- Testing infrastructure

LogoScripta is a modern TypeScript-based **full-stack** platform that combines an **ETL toolkit** with an *educational framework* for developers at all skill levels, implementing a **content management system**, **advanced tagging capabilities**, a **GitHub** repository *analysis tool*, and **[Obsidian][obsidian]** *Plugins* and *Theme* lists of repositories.

Built with **domain-driven design** principles and *[clean hexagonal architecture][domain-driven-hexagon]*, LogoScripta demonstrates how to create maintainable, scalable TypeScript applications while solving real-world data challenges.
By combining [Drizzle ORM][drizzle], [Zod][zod], [tRPC][trpc], [React][react], [Tanstack][tanstack] and [TypeScript][typescript] in a cohesive application, LogoScripta bridges theory and practice in software development.

## #️⃣ Table of Content

- [LogoScripta 🚀](#logoscripta-)
  - [#️⃣ Table of Content](#️⃣-table-of-content)
  - [🎯 Key Features](#-key-features)
    - [For Content Managers and Researchers](#for-content-managers-and-researchers)
    - [For Data Scientists and ML Engineers](#for-data-scientists-and-ml-engineers)
    - [For Github and Obsidian Enthusiasts](#for-github-and-obsidian-enthusiasts)
    - [For Data Professionals](#for-data-professionals)
    - [For Educators and Students](#for-educators-and-students)
    - [For Full-stack Developers](#for-full-stack-developers)
    - [For TypeScript Developers](#for-typescript-developers)
    - [For TanStack Developers](#for-tanstack-developers)
  - [�️ Architecture](#️-architecture)
  - [📁 Project Structure](#-project-structure)
  - [📁 Project Structure](#-project-structure-1)
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

### For Content Managers and Researchers

Create collections of items and add tags from a tag system.

- 📚 **Content Management System**:
  - **Collections** management with hierarchical organization and tagging
  - **Content Items** with metadata, relationships, and full-text search
  - **Import/Export** workflows with validation and progress tracking
  - **Analytics Dashboard** with statistics and content type breakdowns

- 🏷️ **Advanced Tagging System**:
  - **Hierarchical tagging** (Systems → Groups → Categories → Tags)
  - **Tag validation** and relationship management

### For Data Scientists and ML Engineers

Tag images for Lora Training.

- 🤖 **LoRA Training Support**:
  - **Caption management** for image datasets

- 📊 **Data Analytics**:
  - **Content distribution analysis** with visual charts
  - **Tag frequency analysis** and relationship mapping
  - **Export capabilities** for external analysis tools
  - **Statistical insights** on content and tagging patterns

### For Github and Obsidian Enthusiasts

Track and analyze the entire Obsidian plugin and theme ecosystem. Monitor trends, discover new projects. Maintain your own curated lists of repositories with rich metadata and visualization.

- 🔌 **Data Collection and Integration**:
  - **GitHub** and **Obsidian** API integration with type-safe adapters
  - **Repositories** analysis with topic extraction and metadata
  - **Obsidian plugins and themes** tracking with community statistics
  - **Real-time synchronization** with upstream data sources

### For Data Professionals

- 🔄 **ETL Pipeline Architecture**:
  - **Change tracking** with snapshot-based versioning
  - **Data validation** with comprehensive error reporting
  - **Batch processing** with progress monitoring
  - **Data transformation** with customizable mapping rules

- 📈 **Analytics and Visualization**:
  - **Interactive dashboards** with real-time data updates
  - **Export capabilities** (CSV, JSON) for external analysis
  - **Filtering and search** across all data dimensions
  - **Historical trend analysis** with change detection

### For Educators and Students

- 🎓 **Learning-Focused Architecture**:
  - **Domain-Driven Design** implementation with clear boundaries
  - **Hexagonal Architecture** showcasing ports and adapters
  - **SOLID principles** demonstrated throughout the codebase
  - **Clean Code practices** with comprehensive documentation

- 📖 **Educational Resources**:
  - **Architectural examples** for layers and patterns
  - **Code organization** following industry best practices
  - **Testing strategies** with unit and integration examples
  - **Development workflows** from CLI to web interfaces

### For Full-stack Developers

- 🔧 **Modern Development Stack**:
  - **Type-safe** end-to-end development with TypeScript
  - **tRPC** for seamless client-server communication
  - **React** with TanStack Router for modern UI development
  - **Drizzle ORM** for type-safe database operations

### For TypeScript Developers

A full type-safe implementation from Drizzle DB schema to tRPC APIs to React UI.

- 🔍 **Code Quality Tools**:
  - **Biome** for linting and formatting
  - **Strict TypeScript** configuration
  - **Type-driven development** with schema validation
  - **Dependency analysis** with architectural boundaries

### For TanStack Developers

- ⚡ **[TanStack][tanstack] Ecosystem Integration**:
  - [TanStack Router][tanstack-router] with type-safe routing and nested layouts
  - [TanStack Table][tanstack-table] with advanced filtering and sorting
  - [TanStack Form][tanstack-form] with validation and type safety
  - [TanStack Query][tanstack-query] (via tRPC) for server state management
  - [TanStack Ranger][tanstack-ranger] for ranger input ui

## �️ Architecture

LogoScripta follows **Clean Hexagonal Architecture** principles with **Domain-Driven Design**, organized in five distinct layers:

1. **Core Layer**: Framework-agnostic utilities and foundational abstractions:
   - File system operations and path management
   - Serialization and data transformation utilities
   - Change tracking and versioning mechanisms
   - Logging and error handling infrastructure
   - Shared utilities and helpers

2. **Domain Layer**: Pure business logic and domain rules:
   - Entity definitions (Content, Tagging, GitHub models)
   - Domain services for business operations
   - Port definitions for external dependencies
   - Configuration management

3. **Infrastructure Layer**: External integrations and data persistence:
   - Database layer with ORM mappings
   - Data Repository implementations
   - Adapter implementations for external services (GitHub, Obsidian)
   - Error handling for external systems

4. **Interfaces Layer**: User-facing interfaces that consume the application:
   - CLI commands and processors
   - tRPC API endpoints and handlers
   - React-based web UI and components
   - Data visualization and interaction

5. **UI Layer**:
   - Shadcn core
   - Table
   - Forms
   - Actions
   - Import/Export
   - Layout
   - Metadata
   - Annotation
   - Dashboard
   - Content
   - Tagging

## 📁 Project Structure

## 📁 Project Structure

- 📦 `src/`: Source code
  - 📂 `core/`: Domain-agnostic utilities and infrastructure
    - 📂 `changes/`: Version control and change tracking mechanisms
    - 📂 `fs/`: File system abstractions and operations
    - 📂 `logging/`: Structured logging facilities
    - 📂 `serialization/`: Data format conversions (CSV, JSON)
    - 📂 `utils/`: Shared helper functions (array, format, object, parse, queue)
  - 📂 `domain/`: Core business logic and rules
    - 📂 `config/`: Application configuration management
    - 📂 `models/`: Entity definitions and business rules
    - 📂 `ports/`: Interface contracts for infrastructure
    - 📂 `services/`: Pure domain logic and business operations
    - 📂 `validation/`: Zod validators for entities, routes and forms
  - 📂 `infrastructure/`: Technical implementations and adapters
    - 📂 `adapters/`: External API integrations
    - 📂 `factories/`: Service builders
    - 📂 `persistence/`: Database connectivity and ORM mappings
  - 📂 `interfaces/`: User interaction layers
    - 📂 `backend/`: Web UI server-side components
      - 📂 `actions/`: Buttons and Forms
      - 📂 `layouts/`: Base Layouts
      - 📂 `routes/`: File-based routing with TanStack Route
      - 📂 `tables/`: Table configuration and components
      - 📂 `views/`: Page components and layouts
      - 📜 `navigation.tsx/`: Sidebar navigation links
    - 📂 `cli/`: Command-line interface definitions
    - 📂 `server/`: API and service endpoints
    - 📜 `server-client.tsx/`: tRPC configuration and client setup
  - 📂 `shared/`: Cross-cutting concerns and common types
    - 📂 `github/`: Shared GitHub types and utilities
    - 📂 `obsidian/`: Shared Obsidian types and utilities
    - 📂 `schema/`: Database schema definitions
  - 📂 `ui/`: Presentation layer components
    - 📂 `components/`: Reusable UI building blocks
      - 📂 `actions/`: Action system and button
      - 📂 `annotation/`: Annotation and markup
      - 📂 `content/`: Content management UI
      - 📂 `core/`: Base UI (shadcn/ui)
      - 📂 `extra/`: Extended shadcn components
      - 📂 `forms/`: Form framework built on TanStack Form
      - 📂 `import-export/`: Import/export workflows
      - 📂 `layout/`: Layout and navigation
      - 📂 `metadata/`: Metadata display
      - 📂 `table/`: Advanced data table
      - 📂 `tagging/`: Tagging system UI
    - 📂 `hooks/`: Custom React hooks
    - 📂 `theme/`: Visual styling system
  - 📜 `index.ts`: CLI application entry point
  - 📜 `main.tsx`: Web application entry point
- 📜 `index.html`: HTML entry point for web application
- 📂 `scripts/`: Utility scripts for data processing and automation
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
