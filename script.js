"use strict";


/* =========================
   設定
========================= */

const STORAGE_KEY = "festivalScoreData";


/* =========================
   DOM
========================= */

const inputTab = document.getElementById("inputTab");
const listTab = document.getElementById("listTab");

const inputScreen = document.getElementById("inputScreen");
const listScreen = document.getElementById("listScreen");

const numberSelect = document.getElementById("numberSelect");
const peopleSelect = document.getElementById("peopleSelect");

const scoreDisplay = document.getElementById("scoreDisplay");

const submitButton = document.getElementById("submitButton");
const clearButton = document.getElementById("clearButton");
const backButton = document.getElementById("backButton");

const inputMessage = document.getElementById("inputMessage");

const scoreTableBody = document.getElementById("scoreTableBody");
const totalCount = document.getElementById("totalCount");
const emptyMessage = document.getElementById("emptyMessage");

const clearAllButton = document.getElementById("clearAllButton");


/* =========================
   点数
========================= */

let score = "";


/* =========================
   番号選択肢
========================= */

for (let i = 1; i <= 100; i++) {

    const option = document.createElement("option");

    option.value = i;
    option.textContent = `${i}番`;

    numberSelect.appendChild(option);
}


/* =========================
   初期化
========================= */

renderScores();


/* =========================
   タブ切り替え
========================= */

inputTab.addEventListener("click", () => {

    inputTab.classList.add("active");
    listTab.classList.remove("active");

    inputScreen.classList.add("active");
    listScreen.classList.remove("active");

});


listTab.addEventListener("click", () => {

    listTab.classList.add("active");
    inputTab.classList.remove("active");

    listScreen.classList.add("active");
    inputScreen.classList.remove("active");

    renderScores();

});


/* =========================
   テンキー
========================= */

const keys = document.querySelectorAll(".key[data-number]");

keys.forEach(key => {

    key.addEventListener("click", () => {

        const number = key.dataset.number;

        /*
         * 点数の最大値を9999点に設定
         */

        if (score.length >= 4) {
            return;
        }

        /*
         * 最初の0を防止
         */

        if (score === "0") {
            score = number;
        } else {
            score += number;
        }

        updateScoreDisplay();

    });

});


/* =========================
   Cボタン
========================= */

clearButton.addEventListener("click", () => {

    score = "";

    updateScoreDisplay();

});


/* =========================
   戻るボタン
========================= */

backButton.addEventListener("click", () => {

    score = score.slice(0, -1);

    updateScoreDisplay();

});


/* =========================
   点数表示
========================= */

function updateScoreDisplay() {

    scoreDisplay.textContent = score === "" ? "0" : score;

}


/* =========================
   データ取得
========================= */

function getScores() {

    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
        return [];
    }

    try {

        return JSON.parse(data);

    } catch (error) {

        console.error(error);

        return [];

    }

}


/* =========================
   データ保存
========================= */

function saveScores(data) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* =========================
   送信
========================= */

submitButton.addEventListener("click", () => {

    const number = numberSelect.value;
    const people = peopleSelect.value;

    /*
     * 入力チェック
     */

    if (!number) {

        showMessage(
            "番号を選択してください。",
            "error"
        );

        return;
    }


    if (!people) {

        showMessage(
            "人数を選択してください。",
            "error"
        );

        return;
    }


    if (!score || Number(score) < 0) {

        showMessage(
            "点数を入力してください。",
            "error"
        );

        return;
    }


    /*
     * 同じ番号が存在するか確認
     */

    const scores = getScores();

    const alreadyExists = scores.some(
        item =>
            item.number === Number(number) &&
            item.status !== "completed"
    );


    if (alreadyExists) {

        showMessage(
            "この番号はすでに登録されています。",
            "error"
        );

        return;
    }


    /*
     * 新しいデータ
     */

    const newData = {

        id: Date.now(),

        number: Number(number),

        people: Number(people),

        score: Number(score),

        status: "waiting",

        createdAt: new Date().toISOString()

    };


    scores.push(newData);

    /*
     * 番号順に並べる
     */

    scores.sort(
        (a, b) => a.number - b.number
    );


    saveScores(scores);


    /*
     * 入力をリセット
     */

    score = "";

    numberSelect.value = "";
    peopleSelect.value = "";

    updateScoreDisplay();


    showMessage(
        "点数を送信しました。",
        "success"
    );


    renderScores();

});


/* =========================
   メッセージ
========================= */

function showMessage(text, type) {

    inputMessage.textContent = text;

    inputMessage.className =
        "message " + type;


    setTimeout(() => {

        inputMessage.textContent = "";
        inputMessage.className = "message";

    }, 3000);

}


/* =========================
   一覧表示
========================= */

function renderScores() {

    const scores = getScores();

    scoreTableBody.innerHTML = "";

    totalCount.textContent = scores.length;


    if (scores.length === 0) {

        emptyMessage.style.display = "block";

        return;

    }


    emptyMessage.style.display = "none";


    scores.forEach(item => {

        const row = document.createElement("tr");


        /*
         * 番号
         */

        const numberCell = document.createElement("td");

        numberCell.textContent =
            `${item.number}番`;


        /*
         * 人数
         */

        const peopleCell = document.createElement("td");

        peopleCell.textContent =
            `${item.people}人`;


        /*
         * 点数
         */

        const scoreCell = document.createElement("td");

        scoreCell.className = "score-cell";

        scoreCell.textContent =
            `${item.score}点`;


        /*
         * 状態
         */

        const statusCell = document.createElement("td");

        const status = document.createElement("span");

        status.className =
            item.status === "completed"
                ? "status completed"
                : "status waiting";


        status.textContent =
            item.status === "completed"
                ? "完了"
                : "未確認";


        statusCell.appendChild(status);


        /*
         * 操作
         */

        const actionCell = document.createElement("td");

        const completeButton =
            document.createElement("button");

        completeButton.className =
            "complete-button";


        if (item.status === "completed") {

            completeButton.textContent = "完了済み";

            completeButton.disabled = true;

        } else {

            completeButton.textContent =
                "確認して完了";


            completeButton.addEventListener(
                "click",
                () => completeScore(item.id)
            );

        }


        actionCell.appendChild(completeButton);


        /*
         * 行に追加
         */

        row.appendChild(numberCell);

        row.appendChild(peopleCell);

        row.appendChild(scoreCell);

        row.appendChild(statusCell);

        row.appendChild(actionCell);


        scoreTableBody.appendChild(row);

    });

}


/* =========================
   完了処理
========================= */

function completeScore(id) {

    const scores = getScores();

    const target = scores.find(
        item => item.id === id
    );


    if (!target) {
        return;
    }


    const confirmed =
        confirm(
            `${target.number}番の点数を確認して完了にしますか？`
        );


    if (!confirmed) {
        return;
    }


    target.status = "completed";

    target.completedAt =
        new Date().toISOString();


    saveScores(scores);

    renderScores();

}


/* =========================
   全データ削除
========================= */

clearAllButton.addEventListener(
    "click",
    () => {

        const scores = getScores();

        if (scores.length === 0) {
            return;
        }


        const confirmed =
            confirm(
                "登録されている点数をすべて削除しますか？"
            );


        if (!confirmed) {
            return;
        }


        localStorage.removeItem(
            STORAGE_KEY
        );


        renderScores();

    }
);
