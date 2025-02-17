import {WalletApi} from 'lucid-cardano';

export interface WalletApiProvider {
  getWalletApi(name: string): Promise<WalletApi>
}

const supportedProviders: { [key: string]: boolean } = {
  nami: true,
  flint: true,
  yoroi: true,
  gerowallet: true,
  eternl: true,
  typhoncip30: true,
  LodeWallet: true,
  exodus: true,
  vespr: true,
  lace: true,
  nufi: true,
};

export const lucidWalletApiProvider: WalletApiProvider = {

  async getWalletApi(provider: string): Promise<WalletApi> {
    if (!supportedProviders[provider]) {
      throw new Error(`Invalid Wallet Provider: ${provider}`);
    }
    const context = window as any;

    console.log('Cardano wallet providers')
    console.log(provider)
    console.log(context.cardano)
    console.log(context.exodus)

    let walletApi = null

    // exodus extension doesn't seem to inject exodus property into window.cardano
    if (provider === 'exodus') {
      // note exodus wallet must be "unlocked" before it can connect
      walletApi = (await context.exodus.cardano.enable()) as WalletApi
    } else if (!context.cardano || !context.cardano[provider]) {
      throw new Error("cardano provider instance not found in context");
    } else {
      walletApi = (await context.cardano[provider].enable()) as WalletApi;
    }

    return walletApi;
  }
} 

