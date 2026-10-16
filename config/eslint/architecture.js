import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

function moduleLocation(file) {
  const normalized = file.replaceAll('\\', '/');
  const match = normalized.match(/\/src\/(app|features|shared|services|data|utils)\/(.*)/);
  if (!match) return normalized.includes('/server/') ? { layer: 'server' } : null;
  return { layer: match[1], feature: match[1] === 'features' ? match[2].split('/')[0] : null };
}

const allowed = {
  app: ['app', 'features', 'shared', 'services', 'data', 'utils'],
  features: ['features', 'shared', 'services', 'data', 'utils'],
  shared: ['shared', 'utils'],
  services: ['services', 'data', 'utils'],
  data: ['data', 'utils'],
  utils: ['utils'],
  server: ['server', 'data', 'utils'],
};

export default {
  rules: {
    'module-boundaries': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          missing:
            'Relative import "{{source}}" must resolve to an existing file and include its extension.',
          boundary:
            '{{from}} must not import {{to}}. Keep dependencies directed toward shared code and data.',
          feature:
            'Features must not import another feature directly. Compose features in app/ or extract truly shared code.',
        },
      },
      create(context) {
        const filename = context.filename;
        const from = moduleLocation(filename);
        function check(source) {
          if (!source || typeof source.value !== 'string' || !source.value.startsWith('.')) return;
          const target = path.resolve(path.dirname(filename), source.value);
          if (!existsSync(target) || !statSync(target).isFile()) {
            context.report({ node: source, messageId: 'missing', data: { source: source.value } });
            return;
          }
          const to = moduleLocation(target);
          if (!from || !to) return;
          if (!allowed[from.layer].includes(to.layer)) {
            context.report({
              node: source,
              messageId: 'boundary',
              data: { from: from.layer, to: to.layer },
            });
          } else if (
            from.layer === 'features' &&
            to.layer === 'features' &&
            from.feature !== to.feature
          ) {
            context.report({ node: source, messageId: 'feature' });
          }
        }
        return {
          ImportDeclaration: (node) => check(node.source),
          ExportNamedDeclaration: (node) => check(node.source),
          ExportAllDeclaration: (node) => check(node.source),
          ImportExpression: (node) => check(node.source),
        };
      },
    },
  },
};
