var express = require("express");
var router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const Replies = require("../schemas/replies");
const jwt = require("jsonwebtoken");

//댓글 전체 조회
router.post("/replies/:postsId", async (req, res, next) => {
  const target_postId = req.params.postsId;
  const token = req.body.token;
  const chk_nickname = jwt.decode(token);

  //token이 아예없으면 에러나므로 불린으로 있는 경우에만 닉네임 전달
  if (token) {
    try {
      const replies = await Replies.find({$and:[{target_postId: target_postId},{del: 0}]}).sort("-replyId");
      res.json({ replies: replies, chk_nickname: chk_nickname.userId});
  
    } catch (err) {
      console.error(err);
      next(err);
    }
  } else{
    const replies = await Replies.find({target_postId: target_postId}).sort("-replyId");
    res.json({ replies: replies});
  }


});


//!!!--!!!//
//댓글 작업 시 문제사항
//조회 시엔 현재 로그인 닉네임으로 잘 적용됨
//그러나 댓글 입력 시엔 현재 로그인이 아닌 다른 기준으로 적용됨...

//비교해보니.. 가져오는 방식이 좀 다른 듯..? 다른데 저장되는게 또있나.. 조회할때 처럼 가져오는 방법이 있을까.

//댓글 작성
router.post("/reply_create", authMiddleware, async (req, res) => {
  const nickname = res.locals.user.nickname;

  const { reply_content, postsId } = req.body;
  let replyId = 0;
  const target_postId = postsId

  //댓글 공란 서버 체크
  if ( reply_content == '') {
    return res.status(400).send({
      errorMessage: '댓글을 먼저 입력해주세요.'
    });
  }

  //게시물 번호 내 댓글 번호 넘버링
  try {
    const temp_replyId = await Replies.find({target_postId})
      .sort("-replyId")
      .select("replyId")
      .limit(1);
      replyId = temp_replyId[0].replyId + 1;
  } catch {
    replyId = 1;
  }

  await Replies.create({ target_postId, replyId, nickname, reply_content });
  
  return res.send({ result: "댓글이 등록되었습니다."})

});

//댓글 수정
router.post("/reply_edit", authMiddleware, async (req, res) => {
  const { editted_content, postsId, replyId } = req.body;
  const target_postId = postsId
  console.log(editted_content)

  //댓글 공란 서버 체크
  if ( editted_content == '') {
    return res.status(400).send({
      errorMessage: '댓글을 먼저 입력해주세요.'
    });
  }

  //게시물 번호 내 댓글 번호 넘버링
  try {
    await Replies.updateOne({ $and: [{target_postId: target_postId}, {replyId: replyId}] }, {$set: {reply_content:editted_content}})
  } catch {
    return res.status(400).send({
      errorMessage: '댓글을 수정할 수 없습니다.'
    });
  }
  return res.send({ result: "댓글이 수정되었습니다."})
});

//댓글 삭제
router.post("/reply_delete", authMiddleware, async (req, res) => {
  const { postsId, replyId } = req.body;
  const target_postId = postsId

  //게시물 번호 내 댓글 번호 넘버링
  try {
    //삭제 시 del 컬럼 value를 1로 변경하여 삭제 > 댓글 조회 시 0 만 필터하여 출력
    await Replies.updateOne({ $and: [{target_postId: target_postId}, {replyId: replyId}] }, {$set: {del : 1}})
  } catch {
    return res.status(400).send({
      errorMessage: '댓글을 삭제할 수 없습니다.'
    });
  }
  return res.send({ result: "댓글이 삭제되었습니다."})
});

module.exports = router;