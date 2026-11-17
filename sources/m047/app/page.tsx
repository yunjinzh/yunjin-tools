import { headers } from "next/headers";
import PortalClient from "./portal-client";
import { identityFromHeaders } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const identity = identityFromHeaders(await headers()) ?? {
    email: "",
    displayName: "云金",
  };
  return <PortalClient initialUser={identity} />;
}
