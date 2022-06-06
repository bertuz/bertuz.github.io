// spawn by api via pusher channels
import type { MessageBase } from './model';

export enum ApiEvent {
  openEndBackChannelChatSession = 'open-end-back-channel-chat-session',
  internalError = 'init-error',
  closedChatSession = 'closed-chat-session',
}

// spawn by back/api and listened to by front
export enum BackEvent {
  frontMessageAck = 'client-back-front-message-ack',
  sendMessage = 'client-back-send-message',
}

export type FrontSendMessageEventBody = {
  id: string;
  timestamp: number;
  payload: string;
};

export type OpenEndBackChannelChatSessionBody = {
  firstMessage: MessageBase;
  sessionId: string;
};

export type BackEventSendMessage = MessageBase;

export type BackAckForFrontMessage = { messageId: string };

export const ACK_TIMEOUT_IN_MS = 7000;
export const ACK_TIMEOUT_IN_MS_FOR_BACKEND = ACK_TIMEOUT_IN_MS - 1000;
