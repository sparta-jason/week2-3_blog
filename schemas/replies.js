const mongoose = require("mongoose");

const { Schema } = mongoose;

//replyId는 게시글별로 쌓으므로 None PK
//대신 댓글 작업 시 해당 postsId값과 replyId조합으로 체크
const replySchema = new Schema({
  replyId: {
    type: Number,
    required: true,
  },
  target_postId: {
    type: Number,
    required: true,
  },
  nickname: {
    type: String
  },
  reply_content: {
    type: String
  },
  del: {
    type: String, default: 0
  },
  
});

module.exports = mongoose.model("Reply", replySchema);