import App from "./App";
import { getCatalog, getSession } from "@/lib/actions";

// This file intentionally does almost nothing: fetch initial data on the
// server (so there's no loading flash / no client waterfall), then render
// the single-file app. All routing/navigation from here on is client state.
export default async function Page() {
  const [catalog, session] = await Promise.all([getCatalog(), getSession()]);
  return <App initialCatalog={catalog} initialSession={session} />;
}
