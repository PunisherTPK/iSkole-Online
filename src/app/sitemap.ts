import type { MetadataRoute } from "next";
import { getCatalog, pathForGrade, pathForLesson, pathForPaper, pathForSubject } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://iskole.online";
  const catalog = await getCatalog();
  const routes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/search`, lastModified: new Date() },
  ];

  for (const grade of catalog.grades) {
    routes.push({ url: `${siteUrl}${pathForGrade(grade)}`, lastModified: new Date() });
    for (const subject of catalog.subjects.filter((item) => item.grade_id === grade.id)) {
      routes.push({ url: `${siteUrl}${pathForSubject(grade, subject)}`, lastModified: new Date() });
      for (const lesson of catalog.lessons.filter((item) => item.subject_id === subject.id)) {
        routes.push({ url: `${siteUrl}${pathForLesson(grade, subject, lesson)}`, lastModified: new Date() });
        for (const paper of catalog.papers.filter((item) => item.lesson_id === lesson.id)) {
          routes.push({ url: `${siteUrl}${pathForPaper(grade, subject, lesson, paper)}`, lastModified: new Date() });
        }
      }
    }
  }

  return routes;
}
