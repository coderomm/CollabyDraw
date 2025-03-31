export async function generateAESKey(): Promise<string> {
  const key = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...key));
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function encryptData(
  plainText: string,
  key: string
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const alg = { name: "AES-GCM", iv };

  const rawKey = base64ToUint8Array(key);

  const cryptoKey = await crypto.subtle.importKey("raw", rawKey, alg, false, [
    "encrypt",
  ]);

  const encrypted = await crypto.subtle.encrypt(
    alg,
    cryptoKey,
    new TextEncoder().encode(plainText)
  );

  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.byteLength);

  return btoa(String.fromCharCode(...combined));
}

export async function decryptData(
  cipherText: string,
  key: string
): Promise<string> {
  const combined = Uint8Array.from(atob(cipherText), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const rawKey = base64ToUint8Array(key);
  const alg = { name: "AES-GCM", iv };

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    alg,
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(alg, cryptoKey, data);
  return new TextDecoder().decode(decrypted);
}