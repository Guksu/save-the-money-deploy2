const express = require("express");
const app = express();
const cors = require("cors");
const bcryptjs = require("bcryptjs");
const mysql = require("mysql");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  user: "admin",
  host: "database-1.cjn0ra3hldbu.ap-northeast-2.rds.amazonaws.com",
  password: "process.env.PASSWORD",
  database: "savethemoney",
  dateStrings: "data",
});
// 회원가입 //
app.post("/adduser", (req, res) => {
  const {
    body: { id, password },
  } = req;

  const hashPassword = bcryptjs.hashSync(password, 5, (err, hash) => {
    if (err) {
      console.log(err);
    }
  });

  db.query(
    "INSERT INTO userregister (userid, userpassword) VALUES (?,?)",
    [id, hashPassword],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(404).send();
      }
    }
  );
});

//로그인//
app.post("/login", async (req, res) => {
  const {
    body: { id, password },
  } = req;

  db.query("SELECT * FROM userregister WHERE userid=?", id, (err, resultId) => {
    if (err) {
      console.log(err);
    }

    if (resultId.length > 0) {
      if (
        bcryptjs.compareSync(
          password,
          resultId[0].userpassword,
          (error, resultPw) => {
            if (error) {
              console.log(error);
            }
          }
        )
      ) {
      } else {
        res.status(404).send();
      }
    } else {
      console.log("로그인실패");
      res.status(404).send();
    }
    res.status(200).send();
  });
});

//가계부 작성
app.post("/account", async (req, res) => {
  const {
    body: { date, profit, expense, profitSelect, expenseSelect, userid },
  } = req;

  if (profit !== 0) {
    db.query(
      `INSERT INTO  profit (userid, profit, date,category) VALUES (?,?,?,?)`,
      [userid, profit, date, profitSelect],
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(404).send();
        } else {
          console.log("성공");
        }
      }
    );
  }

  if (expense !== 0) {
    db.query(
      `INSERT INTO  expense (userid, date, expense,category) VALUES (?,?,?,?)`,
      [userid, date, expense, expenseSelect],
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(404).send();
        }
      }
    );
  }
});

//상세내역 확인
app.get("/showProfit", async (req, res) => {
  const {
    query: { userid },
  } = req;
  db.query(
    "SELECT * FROM profit WHERE userid=? ORDER BY date desc ",
    [userid],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result.length > 0) {
        res.send(result);
        console.log("수입내역 전송 성공");
      }
    }
  );
});

app.get("/showExpense", async (req, res) => {
  const {
    query: { userid },
  } = req;

  db.query(
    "SELECT * FROM expense WHERE userid=? ORDER BY date desc",
    [userid],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result.length > 0) {
        res.send(result);
        console.log("지출내역 전송 성공");
      }
    }
  );
});

//내역 삭제
app.post("/deleteProfit", async (req, res) => {
  const {
    body: { profitNo },
  } = req;

  db.query("DELETE FROM profit WHERE profitNo=?", profitNo, (err, result) => {
    if (err) {
      console.log(err);
    }
  });
});

app.post("/deleteExpense", async (req, res) => {
  const {
    body: { expenseNo },
  } = req;

  db.query(
    "DELETE FROM expense WHERE expenseNo=?",
    expenseNo,
    (err, result) => {
      if (err) {
        console.log(err);
      }
    }
  );
});

// home 표시내역
app.get("/allProfit", async (req, res) => {
  const {
    query: { userid, date },
  } = req;

  const findDate = `${date}%`;
  if (findDate !== `%`) {
    db.query(
      "SELECT sum(profit) as profit FROM profit where userid=? and date like ?",
      [userid, findDate],
      (err, result) => {
        if (err) {
          console.log(err);
        }
        if (result.length > 0) {
          res.send(result);
          console.log("총 수익내역 전송 성공");
        }
      }
    );
  }
});

app.get("/allExpense", async (req, res) => {
  const {
    query: { userid, date },
  } = req;

  const findDate = `${date}%`;
  if (findDate !== `%`) {
    db.query(
      "SELECT sum(expense) as expense FROM expense where userid=? and date like ?",
      [userid, findDate],
      (err, result) => {
        if (err) {
          console.log(err);
        }
        if (result.length > 0) {
          res.send(result);
          console.log("총 지출내역 전송 성공");
        }
      }
    );
  }
});

//home chart
app.get("/homeProfitChart", async (req, res) => {
  const {
    query: { userid, date },
  } = req;

  const findDate = `${date}%`;
  if (findDate !== `%`) {
    db.query(
      "SELECT *  FROM profit where userid=? and date like ?",
      [userid, findDate],
      (err, result) => {
        if (err) {
          console.log(err);
        }
        if (result.length > 0) {
          res.send(result);
        }
      }
    );
  }
});

app.get("/homeExpenseChart", async (req, res) => {
  const {
    query: { userid, date },
  } = req;

  const findDate = `${date}%`;
  if (findDate !== `%`) {
    db.query(
      "SELECT *  FROM expense where userid=? and date like ?",
      [userid, findDate],
      (err, result) => {
        if (err) {
          console.log(err);
        }
        if (result.length > 0) {
          res.send(result);
        }
      }
    );
  }
});

app.listen(process.env.PORT || PORT, () => {
  console.log("Server Start at Port 3306!🚀🚀");
});
