export const updateConversationAfterCreateMessage = (conversation, message, senderId) => {
    conversation.set({
        seenBy:[],
        lastMessageAt: message.createdAt,
        lastMessage:{
            id: message._id,
            content: message.content,
            senderId,
            createdAt: message.createdAt
        }
    })

    conversation.participants.forEach((p)=>{
        const memberId = p.userId.tostring();
        const isSender = memberId === senderId.toString();
        const preCount = conversation.unreadCounts.get(memberId) || 0;
        conversation.unreadCounts.set(memberId, isSender ? 0 : preCount + 1);
    })
}