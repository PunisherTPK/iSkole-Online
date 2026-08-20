import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required to practice." }, { status: 401 });
    }

    const body = await request.json();
    const pageId = typeof body?.questionPageId === "string" ? body.questionPageId : "";
    const answers = body?.answers && typeof body.answers === "object" ? body.answers : null;

    if (!pageId || !answers) {
      return NextResponse.json({ error: "Question Page ID and answers are required." }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("submit_question_page_practice", {
      p_question_page_id: pageId,
      p_answers: answers,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit practice." },
      { status: 500 },
    );
  }
}
