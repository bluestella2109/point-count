"use strict";


/* =========================
   設定
========================= */

const STORAGE_KEY = "festivalScoreData";
const NUMBER_KEY = "festivalCurrentNumber";


/* =========================
   DOM
========================= */

const inputTab = document.getElementById("inputTab");
const listTab = document.getElementById("listTab");

const inputScreen = document.getElementById("inputScreen");
const listScreen = document.getElementById("listScreen");

const numberInput = document.getElementById("numberInput");
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
   初期番号
========================= */

function getCurrentNumber() {

    const savedNumber =
        localStorage.getItem(NUMBER_KEY);

    if (savedNumber) {
        return savedNumber;
    }

    localStorage.setItem(
        NUMBER_KEY,
        "G-001"
    );

    return "G-001";
}


numberInput.value = getCurrentNumber();


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
   番号の形式チェック
========================= */

numberInput.addEventListener(
    "input",
    () => {

        numberInput.value =
            numberInput.value.toUpperCase();

    }
);


/* =========================
   テンキー
========================= */

const keys =
    document.querySelectorAll(
        ".key[data-number]"
    );


keys.forEach(key => {

    key.addEventListener("click", () => {

        const number =
            key.dataset.number;


        /*
         * 点数の最大値を9999点
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

clearButton.addEventListener(
    "click",
    () => {

        score = "";

        updateScoreDisplay();

    }
);


/* =========================
   戻るボタン
========================= */

backButton.addEventListener(
    "click",
    () => {

        score =
            score.slice(0, -1);

        updateScoreDisplay();

    }
);


/* =========================
   点数表示
========================= */

function updateScoreDisplay() {

    scoreDisplay.textContent =
        score === ""
            ? "0"
            : score;

}


/* =========================
   データ取得
========================= */

function getScores() {

    const data =
        localStorage.getItem(
            STORAGE_KEY
        );


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
   次の番号を作る
========================= */

function getNextNumber(number) {

    /*
     * G-001 → 001
     */

    const match =
        number.match(/^G-(\d{3})$/);


    if (!match) {

        return "G-001";

    }


    const current =
        Number(match[1]);


    const next =
        current + 1;


    return `G-${String(next).padStart(3, "0")}`;

}


/* =========================
   送信
========================= */

submitButton.addEventListener(
    "click",
    () => {

        const number =
            numberInput.value
                .trim()
                .toUpperCase();


        const people =
            peopleSelect.value;


        /* -------------------------
           番号チェック
        ------------------------- */

        if (
            !/^G-\d{3}$/.test(number)
        ) {

            showMessage(
                "番号は G-001 の形式で入力してください。",
                "error"
            );

            numberInput.focus();

            return;

        }


        /* -------------------------
           人数チェック
        ------------------------- */

        if (!people) {

            showMessage(
                "人数を選択してください。",
                "error"
            );

            return;

        }


        /* -------------------------
           点数チェック
        ------------------------- */
         if (score === "") {
             showMessage(
                 "点数を入力してください。",
                 "error"
             );
         
             return;
         }
        /* -------------------------
           既存番号チェック
        ------------------------- */

        const scores =
            getScores();


        const alreadyExists =
            scores.some(
                item =>
                    item.number === number &&
                    item.status !== "completed"
            );


        if (alreadyExists) {

            showMessage(
                "この番号はすでに登録されています。",
                "error"
            );

            return;

        }


        /* -------------------------
           新しいデータ
        ------------------------- */

        const newData = {

            id: Date.now(),

            number: number,

            people: Number(people),

            score: Number(score),

            status: "waiting",

            createdAt:
                new Date().toISOString()

        };


        scores.push(newData);


        /*
         * 番号順に並べる
         */

        scores.sort(
            (a, b) => {

                const aNumber =
                    Number(
                        a.number.replace(
                            "G-",
                            ""
                        )
                    );

                const bNumber =
                    Number(
                        b.number.replace(
                            "G-",
                            ""
                        )
                    );

                return aNumber - bNumber;

            }
        );


        saveScores(scores);


        /* -------------------------
           次の番号へ
        ------------------------- */

        const nextNumber =
            getNextNumber(number);


        localStorage.setItem(
            NUMBER_KEY,
            nextNumber
        );


        numberInput.value =
            nextNumber;


        /* -------------------------
           入力リセット
        ------------------------- */

        score = "";

        peopleSelect.value = "";

        updateScoreDisplay();


        /* -------------------------
           完了メッセージ
        ------------------------- */

        showMessage(
            `${number} を送信しました。次は ${nextNumber} です。`,
            "success"
        );


        renderScores();

    }
);


/* =========================
   メッセージ
========================= */

function showMessage(
    text,
    type
) {

    inputMessage.textContent =
        text;

    inputMessage.className =
        "message " + type;


    setTimeout(
        () => {

            inputMessage.textContent =
                "";

            inputMessage.className =
                "message";

        },
        3000
    );

}


/* =========================
   一覧表示
========================= */

function renderScores() {

    const scores =
        getScores();


    scoreTableBody.innerHTML =
        "";


    totalCount.textContent =
        scores.length;


    if (scores.length === 0) {

        emptyMessage.style.display =
            "block";

        return;

    }


    emptyMessage.style.display =
        "none";


    scores.forEach(item => {

        const row =
            document.createElement("tr");


        /* 番号 */

        const numberCell =
            document.createElement("td");

        numberCell.textContent =
            item.number;


        /* 人数 */

        const peopleCell =
            document.createElement("td");

        peopleCell.textContent =
            `${item.people}人`;


        /* 点数 */

        const scoreCell =
            document.createElement("td");

        scoreCell.className =
            "score-cell";

        scoreCell.textContent =
            `${item.score}点`;


        /* 状態 */

        const statusCell =
            document.createElement("td");


        const status =
            document.createElement("span");


        status.className =
            item.status === "completed"
                ? "status completed"
                : "status waiting";


        status.textContent =
            item.status === "completed"
                ? "完了"
                : "未確認";


        statusCell.appendChild(
            status
        );


        /* 操作 */

        const actionCell =
            document.createElement("td");


        const completeButton =
            document.createElement("button");


        completeButton.className =
            "complete-button";


        if (
            item.status === "completed"
        ) {

            completeButton.textContent =
                "完了済み";

            completeButton.disabled =
                true;

        } else {

            completeButton.textContent =
                "確認して完了";


            completeButton.addEventListener(
                "click",
                () => {

                    completeScore(
                        item.id
                    );

                }
            );

        }


        actionCell.appendChild(
            completeButton
        );


        /* 行へ追加 */

        row.appendChild(
            numberCell
        );

        row.appendChild(
            peopleCell
        );

        row.appendChild(
            scoreCell
        );

        row.appendChild(
            statusCell
        );

        row.appendChild(
            actionCell
        );


        scoreTableBody.appendChild(
            row
        );

    });

}


/* =========================
   完了処理
========================= */

function completeScore(id) {

    const scores =
        getScores();


    const target =
        scores.find(
            item =>
                item.id === id
        );


    if (!target) {
        return;
    }


    const confirmed =
        confirm(
            `${target.number} の点数を確認して完了にしますか？`
        );


    if (!confirmed) {
        return;
    }


    target.status =
        "completed";


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

        const scores =
            getScores();


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
