import type { RequiredFieldsOnly } from '../../utils/types';

import type { MessageBase, ChatSessionOperation, ChatSession } from './model';

export type CloseSessionFromFrontRequestBody = {
  operation: ChatSessionOperation.closeFromFront;
  message: MessageBase;
};

export type ChatSessionRequestBody = Omit<
  Pick<ChatSession, keyof RequiredFieldsOnly<ChatSession>>,
  'state' | 'firstMessage'
>;

export type OpenBackEndRequestBody = {
  operation: ChatSessionOperation.openBackEnd;
  firstMessage: MessageBase;
};

export type AckFirstMessageRequestBody = {
  operation: ChatSessionOperation.ackFirstMessage;
  messageId: string;
};
