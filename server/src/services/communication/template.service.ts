import MessageTemplate, { IMessageTemplate } from '../../models/MessageTemplate';

const variablePattern = /{{\s*([A-Za-z][A-Za-z0-9]*)\s*}}/g;
export const resolveTemplate = (template: IMessageTemplate, variables: Record<string, unknown>) => {
  const missing = [...template.content.matchAll(variablePattern)].map((match) => match[1]).filter((key, index, keys) => keys.indexOf(key) === index && variables[key] === undefined);
  if (missing.length) throw new Error(`Missing required template variables: ${missing.join(', ')}`);
  const replace = (value = '') => value.replace(variablePattern, (_, key: string) => String(variables[key] ?? ''));
  return { subject: replace(template.subject), content: replace(template.content), plainText: replace(template.plainText || template.content) };
};
export const findTemplate = async (templateId?: string, templateKey?: string, channel?: string) => {
  if (!templateId && !templateKey) return undefined;
  const filter: Record<string, unknown> = templateId
    ? { _id: templateId }
    : { key: templateKey!.toUpperCase(), channel, status: 'active' };
  return MessageTemplate.findOne(filter);
};
