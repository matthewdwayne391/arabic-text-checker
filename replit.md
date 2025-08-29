# Overview

This is an Arabic Language Grammar Checker application that provides real-time grammar and spelling correction for Arabic text. The system integrates LanguageTool (self-hosted) with a clean web interface, allowing users to input Arabic text and receive detailed grammar suggestions with the ability to apply corrections directly.

The application is designed to run entirely within Replit, with no external dependencies, making it self-contained and easy to deploy.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Single Page Application (SPA)**: Built with vanilla HTML5, CSS3, and JavaScript
- **RTL Support**: Fully optimized for right-to-left Arabic text display
- **Responsive Design**: Modern CSS with flexbox and grid layouts for cross-device compatibility
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with interactive features
- **Component-based Structure**: Modular JavaScript with clear separation of concerns (DOM manipulation, event handling, API communication)

## Backend Architecture
- **Node.js with Express 5**: RESTful API server serving both static files and API endpoints
- **Microservices Pattern**: Express server acts as a proxy/gateway to the LanguageTool Java service
- **Process Management**: Uses child processes to manage the LanguageTool Java server lifecycle
- **Graceful Error Handling**: Comprehensive error handling with user-friendly Arabic error messages
- **Health Monitoring**: Built-in health check endpoints and service readiness detection

## Data Flow Architecture
- **Stateless Design**: No database required - all processing is request/response based
- **Text Processing Pipeline**: Input validation → LanguageTool analysis → Response formatting → Client rendering
- **Memory Management**: Large text handling with configurable limits (20,000 characters, 50MB request size)

## Deployment Architecture
- **Self-Contained Deployment**: All dependencies managed within the repository
- **Automated Setup**: Post-install scripts handle LanguageTool server installation
- **Multi-Process Coordination**: Concurrent execution of Java and Node.js services with dependency management
- **Environment Configuration**: Flexible port and URL configuration for different deployment scenarios

## Security Considerations
- **Input Validation**: Server-side text validation and sanitization
- **CORS Configuration**: Controlled cross-origin access for the LanguageTool service
- **Request Size Limits**: Protection against large payload attacks
- **No Authentication Required**: Designed as a public utility tool

# External Dependencies

## Core Runtime Dependencies
- **Node.js 18+**: JavaScript runtime environment
- **OpenJDK 17**: Java runtime for LanguageTool server execution
- **Express 5.1.0**: Web application framework for API and static file serving
- **node-fetch 3.3.2**: HTTP client for internal service communication

## Development and Build Tools
- **concurrently 9.2.1**: Parallel process execution for running multiple services
- **wait-on 8.0.4**: Service readiness detection and dependency coordination

## External Services
- **LanguageTool Server**: Self-hosted grammar checking engine
  - Downloaded automatically from GitHub releases
  - Runs as standalone Java application on port 8010
  - Provides REST API for grammar analysis
  - Supports Arabic language processing

## System Dependencies (via replit.nix)
- **curl**: HTTP client for downloading LanguageTool
- **unzip**: Archive extraction utility
- **Java Development Kit**: Required for LanguageTool execution

## CDN Dependencies
- **Font Awesome 6.4.0**: Icon library for UI enhancement
- **System Fonts**: Segoe UI, Tahoma, Arial fallback chain for Arabic text rendering

## API Integrations
- **GitHub Releases API**: Automated fetching of latest LanguageTool versions
- **LanguageTool REST API**: Grammar checking service communication via HTTP POST to `/v2/check` endpoint