type JsonRpcRequest = {
  jsonrpc: "2.0";
  method: string;
  params?: any;
  id: number;
}

type JsonRpcNotif<a> = {
  jsonrpc: "2.0";
  method: string;
  params?: a;
}

export const makeJsonRpcRequest = (id: number, method: string, params?: any): JsonRpcRequest => {
  const result =
    params === undefined
      ? ({
        jsonrpc: "2.0" as const,
        method,
        id,
      })
      : ({
        jsonrpc: "2.0" as const,
        method,
        params,
        id,
      })
  return result
}

export const makeJsonRpcNotif = <a>(method: string, params?: a): JsonRpcNotif<a> => {
  const result =
    params === undefined
      ? ({
        jsonrpc: "2.0" as const,
        method,
      })
      : ({
        jsonrpc: "2.0" as const,
        method,
        params,
      })
  return result

}

export const isJsonRpcNotif = <a>(method: string, isA: (o: any) => o is a) => (o: any): o is JsonRpcNotif<a> => {
  return (o.jsonrpc !== undefined && o.jsonrpc === '2.0')
    && (o.method !== undefined && o.method === method)
    && (o.params === undefined || isA(o.params))
}
