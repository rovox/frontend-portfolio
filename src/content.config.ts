import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    description: z.string(),
    author: z.string().default('Jose Roberto Vargas Orellana'),
    image: z
      .object({
        url: z.string(),
        alt: z.string(),
      })
      .optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const skills = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/skills' }),
  schema: z.object({
    icon: z.string(),
    title: z.string(),
    order: z.number(),
    tags: z.array(z.string()).default([]),
  }),
});

const experiences = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experiences' }),
  schema: z.object({
    role: z.string(),
    company: z.string(),
    location: z.string(),
    period: z.string(),
    type: z.enum(['professional', 'university']),
    technologies: z.array(z.string()),
    tags: z.array(z.string()).default([]),
    order: z.number(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
    githubUrl: z.string().url(),
    category: z.enum(['web', 'blockchain', 'mobile', 'design']),
    tags: z.array(z.string()).default([]),
    order: z.number(),
  }),
});

const education = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/education' }),
  schema: z.object({
    institution: z.string(),
    degree: z.string(),
    period: z.string(),
    location: z.string(),
    order: z.number(),
  }),
});

const leadership = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/leadership' }),
  schema: z.object({
    role: z.string(),
    organization: z.string(),
    year: z.string(),
    order: z.number(),
  }),
});

export const collections = { blog, skills, experiences, projects, education, leadership };
