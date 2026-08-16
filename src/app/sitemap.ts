import type { MetadataRoute } from "next";
import { getCatalog, pathForCurriculum, pathForLevel, pathForSubject, pathForSubTopic, pathForTopic, pathForUnit } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://iskole.online";
  const catalog = await getCatalog();
  const routes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/search`, lastModified: new Date() },
    { url: `${siteUrl}/teachers`, lastModified: new Date() },
  ];

  for (const teacher of catalog.teachers) {
    routes.push({ url: `${siteUrl}/teachers/${teacher.slug}`, lastModified: new Date() });
  }

  for (const curriculum of catalog.curriculums) {
    routes.push({ url: `${siteUrl}${pathForCurriculum(curriculum)}`, lastModified: new Date() });
    for (const level of catalog.levels.filter((item) => item.curriculum_id === curriculum.id)) {
      routes.push({ url: `${siteUrl}${pathForLevel(curriculum, level)}`, lastModified: new Date() });
      for (const subject of catalog.subjects.filter((item) => item.level_id === level.id)) {
        routes.push({ url: `${siteUrl}${pathForSubject(curriculum, level, subject)}`, lastModified: new Date() });
        for (const unit of catalog.units.filter((item) => item.subject_id === subject.id)) {
          routes.push({ url: `${siteUrl}${pathForUnit(curriculum, level, subject, unit)}`, lastModified: new Date() });
          for (const topic of catalog.topics.filter((item) => item.unit_id === unit.id)) {
            routes.push({ url: `${siteUrl}${pathForTopic(curriculum, level, subject, unit, topic)}`, lastModified: new Date() });
            for (const subTopic of catalog.subTopics.filter((item) => item.topic_id === topic.id)) {
              routes.push({ url: `${siteUrl}${pathForSubTopic(curriculum, level, subject, unit, topic, subTopic)}`, lastModified: new Date() });
            }
          }
        }
      }
    }
  }

  return routes;
}
