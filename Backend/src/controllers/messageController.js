import Message from "../models/Message.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";

export const sendDirectMessage =  async (req, res) => {
    try {
        const {recipientId, content, conversationId} = req.body;
        const senderId = req.user.id;

        let conversation;

        if (!content){
            return res.status(400).json({ message: "Noi dung khong duoc de trong" });
        }

        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
        }

        if (!conversation){
            conversation = await Conversation.create({
                type:'direct',
                participants:[
                    {userId:senderId,joinedAt: new Date()},
                    {userId:recipientId,joinedAt: new Date()}
                ],
                lastMessageAt: new Date(),
                unreadCounts:new Map()
            });
        }

        const message = await Message.create({
            content,
            senderId,
            conversationId: conversation._id
        });

        updateConversationAfterCreateMessage(conversation, message, senderId);

        await conversation.save();

        res.status(200).json({ message });
    } catch (error) {
        console.error("Error sending direct message:", error);
        res.status(500).json({ message: "Loi he thong" });
    }
}

export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;

    if (!content) {
      return res.status(400).json("Thiếu nội dung");
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xảy ra khi gửi tin nhắn nhóm", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};