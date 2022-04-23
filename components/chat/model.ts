export enum MessageType {
  front,
  back,
  system,
}

export type Message = {
  type: MessageType;
  id: string;
  timestamp: number;
  payload: string;
};

export type FrontMessage = Message & {
  type: MessageType.front;
  ack: boolean;
};

export function isAFrontMessage(message: Message): message is FrontMessage {
  return message && message.type === MessageType.front;
}

export type BackMessage = Message & {
  type: MessageType.back;
};
export type SystemMessage = Message & {
  type: MessageType.system;
};

export enum FrontEvent {
  sendMessage = 'client-send-message',
}

export type FrontSendMessageEventBody = {
  id: string;
  timestamp: number;
  payload: string;
};

export enum BackEvent {
  frontMessageAck = 'client-back-front-message-ack',
  messageSentFromBack = 'client-back-send-message',
}
