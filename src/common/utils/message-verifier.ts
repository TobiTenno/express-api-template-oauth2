import { AESCrypt } from './crypt';

const PLAIN_ENCODING = 'utf8' as const;

export class MessageVerifier {
  static generate(value: string): string {
    const data = AESCrypt.encrypt(value);
    return `${data}--${AESCrypt.digest(data)}`;
  }

  static verify(signedMessage: string): string | false {
    const split = signedMessage.split('--');
    const [encodedCipherText] = split[0].split(':');
    const cipherText = Buffer.from(encodedCipherText, PLAIN_ENCODING);
    const digest = split[1];

    const decrypted = AESCrypt.decrypt(cipherText.toString());
    return AESCrypt.digest(cipherText.toString()) === digest && decrypted;
  }
}
