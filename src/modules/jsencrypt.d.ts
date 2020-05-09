declare module 'jsencrypt' {
  export class JSEncrypt {
    public setPublicKey(publicKey: string): void
    public setPrivateKey(privateKey: string): void
    public encrypt(data: string): string
    public decrypt(encryptedData: string): string
    public getPrivateKey(): string
    public getPublicKey(): string
  }
}
