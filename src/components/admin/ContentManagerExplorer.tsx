"use client";

import { ChevronDown, ChevronRight, FileQuestion, Folder, FolderOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminCard, SelectInput, SubmitButton, Textarea, TextInput } from "@/components/admin/AdminForms";
import type { Catalog, QuestionType, Subject, SubTopic, Topic, Unit } from "@/lib/types";
import { cn } from "@/lib/utils";

type NodeKind = "subject" | "unit" | "topic" | "subTopic" | "questionType";
type NodeRef = { kind: NodeKind; id: string };
type TreeNode = NodeRef & { label: string; children: TreeNode[] };
type ServerAction = (formData: FormData) => Promise<void>;

type Actions = {
  createUnit: ServerAction;
  updateUnit: ServerAction;
  deleteUnit: ServerAction;
  createTopic: ServerAction;
  updateTopic: ServerAction;
  deleteTopic: ServerAction;
  createSubTopic: ServerAction;
  updateSubTopic: ServerAction;
  deleteSubTopic: ServerAction;
  createQuestionType: ServerAction;
  updateQuestionType: ServerAction;
  deleteQuestionType: ServerAction;
  createQuestion: ServerAction;
  updateQuestion: ServerAction;
  deleteQuestion: ServerAction;
  createDiscussionVideo: ServerAction;
  updateDiscussionVideo: ServerAction;
  deleteDiscussionVideo: ServerAction;
};

export function ContentManagerExplorer({
  catalog,
  subject,
  teacherOptions,
  actions,
}: {
  catalog: Catalog;
  subject: Subject;
  teacherOptions: [string, string][];
  actions: Actions;
}) {
  const tree = useMemo(() => buildTree(catalog, subject), [catalog, subject]);
  const [selected, setSelected] = useState<NodeRef>({ kind: "subject", id: subject.id });
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([nodeKey("subject", subject.id)]));
  const [query, setQuery] = useState("");

  const visibleNodes = useMemo(() => flattenTree(tree, expanded, query), [tree, expanded, query]);
  const selectedKey = nodeKey(selected.kind, selected.id);

  function toggle(node: NodeRef) {
    const key = nodeKey(node.kind, node.id);
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectByOffset(offset: number) {
    const index = visibleNodes.findIndex((item) => nodeKey(item.kind, item.id) === selectedKey);
    const next = visibleNodes[Math.min(Math.max(index + offset, 0), visibleNodes.length - 1)];
    if (next) setSelected({ kind: next.kind, id: next.id });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <aside className="rounded-2xl border border-border bg-card p-4 shadow-brand">
        <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (event.target.value.trim()) setExpanded(new Set(allExpandableKeys(tree)));
            }}
            placeholder="Search tree"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div
          className="mt-4 max-h-[68vh] overflow-auto pr-1"
          role="tree"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              selectByOffset(1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              selectByOffset(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              setExpanded((current) => new Set(current).add(selectedKey));
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              setExpanded((current) => {
                const next = new Set(current);
                next.delete(selectedKey);
                return next;
              });
            }
          }}
        >
          {visibleNodes.map((node) => (
            <TreeRow
              key={nodeKey(node.kind, node.id)}
              node={node}
              active={nodeKey(node.kind, node.id) === selectedKey}
              expanded={expanded.has(nodeKey(node.kind, node.id))}
              onToggle={() => toggle(node)}
              onSelect={() => setSelected({ kind: node.kind, id: node.id })}
            />
          ))}
        </div>
      </aside>
      <section className="min-w-0">
        <ActiveEditor catalog={catalog} subject={subject} selected={selected} teacherOptions={teacherOptions} actions={actions} />
      </section>
    </div>
  );
}

