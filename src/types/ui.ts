import {ReactNode} from "react"
export declare namespace UITypes {

  interface Breadcrumb {
    path: string
    crumbName: string
  }

  namespace Card {
    type IconType = 'cardano' | 'diamond' | 'sphere'

    interface Detail {
      name: string
      value: string
      isGreen?: boolean
      isRed?: boolean
      tooltip?: string
      copyId?: boolean
    }

    type CommonHeader = {
      left: {
        name: ReactNode,
        value: ReactNode,
      },
      right: {
        name: ReactNode,
        value: ReactNode,
      }
      iconType?: IconType
    }

    interface CardData {
      details: Detail[]
      header: CommonHeader
      lineColor?: "violet"
      isUniqueButtons?: boolean
      danger?: boolean
    }
  }

  namespace Wallets {

    interface Utxo {
      id: string,
      ix: number
    }

    interface Wallet {
      provider: string,
      address: string,
      utxos: Utxo[]
    }

  }

  export interface TabType {
    title: string;
    link?: string;
    content?: JSX.Element;
    onClick?: () => void;
  }

  export interface AlertType {
    id?: string
    type?: 'success' | 'error' | 'warning'
    message: string
    txHash?: string
    link?: string
  }
}

export type VerifiedNameMap = {
  [tokenName: string]: { [poolSize: string]: VerifiedName }
}

export type VerifiedName = {
  name: string,
  opts: number,
}

export type ServerErrorCode =
  | 'ServerFetchError'
  | 'ServerResponseBodyError'
  | 'ServerResponseError'
  | 'ServerJsonParsingError'
  | 'ServerJsonTypingError'

export type ErrorCode = ServerErrorCode

export type Err<Code> = {
  tag: 'Err',
  code: Code,
  message: string
}

export const Err = <E extends ErrorCode>(code: E, message: string): Err<E> => {
  return {
    tag: 'Err',
    code,
    message,
  }
}

export const isErr = (v: any): v is Err<any> => {
  return (v && v.tag === 'Err')
}
