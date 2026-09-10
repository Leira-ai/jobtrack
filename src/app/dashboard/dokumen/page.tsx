import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DocumentLibrary } from "@/components/documents/document-library";
import { demoApplications, demoDocuments } from "@/data";
import {
  getAuthenticatedDocumentClient,
  listDocumentsForUser,
  type DocumentApplicationOption,
} from "@/lib/documents/service";
import { createClient } from "@/lib/supabase/server";

export default async function DocumentsPage() {
  const cookieStore = await cookies();
  const demoMode = cookieStore.get("jobtrack-demo")?.value === "1";

  if (demoMode) {
    const applications: DocumentApplicationOption[] = demoApplications.map(
      (application) => ({
        id: application.id,
        label: `${application.company} · ${application.role}`,
      }),
    );
    return (
      <DocumentLibrary
        mode="demo"
        initialDocuments={demoDocuments}
        applications={applications}
      />
    );
  }

  const authenticated = await getAuthenticatedDocumentClient(createClient);
  if (!authenticated) redirect("/login?next=/dashboard/dokumen");

  let data: Awaited<ReturnType<typeof listDocumentsForUser>> | undefined;
  let loadError: string | undefined;
  try {
    data = await listDocumentsForUser(
      authenticated.supabase,
      authenticated.user.id,
    );
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Data dokumen gagal dimuat.";
  }

  return (
    <DocumentLibrary
      mode="authenticated"
      initialDocuments={data?.documents ?? []}
      applications={data?.applications ?? []}
      loadError={loadError}
    />
  );
}
