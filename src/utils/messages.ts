export type ParsedMessage = { content: string; isUser: boolean } | null;

export const parseIncomingData = (
  payload: Uint8Array,
  participant: any,
  userIdentity: string
): ParsedMessage => {
  try {
    const text = new TextDecoder().decode(payload);
    let content = text;
    let isUser = participant?.identity === userIdentity || participant?.isLocal === true;
    try {
      const obj = JSON.parse(text);
      if (obj && typeof obj === 'object') {
        content = obj.content || obj.text || text;
        const role = obj.role || obj.sender;
        if (role) isUser = role === 'user' || role === userIdentity;
      }
    } catch {}
    if (!content) return null;
    return { content, isUser };
  } catch {
    return null;
  }
};

export const makeUserMessage = (content: string) => ({ content, isUser: true });
export const makeAgentMessage = (content: string) => ({ content, isUser: false });

