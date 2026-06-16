// Preconfigured storage helpers for Manus WebDev templates
// Uses the Biz-provided storage proxy (Authorization: Bearer <token>)

import { ENV } from './_core/env';

type StorageConfig = { baseUrl: string; apiKey: string };

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

/**
 * Upload a file to storage with user isolation
 * @param userId - The ID of the user uploading the file
 * @param relKey - Relative path (e.g., "moles/123/photo.jpg")
 * @param data - File data
 * @param contentType - MIME type of the file
 * @returns Object containing the full storage key and access URL
 */
export async function storagePut(
  userId: string,
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getStorageConfig();
  
  // Prefix the key with the user ID to isolate files per user
  const userPrefixedKey = `users/${userId}/${normalizeKey(relKey)}`;
  const uploadUrl = buildUploadUrl(baseUrl, userPrefixedKey);
  
  const formData = toFormData(data, contentType, userPrefixedKey.split("/").pop() ?? userPrefixedKey);
  
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  
  const url = (await response.json()).url;
  return { key: userPrefixedKey, url };
}

/**
 * Get a download URL for a file with user isolation
 * @param userId - The ID of the user requesting the file
 * @param relKey - Relative path (e.g., "moles/123/photo.jpg")
 * @returns Object containing the storage key and temporary download URL
 * @throws Error if the requested key does not belong to the user
 */
export async function storageGet(
  userId: string,
  relKey: string
): Promise<{ key: string; url: string; }> {
  const { baseUrl, apiKey } = getStorageConfig();
  
  // Normalize and construct the expected user-prefixed key
  const normalizedRelKey = normalizeKey(relKey);
  const expectedUserKey = `users/${userId}/${normalizedRelKey}`;
  
  // Security check: verify that the requested key belongs to this user
  if (!normalizedRelKey.startsWith(`users/${userId}/`) && !relKey.startsWith(`users/${userId}/`)) {
    // If the key doesn't already contain the user prefix, we use the expected one
    // This ensures backward compatibility while enforcing security
    return {
      key: expectedUserKey,
      url: await buildDownloadUrl(baseUrl, expectedUserKey, apiKey),
    };
  }
  
  // If the key already has the correct user prefix, use it as-is
  return {
    key: normalizedRelKey,
    url: await buildDownloadUrl(baseUrl, normalizedRelKey, apiKey),
  };
}

/**
 * Legacy support for storageGet without userId
 * @deprecated Use storageGet(userId, relKey) instead
 */
export async function storageGetLegacy(relKey: string): Promise<{ key: string; url: string; }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}