import type { MetadataRoute } from "next";
import {
  getCatalog,
  pathForCurriculum,
  pathForLevel,
  pathForPastPapers,
  pathForSubject,
} from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://iskole.online";
  const catalog = await getCatalog();
  const routes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/search`, lastModified: new Date() },
  ];

  for (const curriculum of catalog.curriculums) {
    routes.push({ url: `${siteUrl}${pathForCurriculum(curriculum)}`, lastModified: new Date() });
    for (const level of catalog.levels.filter((item) => item.curriculum_id === curriculum.id)) {
      routes.push({ url: `${siteUrl}${pathForLevel(curriculum, level)}`, lastModified: new Date() });
      for (const subject of catalog.subjects.filter((item) => item.level_id === level.id)) {
        routes.push({ url: `${siteUrl}${pathForSubject(curriculum, level, subject)}`, lastModified: new Date() });
        routes.push({ url: `${siteUrl}${pathForPastPapers(curriculum, level, subject)}`, lastModified: new Date() });
      }
    }
  }

  return routes;
}
