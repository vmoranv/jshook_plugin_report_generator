/**
 * Report Generator Plugin - Automated CTF/security test reports
 */

import { createExtension } from '@jshookmcp/extension-sdk/plugin';
import { generateReportTool } from './generate-report.js';

export default createExtension('jshook-plugin-report-generator', '0.1.0')
  .description('Generate CTF and security test reports in markdown/pdf/json')
  .compatibleCore('>=0.2.0')
  .profile('workflow')
  .tool(
    generateReportTool.name,
    generateReportTool.description,
    generateReportTool.schema.properties as Record<string, object>,
    generateReportTool.handler,
    ['workflow'],
  );
