import { createClient } from "@/lib/supabase/server";

export async function getCurriculums() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("curriculums")
    .select("id, name, description")
    .is("deleted_at", null)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLevels(curriculumId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("levels")
    .select("id, curriculum_id, name, description")
    .eq("curriculum_id", curriculumId)
    .is("deleted_at", null)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSubjects(levelId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("id, level_id, name, code, description")
    .eq("level_id", levelId)
    .is("deleted_at", null)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getContentNodes(subjectId: string, parentId?: string | null) {
  const supabase = await createClient();
  let query = supabase
    .from("content_nodes")
    .select("id, subject_id, parent_id, name, description")
    .eq("subject_id", subjectId)
    .is("deleted_at", null);

  query = parentId
    ? query.eq("parent_id", parentId)
    : query.is("parent_id", null);

  const { data, error } = await query.order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getContentNode(nodeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_nodes")
    .select("id, subject_id, parent_id, name, description")
    .eq("id", nodeId)
    .is("deleted_at", null)
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
    .eq("is_published", true)
    .is("deleted_at", null);

  query = contentNodeId
    ? query.eq("content_node_id", contentNodeId)
    : query.is("content_node_id", null);

  const { data, error } = await query.order("title");
  if (error) throw new Error(error.message);
  return data ?? [];
}
