# Contributing to LogoScripta

Welcome to LogoScripta! Before contributing, please read our [README.md](./README.md) to understand the project's goals, architecture, and key features.

## Development Prerequisites

Please ensure you have the required environment as specified in the package.json:

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Getting Started

1. Fork and clone the repository
2. Install dependencies with `pnpm install`
3. Follow the "[Quick Start](./README.md#-quick-start)" section in our README for initial setup

## Development Process

1. Create a new branch for your feature:

```sh
git checkout -b feature/your-feature-name
```

2. Make your changes following our [CODING_STANDARDS.md](./CODING_STANDARDS.md)

3. Ensure quality:

```sh
pnpm run lint
pnpm run lint:fix
pnpm run test
```

1. Commit using conventional commit messages

2. Push and create a pull request

## Making Contributions

Refer to the "[Contributing](./README.md#-contributing)" section in our README for detailed guidance on adding:

- New data sources
- Storage backends
- Visualizations

The README's [architecture](./README.md#️-architecture) section provides a clear map of where different types of code should be placed.

## Code Review

Pull requests are reviewed for:

- Adherence to coding standards
- Documentation quality
- Test coverage
- Performance considerations
- Educational value

## Documentation

Since LogoScripta serves as a learning platform, good documentation is essential. When contributing, please:

- Document your code with clear comments explaining the logic
- Update relevant documentation if you modify existing features
- Include usage examples for new functionality
- Ensure your code can serve as a learning resource

## Getting Help

- Open an issue for bugs or feature proposals
- Ask questions in pull requests
- Reference our documentation
- Join our community discussions

Remember, LogoScripta welcomes contributors at all skill levels. Don't hesitate to ask for guidance during the contribution process.

## License

By contributing to LogoScripta, you agree that your contributions will be licensed under the MIT License.
