import type { Override } from '../../utils/types';

export enum MessageType {
  front,
  back,
  system,
}

export type Message = {
  type: MessageType;
  id: string;
  timestamp: number;
  text: string;
};

export type FrontMessage = Override<
  Message,
  {
    type: MessageType.front;
    ack: boolean;
  }
>;

export function isAFrontMessage(
  message: Message | SystemMessage
): message is FrontMessage {
  return message && message.type === MessageType.front;
}

export type BackMessage = Override<
  Message,
  {
    type: MessageType.back;
  }
>;
export type SystemMessage = Override<
  Message,
  {
    type: MessageType.system;
    text: string | JSX.Element;
  }
>;

// spawn by front and listened to by back
export enum FrontEvent {
  sendMessage = 'client-front-send-message',
}

export type FrontSendMessageEventBody = {
  id: string;
  timestamp: number;
  payload: string;
};

// spawn by api
export enum ApiEvent {
  initChatReq = 'init-chat-req',
  internalError = 'init-error',
}

// spawn by back/api and listened to by front
export enum BackEvent {
  frontMessageAck = 'client-back-front-message-ack',
  sendMessage = 'client-back-send-message',
}

export enum ChatSessionState {
  toBeAccepted = 'TO_BE_ACCEPTED',
  opened = 'OPENED',
  closedByFront = 'CLOSED_BY_FRONT',
}

export type ChatSession = {
  sessionId: string;
  openedAt: number;
  state: ChatSessionState;
  firstMessage: { id: string; message: string };
};

export type ChatSessionRequest = {
  sessionId: string;
  openedAt: number;
  message: {
    id: string;
    text: string;
  };
};

export enum Channels {
  PrivateSupportChannel = 'private-support-channel',
}
