export type ApiWorkspaceAuth =
  | {
      kind: "demo";
      workspaceId: null;
    }
  | null;

export async function getApiWorkspaceAuth(): Promise<ApiWorkspaceAuth> {
  return {
    kind: "demo",
    workspaceId: null,
  };
}
