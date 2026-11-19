import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { summary } from '../data/summary';

export const prerender = true;

export const GET: APIRoute = async () => {
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
  const lines = [
    `# ${summary.name}`,
    '',
    `> ${summary.short}`,
    '',
    `Role: ${summary.longRole}. Location: ${summary.city}, ${summary.country}. Contact: ${summary.email}.`,
    '',
    '## Pages',
    '',
    `- [Home](${summary.site}/): experience, projects, skills, education, leadership and contact.`,
    `- [About](${summary.site}/about): biography and focus areas.`,
    `- [Full content for LLMs](${summary.site}/llms-full.txt): every project, role and skill in plain text.`,
    '',
    '## Resume',
    '',
    `- [CV (English, PDF)](${summary.cv.en})`,
    `- [CV (Spanish, PDF)](${summary.cv.es})`,
    '',
    '## Projects',
    '',
    ...projects.map(
      (p) =>
        `- ${p.data.liveUrl ? `[${p.data.title}](${p.data.liveUrl})` : p.data.title}: ${p.data.description}`,
    ),
    '',
    '## Profiles',
    '',
    `- [GitHub](${summary.links.github})`,
    `- [LinkedIn](${summary.links.linkedin})`,
    `- [Medium](${summary.links.medium})`,
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
