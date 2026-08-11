import { createClient } from "@/lib/supabase/server";

export async function getCurriculums() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("curriculums")
    .select("id, name, description")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLevels(curriculumId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("levels")
    .select("id, curriculum_id, name, description")
    .eq("curriculum_id", curriculumId)
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSubjects(levelId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("id, level_id, name, code, description")
    .eq("level_id", levelId)
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getContentNodes(subjectId: string, parentId?: string | null) {
  const supabase = await createClient();
  let query = supabase
    .from("content_nodes")
    .select("id, subject_id, parent_id, name, description")
    .eq("subject_id", subjectId)
    .eq("is_active", true);

  query = parentId
    ? query.eq("parent_id", parentId)
    : query.is("parent_id", null);

  const { data, error } = await query.order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getContentNode(nodeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_nodes")
    .select("id, subject_id, parent_id, name, description")
    .eq("id", nodeId)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getQuestionPages(subjectId: string, contentNodeId?: string | null) {
  const supabase = await createClient();
  let query = supabase
    .from("question_pages")
    .select("id, subject_id, content_node_id, title, description, page_type, is_published")
    .eq("subject_id", subjectId)
    .eq("is_published", true);

  query = contentNodeId
    ? query.eq("content_node_id", contentNodeId)
    : query.is("content_node_id", null);

  const { data, error } = await query.order("title", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}
