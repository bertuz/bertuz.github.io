import type { NextApiRequest } from 'next';

import type { Override, RequiredFieldsOnly } from '../../utils/types';

export const PRIVATE_BACK_SESSION_NAME = 'private-back-session';
export enum MessageType {
  front,
  back,
  system,
}

export type MessageBase = {
  id: string;
  timestamp: number;
  text: string;
};

export type Message = MessageBase & {
  type: MessageType;
};

export type FrontMessage = Override<
  Message,
  {
    type: MessageType.front;
    ack: boolean;
    savedOnBack?: boolean;
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

export enum ChatSessionState {
  // front registered the intention of opening the session with a specific ID
  required = 'SESSION_REQUIRED',
  // channel auth requested on front side for the specific session ID. It will try to open up the pusher channel
  channelRequested = 'SESSION_CHANNEL_REQUESTED',
  // channel opened on front end. It will send the first message to open up the back end channel. This state should not be present on DB, it's front only
  channelFrontEndOpened = 'SESSION_CHANNEL_FRONT_END_OPENED',
  // the first message has been sent from the front, stored on DB, and informed the back to open up its end and ack the message
  channelBackEndOpening = 'SESSION_CHANNEL_BACK_END_OPENING',
  // the back has successfully opened its end for the session and acked the first message to the front (via api)
  opened = 'OPENED',
  closedByFront = 'CLOSED_BY_FRONT',
  closedByBack = 'CLOSED_BY_BACK',
  closedForError = 'CLOSED_FOR_ERROR',
}

type ChatSessionBase = {
  sessionId: string;
  openedAt: number;
  closedAt?: number;
};

export type ChatSession =
  | (ChatSessionBase & {
      state:
        | ChatSessionState.required
        | ChatSessionState.channelRequested
        | ChatSessionState.channelFrontEndOpened;
    })
  | (ChatSessionBase & {
      state:
        | ChatSessionState.channelBackEndOpening
        | ChatSessionState.opened
        | ChatSessionState.closedByBack
        | ChatSessionState.closedForError;
      firstMessage: MessageBase;
    })
  | (ChatSessionBase & {
      state: ChatSessionState.closedByFront;
      firstMessage: MessageBase;
      frontClosingMessage: MessageBase;
    });

export enum ChatSessionOperation {
  openBackEnd = 'open-back-end',
  ackFirstMessage = 'ack-first-message',
  closeFromFront = 'close-from-front',
}

export enum Channels {
  PrivateSupportChannel = 'private-support-channel',
}
