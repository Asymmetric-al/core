/**
 * MemoryCuration is a declared Eve specialist, so its filesystem location becomes
 * the model-visible delegation tool name. Runtime policy is centralized in
 * the catalog factory to keep model, budget, and eval configuration aligned.
 */
import { createEveSpecialistAgent } from "../../lib/specialist-agent";

export default createEveSpecialistAgent("memory-curation");
