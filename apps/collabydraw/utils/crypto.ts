export async function encryptData(
  plainText: string,
  key: string
): Promise<string> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const alg = { name: "AES-GCM", iv };

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    alg,
    false,
    ["encrypt"]
  );

  const encrypted = await crypto.subtle.encrypt(
    alg,
    cryptoKey,
    enc.encode(plainText)
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
  const enc = new TextEncoder();
  const combined = Uint8Array.from(atob(cipherText), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const alg = { name: "AES-GCM", iv };

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    alg,
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(alg, cryptoKey, data);

  return new TextDecoder().decode(decrypted);
}
