# Coding Standards for LLM and humans

## SOLID fundamentals

Single Responsibility: functions/classes do one thing well
Open/Closed: extend behavior without modifying existing code
Liskov Substitution: subtypes must be substitutable for base types
Interface Segregation: clients shouldn't depend on unused methods
Dependency Inversion: depend on abstractions, not concrete implementations

## Design principles

DRY (Don't Repeat Yourself)
YAGNI (You Aren't Gonna Need It) - avoid premature optimization
Command Query Separation: separate state-changing operations from queries
Code by Actor: organize by who performs the action
Encapsulate varying elements
Program against interfaces/abstractions
Composition over inheritance
Minimize cyclomatic complexity
Avoid nullable/boolean parameters

## Code structure

Small, focused files, methods, and classes
Pure functions for logic and transformations
Immutable interfaces for data/type definitions
Classes only for state management and side effects

## Paradigms

Apply functional, object-oriented, or structured paradigms based on the specific need:

- Functional: for data transformations and business logic
- Object Oriented: for state management and encapsulation
- Structured: for procedural flows

Consider testability, maintainability, and future extensibility without over-engineering.

## Typescript Specific

- do not use `forEach` to loops arrays, use `for` instead
