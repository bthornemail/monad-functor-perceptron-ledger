# Contributing to Geometric Consensus Protocol

Thank you for your interest in contributing to the Geometric Consensus Protocol! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Mathematical Contributions](#mathematical-contributions)
- [Performance Contributions](#performance-contributions)
- [Security Contributions](#security-contributions)

## 🤝 Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later
- npm 8 or later
- Git
- TypeScript knowledge
- Understanding of mathematical concepts (Hilbert spaces, graph theory, consensus algorithms)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/geometric-consensus.git
   cd geometric-consensus
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/geometric-consensus/geometric-consensus.git
   ```

## 🛠️ Development Setup

### Install Dependencies

```bash
npm install
```

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Build for production
npm run build:prod

# Generate documentation
npm run docs
```

### IDE Configuration

We recommend using VS Code with the following extensions:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- GitLens

## 📝 Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

1. **Bug Fixes**: Fix issues in existing code
2. **Feature Additions**: Add new functionality
3. **Performance Improvements**: Optimize existing code
4. **Documentation**: Improve or add documentation
5. **Tests**: Add or improve test coverage
6. **Mathematical Implementations**: Implement new mathematical structures
7. **Examples**: Add new examples or demos

### Branch Naming

Use descriptive branch names:
- `fix/issue-123-description`
- `feature/ipv6-encoding-improvements`
- `docs/api-documentation-update`
- `test/consensus-algorithm-coverage`

### Commit Messages

Follow the conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(consensus): add tetrahedron consensus type
fix(ipv6): correct segment encoding for large values
docs(api): update HilbertSpace documentation
test(utils): add performance benchmarks
```

## 🎯 Code Standards

### TypeScript Standards

- Use TypeScript strict mode
- Provide type annotations for all public APIs
- Use interfaces for object shapes
- Prefer `const` over `let` when possible
- Use meaningful variable and function names

### Code Style

- Follow ESLint configuration
- Use 2 spaces for indentation
- Use single quotes for strings
- Use semicolons
- Maximum line length: 100 characters

### File Organization

```
src/
├── core/           # Mathematical foundations
├── consensus/      # Consensus algorithms
├── encoding/       # IPv6 encoding
├── perceptron/     # Perceptron system
├── graph/          # Graph theory
├── utils/          # Utilities
├── examples/       # Examples and demos
└── test/           # Test files
```

### Naming Conventions

- **Files**: kebab-case (`geometric-consensus.ts`)
- **Classes**: PascalCase (`GeometricConsensus`)
- **Functions**: camelCase (`achieveConsensus`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_STEPS`)
- **Interfaces**: PascalCase with `I` prefix (`IHilbertSpace`)

## 🧪 Testing Requirements

### Test Coverage

- **Minimum coverage**: 90%
- **Required coverage**: 100% for new features
- **Critical paths**: Must have integration tests

### Test Types

1. **Unit Tests**: Test individual functions and classes
2. **Integration Tests**: Test component interactions
3. **Performance Tests**: Verify complexity requirements
4. **Mathematical Tests**: Verify mathematical correctness

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:performance

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Vectors

All test vectors from RFC XXXX must pass:
- IPv6 encoding tests (A.1, A.2, A.3)
- Consensus convergence tests (B.1, B.2, B.3)
- Partition detection tests (C.1, C.2)
- Mathematical structure tests (D.1, D.2, D.3)

## 📚 Documentation

### Code Documentation

- Use JSDoc for all public APIs
- Include parameter types and return types
- Provide usage examples
- Document mathematical formulas

Example:
```typescript
/**
 * Computes the inner product of two states in the Hilbert space.
 * 
 * @param stateA First state vector
 * @param stateB Second state vector
 * @returns Inner product value (0-1 range)
 * 
 * @example
 * ```typescript
 * const space = new HilbertSpace();
 * const product = space.innerProduct(stateA, stateB);
 * console.log(`Similarity: ${product}`);
 * ```
 */
innerProduct(stateA: State, stateB: State): number {
  // Implementation
}
```

### README Updates

- Update README.md for new features
- Add examples for new functionality
- Update installation instructions if needed

### API Documentation

- Generate TypeDoc documentation
- Keep examples up to date
- Document breaking changes

## 🔄 Pull Request Process

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes**:
   - Write code following our standards
   - Add tests for new functionality
   - Update documentation
   - Ensure all tests pass

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Performance tests added/updated
- [ ] All tests pass

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Test vectors pass
- [ ] Performance requirements met
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: At least one maintainer reviews the code
3. **Mathematical Review**: Mathematical changes require expert review
4. **Performance Review**: Performance changes require benchmarking

## 🐛 Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Ubuntu 20.04]
- Node.js version: [e.g. 18.17.0]
- Package version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of any alternative solutions.

**Additional context**
Add any other context or screenshots.
```

## 🧮 Mathematical Contributions

### Mathematical Standards

- All mathematical formulas must be verified
- Implementations must match mathematical specifications
- Performance must meet complexity requirements
- Test vectors must pass

### Mathematical Review Process

1. **Implementation Review**: Code review for correctness
2. **Mathematical Review**: Expert review of mathematical concepts
3. **Performance Review**: Verification of complexity requirements
4. **Test Vector Validation**: All RFC test vectors must pass

### Mathematical Documentation

- Include mathematical formulas in JSDoc
- Reference original papers and specifications
- Provide proof sketches for complex algorithms
- Document assumptions and limitations

## ⚡ Performance Contributions

### Performance Requirements

- **Consensus Steps**: O(1) - bounded by 14 steps
- **Betti Calculation**: O(v) - linear in vertices
- **Space Complexity**: O(n) - linear in network size
- **Memory Usage**: < 512MB per node

### Performance Testing

```bash
# Run performance benchmarks
npm run test:performance

# Profile memory usage
npm run test:memory

# Benchmark specific functions
npm run test:benchmark
```

### Performance Documentation

- Document complexity analysis
- Provide benchmark results
- Include memory usage profiles
- Document optimization techniques

## 🔒 Security Contributions

### Security Guidelines

- Follow secure coding practices
- Validate all inputs
- Use cryptographic libraries properly
- Document security considerations

### Security Review Process

1. **Code Review**: Security-focused code review
2. **Dependency Audit**: Check for vulnerable dependencies
3. **Penetration Testing**: Test for security vulnerabilities
4. **Cryptographic Review**: Expert review of cryptographic code

### Reporting Security Issues

For security issues, please email security@geometric-consensus.org instead of creating a public issue.

## 🏆 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation
- GitHub contributors page

## 📞 Getting Help

- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Email**: consensus-team@geometric-consensus.org

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Geometric Consensus Protocol! 🎉
