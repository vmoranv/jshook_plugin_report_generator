/**
 * Report Generator Plugin - Automated CTF/security test reports
 */

import { createExtension } from '@jshookmcp/extension-sdk/plugin';

export default createExtension('jshook-plugin-report-generator', '0.1.0')
  .description('Generate CTF and security test reports in markdown/pdf/json')
  .compatibleCore('>=0.2.0')
  .profile('workflow');
