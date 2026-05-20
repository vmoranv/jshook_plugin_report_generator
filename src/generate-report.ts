/**
 * Generate CTF/security test report tool
 */

import {
  errorResponse,
  jsonResponse,
  type ExtensionToolDefinition,
} from '@jshookmcp/extension-sdk/plugin';

export const generateReportTool: ExtensionToolDefinition = {
  name: 'report_generate',
  description: 'Generate a CTF or security test report',
  schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Report title',
      },
      targets: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of targets tested',
      },
      findings: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'info'] },
            description: { type: 'string' },
            evidence: { type: 'string' },
            recommendation: { type: 'string' },
          },
        },
        description: 'List of findings',
      },
      format: {
        type: 'string',
        enum: ['markdown', 'json', 'html'],
        description: 'Output format',
        default: 'markdown',
      },
      outputPath: {
        type: 'string',
        description: 'Output file path',
      },
    },
    required: ['title', 'targets', 'findings'],
  },
  handler: async (args, _ctx) => {
    try {
      const title = args.title as string;
      const targets = args.targets as string[];
      const findings = args.findings as Array<{
        title: string;
        severity?: string;
        description?: string;
        evidence?: string;
        recommendation?: string;
      }>;
      const format = (args.format as string) || 'markdown';
      const outputPath = args.outputPath as string | undefined;

      if (!title || !targets || !findings) {
        return errorResponse('report_generate', 'Missing required arguments: title, targets, findings');
      }

      let content: string;

      if (format === 'json') {
        content = JSON.stringify(
          {
            title,
            generatedAt: new Date().toISOString(),
            targets,
            findings,
            summary: {
              total: findings.length,
              critical: findings.filter((f) => f.severity === 'critical').length,
              high: findings.filter((f) => f.severity === 'high').length,
              medium: findings.filter((f) => f.severity === 'medium').length,
              low: findings.filter((f) => f.severity === 'low').length,
              info: findings.filter((f) => f.severity === 'info').length,
            },
          },
          null,
          2,
        );
      } else if (format === 'html') {
        content = generateHtmlReport(title, targets, findings);
      } else {
        content = generateMarkdownReport(title, targets, findings);
      }

      return jsonResponse({
        success: true,
        format,
        length: content.length,
        preview: content.slice(0, 500),
        ...(outputPath ? { savedTo: outputPath } : {}),
      });
    } catch (error) {
      return errorResponse('report_generate', error);
    }
  },
};

function generateMarkdownReport(
  title: string,
  targets: string[],
  findings: Array<{
    title: string;
    severity?: string;
    description?: string;
    evidence?: string;
    recommendation?: string;
  }>,
): string {
  const lines: string[] = [];

  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`**Generated**: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Targets');
  lines.push('');
  for (const target of targets) {
    lines.push(`- ${target}`);
  }
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Severity | Count |');
  lines.push('|----------|-------|');
  lines.push(`| Critical | ${findings.filter((f) => f.severity === 'critical').length} |`);
  lines.push(`| High | ${findings.filter((f) => f.severity === 'high').length} |`);
  lines.push(`| Medium | ${findings.filter((f) => f.severity === 'medium').length} |`);
  lines.push(`| Low | ${findings.filter((f) => f.severity === 'low').length} |`);
  lines.push(`| Info | ${findings.filter((f) => f.severity === 'info').length} |`);
  lines.push('');
  lines.push('## Findings');
  lines.push('');

  for (const [i, finding] of findings.entries()) {
    lines.push(`### ${i + 1}. ${finding.title}`);
    lines.push('');
    if (finding.severity) {
      lines.push(`**Severity**: ${finding.severity.toUpperCase()}`);
      lines.push('');
    }
    if (finding.description) {
      lines.push(`**Description**: ${finding.description}`);
      lines.push('');
    }
    if (finding.evidence) {
      lines.push('**Evidence**:\n```\n');
      lines.push(finding.evidence);
      lines.push('```');
      lines.push('');
    }
    if (finding.recommendation) {
      lines.push(`**Recommendation**: ${finding.recommendation}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

function generateHtmlReport(
  title: string,
  targets: string[],
  findings: Array<{
    title: string;
    severity?: string;
    description?: string;
    evidence?: string;
    recommendation?: string;
  }>,
): string {
  return `<!DOCTYPE html>
<html>
<head><title>${title}</title></head>
<body>
<h1>${title}</h1>
<p>Generated: ${new Date().toISOString()}</p>
<h2>Targets</h2>
<ul>${targets.map((t) => `<li>${t}</li>`).join('')}</ul>
<h2>Findings</h2>
${findings
  .map(
    (f) => `
<div>
<h3>${f.title}</h3>
<p><strong>Severity</strong>: ${f.severity?.toUpperCase() || ''}</p>
<p><strong>Description</strong>: ${f.description || ''}</p>
<pre>${f.evidence || ''}</pre>
<p><strong>Recommendation</strong>: ${f.recommendation || ''}</p>
</div>
`,
  )
  .join('')}
</body>
</html>`;
}
