# Dyad Documentation

This directory contains comprehensive documentation for the Dyad project, including architecture designs, technical guides, and feature specifications.

## 📚 Table of Contents

### 🏗️ Architecture & Design

#### Core Architecture
- **[Core Encapsulation Design Study](./CORE_ENCAPSULATION_DESIGN.md)** ⭐ NEW
  - Comprehensive evaluation of encapsulating Dyad's core for desktop and web apps
  - Architectural changes, communication patterns, web app independence
  - Effort estimation (5-7 weeks), viability analysis, ROI projection
  - **Quick Read**: [Executive Summary](./CORE_ENCAPSULATION_SUMMARY.md)
  - **Visual Guide**: [Architecture Diagrams](./CORE_ENCAPSULATION_DIAGRAMS.md)

- **[HTTP REST API Architecture](./HTTP_REST_API_ARCHITECTURE.md)**
  - Design and implementation plan for HTTP REST API
  - Technology stack, endpoints, authentication
  - Integration with service layer, backward compatibility

- **[Web Application Feasibility Study](./WEB_APP_FEASIBILITY.md)**
  - Feasibility analysis for web version of Dyad
  - Deployment options (PWA, Cloud, Hybrid)
  - Technical challenges and solutions
  - Implementation roadmap

- **[Production Ready Infrastructure](./PRODUCTION_READY_INFRASTRUCTURE.md)**
  - Code quality monitoring, service layer, type system
  - OpenAPI documentation, refactoring guidelines
  - Best practices for maintainable code

- **[Architecture Overview](./architecture.md)**
  - High-level system architecture
  - Component interactions and data flow

#### Architecture Decision Records (ADRs)
Located in `./adr/` directory:
- [ADR-001: Centralized Type System](./adr/ADR-001-centralized-types.md)
- [ADR-002: Service Layer Architecture](./adr/ADR-002-service-layer.md)
- [ADR-003: OpenAPI Documentation](./adr/ADR-003-openapi-docs.md)
- [ADR-004: Autonomous Refactoring](./adr/ADR-004-autonomous-refactoring.md)

### 🌐 API Documentation

- **[HTTP API Reference](./HTTP_API.md)**
  - Complete API endpoint documentation
  - Request/response examples
  - Authentication and error handling

- **[HTTP REST API Architecture](./HTTP_REST_API_ARCHITECTURE.md)**
  - Detailed API design and implementation
  - Service layer integration
  - Performance considerations

### 🎨 Features & Guides

- **[CSS Selector Feature](./CSS_SELECTOR_FEATURE.md)**
  - CSS selector implementation and usage
  - Component targeting in generated apps

- **[External Preview Feature](./EXTERNAL_PREVIEW_FEATURE.md)**
  - External preview functionality
  - Configuration and deployment

- **[Package Manager and Preview Settings](./PACKAGE_MANAGER_AND_PREVIEW_SETTINGS.md)**
  - Package manager selection (npm, yarn, pnpm, bun)
  - Preview server configuration
  - Per-app settings

- **[VS Code Extension Validation](./VSCODE_EXTENSION_VALIDATION.md)**
  - VS Code extension development
  - Integration with Dyad Desktop
  - Testing and validation

### 📖 Migration & Maintenance

- **[Migration Guide](./MIGRATION_GUIDE.md)**
  - Version migration instructions
  - Breaking changes and upgrade paths
  - Database schema changes

- **[Refactoring Summary](./REFACTORING_SUMMARY.md)**
  - Code refactoring guidelines
  - Patterns and best practices
  - Technical debt management

- **[Stability & Scalability Opportunities](./STABILITY_SCALABILITY_OPPORTUNITIES.md)**
  - System stability improvements
  - Scalability considerations
  - Performance optimization

### 📝 Development Guidelines

Located in `./guidelines/` directory:
- Coding standards
- Testing practices
- Documentation requirements

### 🔧 Templates

- **[Document Templates](./templates.md)**
  - Templates for architecture documents
  - ADR templates
  - Feature specification templates

---

## 🎯 Quick Start Guides

### For New Contributors

