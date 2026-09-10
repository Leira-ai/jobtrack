import { ApplicationDetail } from "@/components/applications/application-detail";

export default async function ApplicationDetailPage({
  params,
}: PageProps<"/dashboard/lamaran/[id]">) {
  const { id } = await params;
  return <ApplicationDetail applicationId={id} />;
}
