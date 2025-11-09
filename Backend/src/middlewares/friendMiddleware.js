import Conversation from "../models/Conversation.js"; 
import Friend from "../models/Friend.js";

const pair = (a,b) => { a<b ? [a,b]: [b,a]};


export const checkFriendship = async (req, res, next) => {
    try {
        const me = req.user._id.toString();
        const recipientId= req.body?.recipientId ?? null;
        const memberIds = req.body?.memberIds ?? [];

        if (!recipientId && memberIds.length === 0) {
            return res
            .status(400)
            .json({ message: "recipientId hoac memberIds bat buoc phai co" });
        }

        if (recipientId){
            const [userA, userB] = pair(me, recipientId);
            const friendship = await Friend.findOne({
                userA,
                userB
            });
            if (!friendship){
                return res.status(403).json({ message: "Khong phai ban be" });
            }

            return next();
        }

        const friendChecks = memberIds.map(async (memberId)=>{
            const [userA, userB] = pair(me, memberId);
            const friend = await Friend.findOne({
                userA,
                userB
            });
            return friend ? null : memberId;
        });

        const results = await Promise.all(friendChecks);
        const notFriends = results.filter(Boolean);

        if (notFriends.length>0){
            return res
            .status(403)
            .json({ message: `Khong phai ban be voi nhung nguoi co id: ${notFriends.join(", ")}` });
        }

        next();
    } catch (error) {
        console.error("Error checking friendship:", error);
        res.status(500).json({ message: "Loi he thong" });
    }
}

export const checkGroupMembership = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
    }

    const isMember = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Bạn không ở trong group này." });
    }

    req.conversation = conversation;

    next();
  } catch (error) {
    console.error("Lỗi checkGroupMembership:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};