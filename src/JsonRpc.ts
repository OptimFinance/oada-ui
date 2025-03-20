/**
 * JSON-RPC Implementation
 * 
 * This module provides type-safe utilities for working with JSON-RPC 2.0 protocol:
 * - Type definitions for requests and notifications
 * - Factory functions for creating requests and notifications
 * - Type guards for validating JSON-RPC messages
 */

/**
 * JSON-RPC Request Type
 * 
 * Represents a JSON-RPC 2.0 request with:
 * - jsonrpc: Protocol version (always "2.0")
 * - method: Name of the method to be invoked
 * - params: Optional parameters for the method
 * - id: Request identifier for matching responses
 */
type JsonRpcRequest = {
  jsonrpc: "2.0";
  method: string;
  params?: any;
  id: number;
}

/**
 * JSON-RPC Notification Type
 * 
 * Represents a JSON-RPC 2.0 notification with:
 * - jsonrpc: Protocol version (always "2.0")
 * - method: Name of the method
 * - params: Optional parameters for the method
 * 
 * Notifications are one-way messages that don't expect a response.
 */
type JsonRpcNotif<a> = {
  jsonrpc: "2.0";
  method: string;
  params?: a;
}

/**
 * Creates a JSON-RPC request
 * 
 * @param id - Unique identifier for the request
 * @param method - Name of the method to invoke
 * @param params - Optional parameters for the method
 * @returns A properly formatted JSON-RPC request object
 */
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

/**
 * Creates a JSON-RPC notification
 * 
 * @param method - Name of the method
 * @param params - Optional parameters for the method
 * @returns A properly formatted JSON-RPC notification object
 */
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

/**
 * Type guard for JSON-RPC notifications
 * 
 * Validates that an object is a JSON-RPC notification for a specific method
 * and that its parameters match the expected type.
 * 
 * @param method - Expected method name
 * @param isA - Type guard for the parameters
 * @returns A type guard function that checks if an object is a valid notification
 */
export const isJsonRpcNotif = <a>(method: string, isA: (o: any) => o is a) => (o: any): o is JsonRpcNotif<a> => {
  return (o.jsonrpc !== undefined && o.jsonrpc === '2.0')
    && (o.method !== undefined && o.method === method)
    && (o.params === undefined || isA(o.params))
}