function TreeRow({
  node,
  active,
  expanded,
  onToggle,
  onSelect,
}: {
  node: TreeNode & { depth: number };
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
}) {
  const hasChildren = node.children.length > 0;
  const Icon = node.kind === "questionType" ? FileQuestion : expanded ? FolderOpen : Folder;
  return (
    <div
      role="treeitem"
      aria-selected={active}
      style={{ paddingLeft: node.depth * 16 }}
      className={cn("flex items-center gap-1 rounded-xl py-1.5 pr-2 text-sm", active && "bg-primary/10 text-primary")}
    >
      <button type="button" onClick={onToggle} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-muted/20" aria-label={expanded ? "Collapse" : "Expand"}>
        {hasChildren ? expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" /> : <span className="h-4 w-4" />}
      </button>
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1 text-left font-medium hover:bg-muted/20">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{node.label}</span>
      </button>
    </div>
  );
}

function ActiveEditor({ catalog, subject, selected, teacherOptions, actions }: { catalog: Catalog; subject: Subject; selected: NodeRef; teacherOptions: [string, string][]; actions: Actions }) {
  const units = unitsForSubject(catalog, subject);
  const topics = units.flatMap((unit) => topicsForUnit(catalog, unit));
  const subTopics = topics.flatMap((topic) => subTopicsForTopic(catalog, topic));
  const questionTypes = subTopics.flatMap((subTopic) => questionTypesForSubTopic(catalog, subTopic));

  if (selected.kind === "subject") {
    return (
      <AdminCard title={subject.name} description="Subject overview">
        <div className="grid gap-5">
          <ReadOnlyField label="Parent" value="Assigned subject" />
          <ChildList title="Child Units" items={units.map((unit) => unit.name)} />
          <form action={actions.createUnit} className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
            <input type="hidden" name="subject_id" value={subject.id} />
            <TextInput label="New Unit" name="name" />
            <TextInput label="Order" name="display_order" type="number" defaultValue={units.length + 1} />
            <div className="self-end"><SubmitButton>Add Unit</SubmitButton></div>
            <div className="md:col-span-3"><Textarea label="Description" name="description" /></div>
          </form>
        </div>
      </AdminCard>
    );
  }

  if (selected.kind === "unit") {
    const unit = catalog.units.find((item) => item.id === selected.id);
    if (!unit) return null;
    const childTopics = topicsForUnit(catalog, unit);
    return (
      <AdminCard title={unit.name} description="Unit details">
        <form action={actions.updateUnit} className="grid gap-3 md:grid-cols-[1fr_120px_auto_auto]">
          <input type="hidden" name="id" value={unit.id} /><input type="hidden" name="subject_id" value={unit.subject_id} />
          <TextInput label="Unit Name" name="name" defaultValue={unit.name} />
          <TextInput label="Order" name="display_order" type="number" defaultValue={unit.display_order} />
          <div className="self-end"><SubmitButton>Save</SubmitButton></div>
          <button formAction={actions.deleteUnit} className="self-end rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive" data-confirm="Delete this unit?">Delete</button>
          <div className="md:col-span-4"><Textarea label="Description" name="description" defaultValue={unit.description} /></div>
        </form>
        <div className="mt-5 grid gap-4">
          <ReadOnlyField label="Parent" value={subject.name} />
          <ChildList title="Child Topics" items={childTopics.map((topic) => topic.name)} />
          <form action={actions.createTopic} className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
            <input type="hidden" name="unit_id" value={unit.id} />
            <TextInput label="New Topic" name="name" />
            <TextInput label="Order" name="display_order" type="number" defaultValue={childTopics.length + 1} />
            <div className="self-end"><SubmitButton tone="secondary">Add Topic</SubmitButton></div>
            <div className="md:col-span-3"><Textarea label="Description" name="description" /></div>
          </form>
        </div>
      </AdminCard>
    );
  }

  if (selected.kind === "topic") {
    const topic = catalog.topics.find((item) => item.id === selected.id);
    if (!topic) return null;
    const unitOptions = units.map((unit) => [unit.id, unit.name] as [string, string]);
    const parent = catalog.units.find((unit) => unit.id === topic.unit_id);
    const childSubTopics = subTopicsForTopic(catalog, topic);
    return (
      <AdminCard title={topic.name} description="Topic details">
        <form action={actions.updateTopic} className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto_auto]">
          <input type="hidden" name="id" value={topic.id} />
          <SelectInput label="Parent Unit" name="unit_id" options={unitOptions} defaultValue={topic.unit_id} />
          <TextInput label="Topic Name" name="name" defaultValue={topic.name} />
          <TextInput label="Order" name="display_order" type="number" defaultValue={topic.display_order} />
          <div className="self-end"><SubmitButton>Save</SubmitButton></div>
          <button formAction={actions.deleteTopic} className="self-end rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive" data-confirm="Delete this topic?">Delete</button>
          <div className="md:col-span-5"><Textarea label="Description" name="description" defaultValue={topic.description} /></div>
        </form>
        <div className="mt-5 grid gap-4">
          <ReadOnlyField label="Parent" value={parent?.name ?? "Unit"} />
          <ChildList title="Child Sub Topics" items={childSubTopics.map((subTopic) => subTopic.name)} />
          <form action={actions.createSubTopic} className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
            <input type="hidden" name="topic_id" value={topic.id} />
            <TextInput label="New Sub Topic" name="name" />
            <TextInput label="Order" name="display_order" type="number" defaultValue={childSubTopics.length + 1} />
            <div className="self-end"><SubmitButton tone="secondary">Add Sub Topic</SubmitButton></div>
            <div className="md:col-span-3"><Textarea label="Description" name="description" /></div>
          </form>
        </div>
      </AdminCard>
    );
  }

  if (selected.kind === "subTopic") {
    const subTopic = catalog.subTopics.find((item) => item.id === selected.id);
    if (!subTopic) return null;
    const topicOptions = topics.map((topic) => [topic.id, topic.name] as [string, string]);
    const parent = catalog.topics.find((topic) => topic.id === subTopic.topic_id);
    const children = questionTypesForSubTopic(catalog, subTopic);
    const videos = children.map((questionType) => discussionVideoForQuestionType(catalog, questionType)).filter(Boolean);
    return (
      <AdminCard title={subTopic.name} description="Sub topic details">
        <form action={actions.updateSubTopic} className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto_auto]">
          <input type="hidden" name="id" value={subTopic.id} />
          <SelectInput label="Parent Topic" name="topic_id" options={topicOptions} defaultValue={subTopic.topic_id} />
          <TextInput label="Sub Topic Name" name="name" defaultValue={subTopic.name} />
          <TextInput label="Order" name="display_order" type="number" defaultValue={subTopic.display_order} />
          <div className="self-end"><SubmitButton>Save</SubmitButton></div>
          <button formAction={actions.deleteSubTopic} className="self-end rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive" data-confirm="Delete this sub topic?">Delete</button>
          <div className="md:col-span-5"><Textarea label="Description" name="description" defaultValue={subTopic.description} /></div>
        </form>
        <div className="mt-5 grid gap-4">
          <ReadOnlyField label="Parent" value={parent?.name ?? "Topic"} />
          <ChildList title="Question Types" items={children.map((questionType) => `${questionType.type.toUpperCase()} - ${questionType.title}`)} />
          <ChildList title="Discussion Videos" items={videos.map((video) => video!.title)} />
          <form action={actions.createQuestionType} className="grid gap-3 md:grid-cols-[1fr_140px_1fr_120px_auto]">
            <input type="hidden" name="sub_topic_id" value={subTopic.id} />
            <SelectInput label="Teacher" name="teacher_id" options={teacherOptions} />
            <SelectInput label="Type" name="type" options={[["mcq", "MCQ"], ["structured", "Structured"]]} />
            <TextInput label="Title" name="title" />
            <TextInput label="Order" name="display_order" type="number" defaultValue={children.length + 1} />
            <div className="self-end"><SubmitButton tone="secondary">Add Type</SubmitButton></div>
            <div className="md:col-span-5"><Textarea label="Description" name="description" /></div>
          </form>
        </div>
      </AdminCard>
    );
  }

  const questionType = catalog.questionTypes.find((item) => item.id === selected.id);
  if (!questionType) return null;
  return <QuestionTypeEditor catalog={catalog} questionType={questionType} subTopicOptions={subTopics.map((item) => [item.id, item.name] as [string, string])} questionTypeOptions={questionTypes.map((item) => [item.id, item.title] as [string, string])} teacherOptions={teacherOptions} actions={actions} />;
}

