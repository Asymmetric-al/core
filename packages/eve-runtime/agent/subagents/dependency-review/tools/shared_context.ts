/**
 * This wrapper binds the writer identity to the filesystem-declared
 * specialist. The model cannot choose a different writer, tenant, or run.
 */
import { createEveSharedContextTool } from "../../../../src/specialists/shared-context-tool";

export default createEveSharedContextTool("dependency-review");
