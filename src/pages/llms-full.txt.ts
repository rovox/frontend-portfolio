import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { summary } from '../data/summary';

export const prerender = true;

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

export const GET: APIRoute = async () => {
  const [projects, experiences, skills, education, leadership] = await Promise.all([
    getCollection('projects'),
    getCollection('experiences'),
    getCollection('skills'),
    getCollection('education'),
    getCollection('leadership'),
  ]);

  const out: string[] = [
    `# ${summary.name} — full portfolio content`,
    '',
    `> ${summary.short}`,
    '',
    `Site: ${summary.site}`,
    `Email: ${summary.email}`,
    `CV (EN): ${summary.cv.en}`,
    `CV (ES): ${summary.cv.es}`,
    '',
    '## Experience',
    '',
    ...experiences.sort(byOrder).flatMap((e) => [
      `### ${e.data.role} — ${e.data.company} (${e.data.period}, ${e.data.location})`,
      `Technologies: ${e.data.technologies.join(', ')}`,
      (e.body ?? '').trim(),
      '',
    ]),
    '## Projects',
    '',
    ...projects.sort(byOrder).flatMap((p) => [
      `### ${p.data.title}`,
      p.data.description,
      `Technologies: ${p.data.technologies.join(', ')}`,
      ...(p.data.liveUrl ? [`Live: ${p.data.liveUrl}`] : []),
      ...(p.data.githubUrl ? [`Source: ${p.data.githubUrl}`] : []),
      (p.body ?? '').trim(),
      '',
    ]),
    '## Skills',
    '',
    ...skills.sort(byOrder).flatMap((s) => [
      `### ${s.data.title}`,
      `Tags: ${s.data.tags.join(', ')}`,
      (s.body ?? '').trim(),
      '',
    ]),
    '## Education',
    '',
    ...education
      .sort(byOrder)
      .map((e) => `- ${e.data.degree} — ${e.data.institution} (${e.data.period}, ${e.data.location})`),
    '',
    '## Leadership',
    '',
    ...leadership
      .sort(byOrder)
      .map((l) => `- ${l.data.role} — ${l.data.organization} (${l.data.year})`),
    '',
  ];
  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