function QuestionTypeEditor({ catalog, questionType, subTopicOptions, questionTypeOptions, teacherOptions, actions }: { catalog: Catalog; questionType: QuestionType; subTopicOptions: [string, string][]; questionTypeOptions: [string, string][]; teacherOptions: [string, string][]; actions: Actions }) {
  const questions = questionsForType(catalog, questionType);
  const video = discussionVideoForQuestionType(catalog, questionType);
  return (
    <AdminCard title={questionType.title} description={`${questionType.type.toUpperCase()} editor`}>
      <form action={actions.updateQuestionType} className="grid gap-3 md:grid-cols-[1fr_140px_1fr_120px_auto_auto]">
        <input type="hidden" name="id" value={questionType.id} />
        <SelectInput label="Sub Topic" name="sub_topic_id" options={subTopicOptions} defaultValue={questionType.sub_topic_id} />
        <SelectInput label="Type" name="type" options={[["mcq", "MCQ"], ["structured", "Structured"]]} defaultValue={questionType.type} />
        <TextInput label="Title" name="title" defaultValue={questionType.title} />
        <TextInput label="Order" name="display_order" type="number" defaultValue={questionType.display_order} />
        <div className="self-end"><SubmitButton>Save Type</SubmitButton></div>
        <button formAction={actions.deleteQuestionType} className="self-end rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive" data-confirm="Delete this question type?">Delete</button>
        <input type="hidden" name="teacher_id" value={questionType.teacher_id ?? ""} />
        <div className="md:col-span-6"><Textarea label="Description" name="description" defaultValue={questionType.description} /></div>
      </form>
      <div className="mt-5 grid gap-5">
        <VideoEditor video={video} questionType={questionType} questionTypeOptions={questionTypeOptions} teacherOptions={teacherOptions} actions={actions} />
        <form action={actions.createQuestion} className="rounded-xl border border-border bg-muted/5 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_130px_130px_120px_auto]">
            <input type="hidden" name="question_type_id" value={questionType.id} />
            <TextInput label="Question Image URL" name="question_image_url" placeholder="https://..." />
            <SelectInput label="Correct" name="correct_answer" options={[["", "None"], ["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]} />
            <SelectInput label="Difficulty" name="difficulty" options={[["easy", "Easy"], ["medium", "Medium"], ["hard", "Hard"]]} />
            <TextInput label="Order" name="display_order" type="number" defaultValue={questions.length + 1} />
            <div className="self-end"><SubmitButton tone="secondary">Add Question</SubmitButton></div>
            <div className="md:col-span-2"><Textarea label="Marking Scheme" name="marking_scheme" /></div>
            <div className="md:col-span-3"><Textarea label="Explanation" name="explanation" /></div>
          </div>
        </form>
        {questions.map((question) => (
          <form key={question.id} action={actions.updateQuestion} className="rounded-xl border border-border bg-background p-4">
            <input type="hidden" name="id" value={question.id} />
            <input type="hidden" name="question_type_id" value={question.question_type_id} />
            <div className="grid gap-3 md:grid-cols-[1fr_130px_130px_120px_auto_auto]">
              <TextInput label="Image URL" name="question_image_url" defaultValue={question.question_image_url} />
              <SelectInput label="Correct" name="correct_answer" options={[["", "None"], ["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]} defaultValue={question.correct_answer ?? ""} />
              <SelectInput label="Difficulty" name="difficulty" options={[["easy", "Easy"], ["medium", "Medium"], ["hard", "Hard"]]} defaultValue={question.difficulty} />
              <TextInput label="Order" name="display_order" type="number" defaultValue={question.display_order} />
              <div className="self-end"><SubmitButton>Save</SubmitButton></div>
              <button formAction={actions.deleteQuestion} className="self-end rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive" data-confirm="Delete this question?">Delete</button>
              <div className="md:col-span-3"><Textarea label="Marking Scheme" name="marking_scheme" defaultValue={question.marking_scheme} /></div>
              <div className="md:col-span-3"><Textarea label="Explanation" name="explanation" defaultValue={question.explanation} /></div>
            </div>
          </form>
        ))}
      </div>
    </AdminCard>
  );
}

function VideoEditor({ video, questionType, questionTypeOptions, teacherOptions, actions }: { video: ReturnType<typeof discussionVideoForQuestionType>; questionType: QuestionType; questionTypeOptions: [string, string][]; teacherOptions: [string, string][]; actions: Actions }) {
  const action = video ? actions.updateDiscussionVideo : actions.createDiscussionVideo;
  return (
    <form action={action} className="rounded-xl border border-border bg-background p-4">
      {video ? <input type="hidden" name="id" value={video.id} /> : null}
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
        <SelectInput label="Question Type" name="question_type_id" options={questionTypeOptions.length ? questionTypeOptions : [[questionType.id, questionType.title]]} defaultValue={questionType.id} />
        <SelectInput label="Teacher" name="teacher_id" options={teacherOptions} defaultValue={video?.teacher_id ?? questionType.teacher_id ?? ""} />
        <TextInput label="Video Title" name="title" defaultValue={video?.title ?? `${questionType.title} Discussion`} />
        <div className="self-end"><SubmitButton>{video ? "Save Video" : "Add Video"}</SubmitButton></div>
        <div className="md:col-span-2"><TextInput label="YouTube URL" name="youtube_url" defaultValue={video?.youtube_url} placeholder="https://youtube.com/watch?v=..." /></div>
        <div className="md:col-span-2"><Textarea label="Description" name="description" defaultValue={video?.description} /></div>
        <div className="md:col-span-4"><Textarea label="Resources" name="resources" defaultValue={video?.resources} /></div>
      </div>
      {video ? <button formAction={actions.deleteDiscussionVideo} className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive" data-confirm="Delete this video?">Delete Video</button> : null}
    </form>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ChildList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-muted/5 p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length ? items.map((item) => <span key={item} className="rounded-lg border border-border bg-background px-3 py-1 text-sm text-muted-foreground">{item}</span>) : <span className="text-sm text-muted-foreground">No children yet.</span>}
      </div>
    </div>
  );
}

function buildTree(catalog: Catalog, subject: Subject): TreeNode {
  return {
    kind: "subject",
    id: subject.id,
    label: subject.name,
    children: unitsForSubject(catalog, subject).map((unit) => ({
      kind: "unit",
      id: unit.id,
      label: unit.name,
      children: topicsForUnit(catalog, unit).map((topic) => ({
        kind: "topic",
        id: topic.id,
        label: topic.name,
        children: subTopicsForTopic(catalog, topic).map((subTopic) => ({
          kind: "subTopic",
          id: subTopic.id,
          label: subTopic.name,
          children: questionTypesForSubTopic(catalog, subTopic).map((questionType) => ({
            kind: "questionType",
            id: questionType.id,
            label: `${questionType.type.toUpperCase()} - ${questionType.title}`,
            children: [],
          })),
        })),
      })),
    })),
  };
}

function flattenTree(root: TreeNode, expanded: Set<string>, query: string) {
  const normalized = query.trim().toLowerCase();
  const result: Array<TreeNode & { depth: number }> = [];
  const visit = (node: TreeNode, depth: number, forceVisible: boolean) => {
    const selfMatches = !normalized || node.label.toLowerCase().includes(normalized);
    const childMatches = node.children.some((child) => subtreeMatches(child, normalized));
    if (selfMatches || childMatches || forceVisible) {
      result.push({ ...node, depth });
      if (expanded.has(nodeKey(node.kind, node.id)) || normalized) {
        node.children.forEach((child) => visit(child, depth + 1, false));
      }
    }
  };
  visit(root, 0, true);
  return result;
}

function subtreeMatches(node: TreeNode, query: string): boolean {
  if (!query) return true;
  return node.label.toLowerCase().includes(query) || node.children.some((child) => subtreeMatches(child, query));
}

function allExpandableKeys(root: TreeNode) {
  const keys: string[] = [];
  const visit = (node: TreeNode) => {
    if (node.children.length) keys.push(nodeKey(node.kind, node.id));
    node.children.forEach(visit);
  };
  visit(root);
  return keys;
}

function nodeKey(kind: NodeKind, id: string) {
  return `${kind}:${id}`;
}

function unitsForSubject(catalog: Catalog, subject: Subject) {
  return catalog.units.filter((item) => item.subject_id === subject.id).sort(byDisplayOrder);
}

function topicsForUnit(catalog: Catalog, unit: Unit) {
  return catalog.topics.filter((item) => item.unit_id === unit.id).sort(byDisplayOrder);
}

function subTopicsForTopic(catalog: Catalog, topic: Topic) {
  return catalog.subTopics.filter((item) => item.topic_id === topic.id).sort(byDisplayOrder);
}

function questionTypesForSubTopic(catalog: Catalog, subTopic: SubTopic) {
  return catalog.questionTypes.filter((item) => item.sub_topic_id === subTopic.id).sort(byDisplayOrder);
}

function questionsForType(catalog: Catalog, questionType: QuestionType) {
  return catalog.questions.filter((item) => item.question_type_id === questionType.id).sort(byDisplayOrder);
}

function discussionVideoForQuestionType(catalog: Catalog, questionType: QuestionType) {
  return catalog.discussionVideos.find((item) => item.question_type_id === questionType.id);
}

function byDisplayOrder<T extends { display_order: number; name?: string; title?: string }>(a: T, b: T) {
  return a.display_order - b.display_order || (a.name ?? a.title ?? "").localeCompare(b.name ?? b.title ?? "");
}
