var express = require("express");
var router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const jwt = require("jsonwebtoken");
const Users = require("../schemas/users");


//유효성체크 함수
const valCheckId = function (target_nickname){
  const regex_nick = /([a-z]|[A-Z]|[0-9]){3,}/g
  const nicknameCheckResult = target_nickname.match(regex_nick)

  return (nicknameCheckResult == target_nickname)
}

const valCheckPw = function (target_password, target_nickname) {
  if ((target_nickname.indexOf(target_password) == -1) && (target_password.length >= 4)) {
    return true;
  }
  return false;
}

const confirmPwCheck = function (target_password, target_confirmPassword) {
  if (target_password == target_confirmPassword) {
    return true;
  }
  return false;
}

//회원가입
router.post("/users", async(req, res) => {
  const {nickname, password, confirmPassword} = req.body;

  if (!confirmPwCheck(password, confirmPassword)) {
    res.status(400).send({
      errorMessage: '패스워드가 패스워드 확인란과 동일하지 않습니다.'
    });
    return;
  }

  //유효성 체크 결과는 배열에 담기므로 비교 시 형식까지 비교하지 않음 != 활용
  if (!valCheckId(nickname)) {
    res.status(400).send({
      errorMessage: '닉네임은 알파벳 대소문자와 숫자만 사용할 수 있으며, 최소 3자리 이상이어야 합니다.'
    });
    return;
  }

  //패스워드 유효성 체크
  if (!valCheckPw(password, nickname)) {
    res.status(400).send({
      errorMessage: '패스워드는 닉네임과 같은 내용이 포함될 수 없으며, 최소 4자리 이상이어야 합니다.'
    });
    return;
  }

  //중복 닉네임 여부 체크
  const existUsers = await Users.findOne({ nickname });
  if (existUsers) {
    res.status(400).send({
      errorMessage: '이미 가입된 닉네임이 있습니다.'
    });
    return;
  }

  const users = new Users({ nickname, password });
  await users.save();

  res.status(201).send({});
});

//로그인
router.post("/auth", async (req, res) => {
  const { nickname, password } = req.body;

  const users = await Users.findOne({ nickname, password }).exec();
  if (!users) {
    res.status(400).send({
      errorMessage: "닉네임 또는 패스워드가 잘못됐습니다.",
    });
    return;
  }

  const token = jwt.sign({ userId: nickname }, "jasonblog-secret-key");
  res.send({
    token,
  });
});

module.exports = router;
module.exports.valCheckId = valCheckId;
module.exports.valCheckPw = valCheckPw;
module.exports.confirmPwCheck = confirmPwCheck;