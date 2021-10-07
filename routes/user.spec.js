const {valCheckId,valCheckPw,confirmPwCheck,router} = require('./users');
const supertest = require("supertest");
const connect = require("../schemas");
const User = require("../schemas/users");
const server = require('../app');

const userIds = [];
beforeAll(async () => {
    await connect();
    const user = await User.create({ nickname: 'something', password: '1234' });
    userIds.push(user._id);
});

test('닉네임은 3자 이상, 알파벳  대소문자, 숫자로만 이루어져야한다', () => {
  expect(valCheckId("Jason123")).toEqual(true); // 정상
  expect(valCheckId("한글닉네임")).toEqual(false);
  expect(valCheckId("question?")).toEqual(false);
  expect(valCheckId("s p a c e")).toEqual(false);
});

test('비밀번호는 최소 4자 이상이면서 닉네임에 동일한 값이 없어야한다.', () => {
  expect(valCheckPw("1234","Jason")).toEqual(true); // 정상
  expect(valCheckPw("1234","1234")).toEqual(false);
  expect(valCheckPw("123","kim")).toEqual(false);
  expect(valCheckPw("asd123","kkkasd123mmm")).toEqual(false);
});

test('비밀번호와 비밀번호확인에 입력된 값은 정확히 일치해야한다.', () => {
  expect(confirmPwCheck("1234","1234")).toEqual(true);
  expect(confirmPwCheck("1234","12345")).toEqual(false);
  expect(confirmPwCheck("12345","1234")).toEqual(false);
  expect(confirmPwCheck("asdasd123","asd123")).toEqual(false);
});

app = supertest(server);
test('DB에 존재하는 닉네임으로 회원가입 버튼을 누르면 "이미 가입된 닉네임이 있습니다."라는 에러메세지가 발생한다.', async() => {
  const res = await app.post('/api/users').send({
    nickname: 'something',
    password: '12345678',
    confirmPassword: '12345678',
  })
  expect(res.status).toBe(400);
  expect(res.text).toBe("{\"errorMessage\":\"이미 가입된 닉네임이 있습니다.\"}")
});

afterAll(async () => {
  await User.deleteMany({ _id: userIds });
})