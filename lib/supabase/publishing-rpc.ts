import "server-only";

type PublishingRpcName = "has_publish_entitlement" | "publish_candidate_site" | "set_candidate_site_visibility";

type RpcResponse = {
  data: unknown;
  error: { message: string } | null;
};

export async function callPublishingRpc(client: { rpc: unknown }, name: PublishingRpcName, args: Record<string, unknown>): Promise<RpcResponse> {
  const invoke = client.rpc as (functionName: string, functionArgs: Record<string, unknown>) => PromiseLike<RpcResponse>;
  return await invoke.call(client, name, args);
}
