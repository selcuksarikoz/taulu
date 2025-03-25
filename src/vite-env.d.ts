/// <reference types="vite/client" />

import { StickyNoteColor } from "@/Colors.ts";

export declare global {
  interface Window {
    electronAPI?: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        send: (channel: string, ...args: any[]) => void;
        on: (channel, callback) => void;
        removeListener: (channel, callback) => void;
      };
    };
  }

  interface IToken {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
    token_type: string;
    expiry_date: number;
    expires_in?: number;
    scope?: string;
  }

  interface IGoogleUser {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    is_pro?: boolean;
  }

  interface Position {
    x: number;
    y: number;
  }

  interface Dimensions {
    width: number;
    height: number;
  }

  export interface App_metadata {
    provider: string;
    providers: string[];
  }

  export interface User_metadata {
    avatar_url: string;
    email: string;
    email_verified: boolean;
    full_name: string;
    iss: string;
    name: string;
    phone_verified: boolean;
    picture: string;
    provider_id: string;
    sub: string;
  }

  export interface Identity_data {
    avatar_url: string;
    email: string;
    email_verified: boolean;
    full_name: string;
    iss: string;
    name: string;
    phone_verified: boolean;
    picture: string;
    provider_id: string;
    sub: string;
  }

  export interface Identities {
    identity_id: string;
    id: string;
    user_id: string;
    identity_data: Identity_data;
    provider: string;
    last_sign_in_at: string;
    created_at: string;
    updated_at: string;
    email: string;
  }

  export interface User {
    id: string;
    aud: string;
    role: string;
    email: string;
    email_confirmed_at: string;
    phone: string;
    confirmed_at: string;
    last_sign_in_at: string;
    app_metadata: App_metadata;
    user_metadata: User_metadata;
    identities: Identities[];
    created_at: string;
    updated_at: string;
    is_anonymous: boolean;
  }

  export interface Sessio {
    access_token: string;
    token_type: string;
    expires_in: number;
    expires_at: number;
    refresh_token: string;
    user: ISupabaseUser;
  }

  export interface Identities {
    identity_id: string;
    id: string;
    user_id: string;
    identity_data: Identity_data;
    provider: string;
    last_sign_in_at: string;
    created_at: string;
    updated_at: string;
    email: string;
  }

  export interface ISupabaseUser {
    id: string;
    aud: string;
    role: string;
    email: string;
    email_confirmed_at: string;
    phone: string;
    confirmed_at: string;
    last_sign_in_at: string;
    app_metadata: App_metadata;
    user_metadata: User_metadata;
    identities: Identities[];
    created_at: string;
    updated_at: string;
    is_anonymous: boolean;
    is_pro: boolean;
  }

  export interface ISupabaseSession {
    session: Session;
    user: ISupabaseUser;
  }

  type WidgetType = "webview" | "note";

  export interface IAppModel {
    type: WidgetType;
    id: string;
    content: string;
    position: Position;
    dimensions: Dimensions;
    zIndex: number;
    color: StickyNoteColor;
    fontSize: number;
    user_agent?: string;
  }
}
