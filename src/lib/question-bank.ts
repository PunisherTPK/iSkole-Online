import { createClient } from "@/lib/supabase/server";

type ContentNode = {
  id: string;
  subject_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
};

export async function getCurriculums() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("curriculums").select("id, name, description").eq("is_active", true).order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLevels(curriculumId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("levels").select("id, curriculum_id, name, description").eq("curriculum_id", curriculumId).eq("is_active", true).order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSubjects(levelId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("subjects").select("id, level_id, name, code, description").eq("level_id", levelId).eq("is_active", true).order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getContentNodes(subjectId: string, parentId?: string | null) {
  const supabase = await createClient();
  let query = supabase.from("content_nodes").select("id, subject_id, parent_id, name, description").eq("subject_id", subjectId).eq("is_active", true);
  query = parentId ? query.eq("parent_id", parentId) : query.is("parent_id", null);
  const { data, error } = await query.order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getContentNode(nodeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("content_nodes").select("id, subject_id, parent_id, name, description").eq("id", nodeId).eq("is_active", true).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getContentNodePath(nodeId: string) {
  const path: ContentNode[] = [];
  let currentId: string | null = nodeId;
  const seen = new Set<string>();

  while (currentId && !seen.has(currentId)) {
    seen.add(currentId);

    const data = await getContentNode(currentId);

    if (!data) break;

    path.unshift(data);
    currentId = data.parent_id;
  }

  return path;
}

export async function getQuestionPages(subjectId: string, contentNodeId?: string | null) {
  const supabase = await createClient();
  let query = supabase.from("question_pages").select("id, subject_id, content_node_id, title, description, page_type, is_published").eq("subject_id", subjectId).eq("is_published", true);
  query = contentNodeId ? query.eq("content_node_id", contentNodeId) : query.is("content_node_id", null);
  const { data, error } = await query.order("title", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}
