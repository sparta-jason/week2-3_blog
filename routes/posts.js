var express = require("express");
var router = express.Router();

const Posts = require("../schemas/posts");

//포스트들 전체 조회(index)
router.get("/posts", async (req, res, next) => {
  try {
    const posts = await Posts.find({}).sort({ date: -1 });

    res.json({ posts: posts });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//포스트 세부 조회(detail)
router.get("/posts/:postsId", async (req, res) => {
  const { postsId } = req.params;

  post = await Posts.findOne({ postsId: postsId });
  

  console.log(post)
  //postsId가 존재하는지 체크 후 진행
  // if (post.postsId == null) {
  //   return res.send({ result: "해당 포스팅이 존재하지 않습니다." })
  // }

  res.json({ detail: post });
});

//포스팅 입력 창
router.get("/posting", async (req, res, next) => {
  res.render("posting");
});

//포스팅 저장 시
router.post("/posting_create", async (req, res, next) => {

  let { title, writer, password, content } = req.body;

  //password 규칙 서버 체크
  const regex = /[^0-9]/g
  const pwCheckResult = password.match(regex)
  if (pwCheckResult != null || password == '') {
    return res.send({ result: "비밀번호는 숫자만 입력해주세요."})
  }


  try {
    const temp_postId = await Posts.find({})
      .sort("-postsId")
      .select("postsId")
      .limit(1);
    postsId = temp_postId[0].postsId + 1;
  } catch {
    postsId = 1;
  }

  //작성일자 서버에서 생성 후 DB 저장
  //이후 ejs에서 for문 돌면서 각각 연월일 변환 후 출력
  const date = Date.now();

  //getMonth등 변환하는 함수 사용위해 Date객체 생성
  //const date = new Date(date_now)

  isExist = await Posts.find({ postsId });
  if (isExist.length == 0) {

    //title, writer 입력하지 않은 경우 기본값 적용
    if (title == "" || null) {
      title = "제목 없음";
    }
    if (writer == "" || null) {
      writer = "익명";
    }
    await Posts.create({ postsId, title, writer, password, content, date });

    return res.send({ result: "포스팅 완료!" });
  }
  return res.send({ result: "포스팅 실패!" });
});

//포스팅 수정 시
//작성일자를 현재 일자로 수정하시겠습니까? 알럿 및 분기처리
//비밀번호 일치 체크
router.put("/posting_update", async (req, res, next) => {
  let put_data = req.body;

  //postsId가 존재하는지 null 체크
  if (req.body.postsId == null) {
    return res.send({ result: "해당 포스팅이 존재하지 않습니다." })
  }

  post = await Posts.findOne({ postsId: put_data.postsId });
  if (post == null) {
    return res.send({ result: "해당 포스팅이 존재하지 않습니다." })
  }

  let postsId = post.postsId;

  //postsId가 존재하는지 db 체크
  isExist = await Posts.find({ postsId });
  if (isExist.length !== 0) {

    //password 일치여부 체크
    if (put_data.password !== post.password) {
      return await res.send({ result: "패스워드가 다릅니다." });
    }

    if (put_data.date_check === "true") {
      const temp_date = Date.now();
      post.date = temp_date;
    }

    await Posts.updateOne(
      { postsId: postsId },
      {
        title: put_data.title,
        writer: put_data.writer,
        content: put_data.content,
        date: post.date
      }
    );
    return res.send({ result: "포스팅 수정 완료!" });
  }
  return res.send({ result: "해당 포스팅이 존재하지 않습니다." });
});

//포스팅 삭제 시
router.delete("/posting_delete", async (req, res, next) => {

  //postsId가 존재하는지 null 체크
  if (req.body.postsId == null) {
    return res.send({ result: "해당 포스팅은 이미 삭제되었습니다." })
  }
  
  let put_data = req.body;
  post = await Posts.findOne({ postsId: put_data.postsId });

  if (post == null) {
    return await res.send({ result: "해당 포스팅이 존재하지 않습니다." })
  }

  let postsId = post.postsId;

  //postsId가 존재하는지 db 체크
  isExist = await Posts.find({ postsId });
  if (isExist.length !== 0) {
    if (put_data.password !== post.password) {
      return res.send({ result: "패스워드가 다릅니다." });
    }
    await Posts.deleteOne({ postsId: postsId });
    return res.send({ result: "포스팅 삭제 완료!" });
  } else {
    return res.send({ result: "해당 포스팅은 이미 삭제되었습니다." });
  }
});

module.exports = router;
