import { createCipheriv, createDecipheriv, createHmac } from 'node:crypto';

const CIPHER_ALGORITHM = 'aes-256-cbc';
const HMAC_ALGORITHM = 'sha256';
const CIPHER_TEXT_ENCODING = 'base64' as const;
const PLAIN_ENCODING = 'utf8' as const;

export class AESCrypt {
  private static get initializationVector(): Buffer {
    return Buffer.from(process.env.INITIALIZATION_VECTOR ?? '', PLAIN_ENCODING);
  }

  private static get encryptionKey(): Buffer {
    return Buffer.from(process.env.SECRET_KEY ?? '', PLAIN_ENCODING);
  }

  static decrypt(encrypted: string): string {
    const decipher = createDecipheriv(
      CIPHER_ALGORITHM,
      this.encryptionKey,
      this.initializationVector,
    );
    return `${decipher.update(encrypted, CIPHER_TEXT_ENCODING, PLAIN_ENCODING)}${decipher.final(
      PLAIN_ENCODING,
    )}`;
  }

  static encrypt(cleardata: string): string {
    const encipher = createCipheriv(
      CIPHER_ALGORITHM,
      this.encryptionKey,
      this.initializationVector,
    );
    return `${encipher.update(cleardata, PLAIN_ENCODING, CIPHER_TEXT_ENCODING)}${encipher.final(
      CIPHER_TEXT_ENCODING,
    )}`;
  }

  static digest(data: string): string {
    return createHmac(HMAC_ALGORITHM, this.encryptionKey).update(data).digest(CIPHER_TEXT_ENCODING);
  }
}
