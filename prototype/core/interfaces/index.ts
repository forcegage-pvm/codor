/**
 * Core Plugin Interfaces
 *
 * These interfaces define the contracts that all plugins must implement.
 * The engine depends on these interfaces, not on concrete implementations (DIP).
 */

export * from "./IExecutor";
export * from "./IFailureAnalyzer";
export * from "./IReporter";
export * from "./ITechnicalDebtDetector";
export * from "./IValidator";
