# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
从现在开始，请用中文回答。包括代码注释、解释说明、对话内容等全部使用中文。

## Project Overview

SilverMoon is an Electron-based desktop chat application built with Vue.js 3, TypeScript, and Naive UI. It features a modern, customizable interface with theme support and internationalization.

## Development Commands

```bash
# Start development server
npm run start

# Package application for current platform
npm run package

# Create distributables for all platforms
npm run make

# Publish application
npm run publish
```

## Architecture

### Process Architecture

- **Main Process** (`main/`): Electron main process handling window management, IPC, and system integration
- **Renderer Process** (`renderer/`): Vue.js application handling UI and user interactions
- **Common** (`common/`): Shared types, constants, and utilities between main and renderer

### Key Directories

- `main/windows/`: Window creation and management logic
- `main/service/`: Main process services (logging, theme management)
- `renderer/components/`: Vue components using Naive UI library
- `renderer/hooks/`: Vue composition functions
- `locales/`: i18n translation files (zh/en)

### IPC Communication

The application uses Electron IPC for main-renderer communication. Key events are defined in `common/constants.ts`:

- Window controls: `CLOSE_WINDOW`, `MINIMIZE_WINDOW`, `MAXIMIZE_WINDOW`
- Theme management: `SET_THEME_MODE`, `GET_THEME_MODE`, `IS_DARK_THEME`
- Logging: `LOG_DEBUG`, `LOG_INFO`, `LOG_WARN`, `LOG_ERROR`

### Path Aliases

TypeScript path aliases configured in `tsconfig.json`:

- `@common/*` → `common/*`
- `@renderer/*` → `renderer/*`
- `@main/*` → `main/*`
- `@locales/*` → `locales/*`

### Build Configuration

- **Vite configs**: Separate configs for main (`vite.main.config.ts`), renderer (`vite.renderer.config.ts`), and preload (`vite.preload.config.ts`)
- **Electron Forge**: Configured with security fuses and multiple platform makers
- **TypeScript**: Project references with strict type checking

### State Management

- Uses Pinia for Vue state management
- Theme state managed globally with persistence
- No centralized store for application data (currently)

### UI Framework

- **Naive UI**: Primary component library
- **Tailwind CSS**: Utility classes for custom styling
- **Material Symbols**: Icon system
- **Custom CSS variables**: For theming support

### Security Features

- Content Security Policy headers configured
- Electron fuses enabled for production security
- ASAR integrity validation
- Cookie encryption enabled

## Current Development Status

The application is in active development with recent features including:

- Theme system with dark/light mode switching
- Window controls and custom title bar
- Logging service implementation
- Basic layout structure with sidebar and main content area

## Missing Components

- **Testing**: No test framework configured
- **Documentation**: No README or API documentation
- **Data persistence**: No database or storage layer
- **Chat functionality**: Core chat features not yet implemented