1. Start with [Architecture Overview](./architecture.md)
2. Read [Service Layer ADR](./adr/ADR-002-service-layer.md)
3. Review [Production Ready Infrastructure](./PRODUCTION_READY_INFRASTRUCTURE.md)
4. Check [HTTP API Reference](./HTTP_API.md) for API usage

### For Core Architecture Work

1. **[Core Encapsulation Design Study](./CORE_ENCAPSULATION_DESIGN.md)** - Full analysis
2. **[Core Encapsulation Summary](./CORE_ENCAPSULATION_SUMMARY.md)** - Quick reference
3. **[Core Encapsulation Diagrams](./CORE_ENCAPSULATION_DIAGRAMS.md)** - Visual guide
4. [HTTP REST API Architecture](./HTTP_REST_API_ARCHITECTURE.md)
5. [ADR-002: Service Layer](./adr/ADR-002-service-layer.md)

### For Web App Development

1. [Web Application Feasibility Study](./WEB_APP_FEASIBILITY.md)
2. [HTTP API Reference](./HTTP_API.md)
3. [Core Encapsulation Design](./CORE_ENCAPSULATION_DESIGN.md) - Section 4: Web App Independence

### For API Integration

1. [HTTP API Reference](./HTTP_API.md)
2. [HTTP REST API Architecture](./HTTP_REST_API_ARCHITECTURE.md)
3. [Core Encapsulation Design](./CORE_ENCAPSULATION_DESIGN.md) - Section 3: Communication Patterns

---

## 📊 Document Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| Core Encapsulation Design | ✅ Complete | Jan 2025 |
| Core Encapsulation Summary | ✅ Complete | Jan 2025 |
| Core Encapsulation Diagrams | ✅ Complete | Jan 2025 |
| HTTP REST API Architecture | ✅ Complete | Jan 2025 |
| HTTP API Reference | ✅ Complete | Jan 2025 |
| Web App Feasibility Study | ✅ Complete | Jan 2025 |
| Production Ready Infrastructure | ✅ Complete | Oct 2024 |
| ADR-001 through ADR-004 | ✅ Complete | Oct 2024 |

---

## 🔗 Related Documents

Outside this directory:
- [HTTP API Implementation Summary](../HTTP_API_IMPLEMENTATION.md)
- [Service Layer Implementation](../SERVICE_LAYER_IMPLEMENTATION.md)
- [Enhancement Implementation Summary](../ENHANCEMENT_IMPLEMENTATION_SUMMARY.md)
- [Quick Reference Guide](../QUICK_REFERENCE.md)

---

## 📝 Contributing to Documentation

When adding new documentation:

1. **Place in appropriate directory**
   - Architecture docs: `docs/`
   - ADRs: `docs/adr/`
   - Guidelines: `docs/guidelines/`

2. **Update this README**
   - Add link to new document
   - Include brief description
   - Update status table

3. **Follow templates**
   - Use [templates.md](./templates.md) for consistency
   - Include table of contents for long documents
   - Add diagrams where helpful

4. **Link related documents**
   - Cross-reference related docs
   - Maintain bidirectional links
   - Update index files

---

## 🎨 Document Conventions

### Emoji Guide
- ⭐ = New or featured document
- ✅ = Complete and up-to-date
- 🔄 = In progress or needs update
- 🏗️ = Architecture/design
- 🌐 = API/web related
- 🎨 = Features/UI
- 📖 = Guides/tutorials
- 📝 = Reference/specifications

### Markdown Standards
- Use ATX-style headers (`#`, `##`, etc.)
- Include table of contents for documents >100 lines
- Use code blocks with language specification
- Include diagrams in ASCII art or reference image files

---

## 🆘 Getting Help

If you can't find what you're looking for:

1. Check the [Quick Reference Guide](../QUICK_REFERENCE.md)
2. Search this README for keywords
3. Browse the [ADRs](./adr/) for architectural decisions
4. Review [Architecture Overview](./architecture.md)

For questions or suggestions about documentation, please open an issue.

---

*This documentation is maintained by the Dyad development team.*  
*Last updated: January 2025*
