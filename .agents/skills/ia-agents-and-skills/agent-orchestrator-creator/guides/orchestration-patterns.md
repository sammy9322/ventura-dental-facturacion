# Orchestration Patterns Guide

This guide describes proven patterns for organizing multiple AI agents.

## 1. Hierarchical (The Boss & Workers)
**Best for**: Implementation tasks with clear separation of concerns.

- **Orchestrator**: Breaks down the plan.
- **Workers**: Execute specific parts (Frontend, Backend, Tests).
- **Flow**: Top-down delegation.

## 2. Expert Panel (The Brain Trust)
**Best for**: Design, Planning, and Complex Problem Solving.

- **Moderator**: Keeps the discussion focused.
- **Experts**: Provide specialized viewpoints (Security, Perf, UX).
- **Flow**: Cyclic discussion until consensus.

## 3. Assembly Line (The Factory)
**Best for**: Sequential transformation of data or content.

- **Step 1 Agent**: Drafts content.
- **Step 2 Agent**: Reviews/Edits.
- **Step 3 Agent**: Formats/Publishes.
- **Flow**: Linear handoff (A -> B -> C).

## 4. Supervisor-Worker (The QA Loop)
**Best for**: High-reliability coding.

- **Worker**: Writes code.
- **Supervisor (QA)**: Reviews code and writes tests.
- **Flow**: Loop (Write -> Review -> Fix) until pass.

## Reference
- **Templates**: See `assets/templates/` for starting points.
- **Analysis**: Use `analyze_project.sh` to decide which pattern fits the current project stack.
