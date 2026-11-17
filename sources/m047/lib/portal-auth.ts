export type PortalIdentity = {
  email: string;
  displayName: string;
};

export function identityFromHeaders(headers: Headers): PortalIdentity | null {
  const email = headers.get("oai-authenticated-user-email");
  if (!email) {
    if (process.env.NODE_ENV !== "production") {
      return { email: "local-preview@example.com", displayName: "云金" };
    }
    return null;
  }

  const encodedName = headers.get("oai-authenticated-user-full-name");
  const encoding = headers.get("oai-authenticated-user-full-name-encoding");
  let displayName = email;
  if (encodedName && encoding === "percent-encoded-utf-8") {
    try {
      displayName = decodeURIComponent(encodedName);
    } catch {
      displayName = email;
    }
  }
  return { email, displayName };
}

export function requirePortalIdentity(request: Request) {
  const identity = identityFromHeaders(request.headers);
  return identity ?? null;
}

export function identityRequired() {
  return Response.json({ error: "请先使用 ChatGPT 账号访问此门户。" }, { status: 401 });
}
