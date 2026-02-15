import App from "../../App";
import { performLookup } from "@/server/lib/perform-lookup";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;
  let decodedId: string;
  try {
    decodedId = decodeURIComponent(id);
  } catch {
    decodedId = id;
  }

  try {
    const initialData = await performLookup(decodedId);
    return <App initialData={initialData} initialInput={decodedId} />;
  } catch {
    return <App initialInput={decodedId} />;
  }
}
