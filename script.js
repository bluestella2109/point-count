"use strict";


/* =========================
   Firebase
========================= */

const db = window.firebaseDB;

const {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} = window.firebaseFunctions;


/* =========================
   Firestoreコレクション
========================= */

const scoresCollection =
    collection(db, "scores");


/* =========================
   DOM
========================= */

const inputTab =
    document.getElementById("inputTab");

const listTab =
    document.getElementById("listTab");


const inputScreen =
    document.getElementById("inputScreen");

const listScreen =
    document.getElementById("listScreen");


const numberInput =
    document.getElementById("numberInput");

const peopleSelect =
    document.getElementById("peopleSelect");


const scoreDisplay =
    document.getElementById("scoreDisplay");


const submitButton =
    document.getElementById("submitButton");

const clearButton =
    document.getElementById("clearButton");

const backButton =
    document.getElementById("backButton");


const inputMessage =
    document.getElementById("inputMessage");


const scoreTableBody =
    document.getElementById("scoreTableBody");

const totalCount =
    document.getElementById("totalCount");

const emptyMessage =
    document.getElementById("emptyMessage");


const clearAllButton =
    document.getElementById("clearAllButton");


/* =========================
   点数
========================= */

let score = "";


/* =========================
   番号
========================= */

numberInput.value = "G-001";


/* =========================
   番号チェック
========================= */

numberInput.addEventListener(
    "input",
    () => {

        numberInput.value =
            numberInput.value.toUpperCase();

    }
);


/* =========================
   タブ切り替え
========================= */

inputTab.addEventListener(
    "click",
    () => {

        inputTab.classList.add("active");

        listTab.classList.remove("active");


        inputScreen.classList.add("active");

        listScreen.classList.remove("active");

    }
);


listTab.addEventListener(
    "click",
    () => {

        listTab.classList.add("active");

        inputTab.classList.remove("active");


        listScreen.classList.add("active");

        inputScreen.classList.remove("active");

    }
);


/* =========================
   テンキー
========================= */

const keys =
    document.querySelectorAll(
        ".key[data-number]"
    );


keys.forEach(
    key => {

        key.addEventListener(
            "click",
            () => {

                const number =
                    key.dataset.number;


                /*
                 * 最大9999点
                 */

                if (score.length >= 4) {

                    return;

                }


                /*
                 * 最初の0
                 */

                if (score === "0") {

                    score = number;

                } else {

                    score += number;

                }


                updateScoreDisplay();

            }
        );

    }
);


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
   次の番号
========================= */

function getNextNumber(number) {

    const match =
        number.match(
            /^G-(\d{3})$/
        );


    if (!match) {

        return "G-001";

    }


    const current =
        Number(match[1]);


    const next =
        current + 1;


    return (
        "G-" +
        String(next).padStart(3, "0")
    );

}


/* =========================
   送信
========================= */

submitButton.addEventListener(
    "click",
    async () => {

        const number =
            numberInput.value
                .trim()
                .toUpperCase();


        const people =
            peopleSelect.value;


        /* -------------------------
           番号
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
           人数
        ------------------------- */

        if (!people) {

            showMessage(
                "人数を選択してください。",
                "error"
            );

            return;

        }


        /* -------------------------
           点数
        ------------------------- */

        /*
         * score === ""
         * のときだけエラー。
         *
         * 0は有効。
         */

        if (score === "") {

            showMessage(
                "点数を入力してください。",
                "error"
            );

            return;

        }


        /* -------------------------
           送信中
        ------------------------- */

        submitButton.disabled = true;

        submitButton.textContent =
            "送信中";


        try {

            /* -------------------------
               同じ番号を検索
            ------------------------- */

            const snapshot =
                await getDocs(
                    scoresCollection
                );


            let duplicate = false;


            snapshot.forEach(
                item => {

                    const data =
                        item.data();


                    if (
                        data.number === number &&
                        data.status !== "completed"
                    ) {

                        duplicate = true;

                    }

                }
            );


            if (duplicate) {

                showMessage(
                    "この番号はすでに登録されています。",
                    "error"
                );

                return;

            }


            /* -------------------------
               Firebaseへ保存
            ------------------------- */

            await addDoc(
                scoresCollection,
                {

                    number: number,

                    people: Number(people),

                    score: Number(score),

                    status: "waiting",

                    createdAt:
                        serverTimestamp()

                }
            );


            /* -------------------------
               次の番号
            ------------------------- */

            const nextNumber =
                getNextNumber(number);


            numberInput.value =
                nextNumber;


            /* -------------------------
               入力リセット
            ------------------------- */

            score = "";

            peopleSelect.value = "";

            updateScoreDisplay();


            /* -------------------------
               メッセージ
            ------------------------- */

            showMessage(
                `${number} を送信しました。次は ${nextNumber} です。`,
                "success"
            );


        } catch (error) {

            console.error(
                "送信エラー:",
                error
            );


            showMessage(
                "送信に失敗しました。Firebaseの設定を確認してください。",
                "error"
            );

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "点数を送信";

        }

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
        4000
    );

}


/* =========================
   リアルタイム一覧
========================= */

const scoresQuery =
    query(
        scoresCollection,
        orderBy(
            "createdAt",
            "asc"
        )
    );


onSnapshot(
    scoresQuery,
    snapshot => {

        const scores = [];


        snapshot.forEach(
            item => {

                scores.push({

                    id: item.id,

                    ...item.data()

                });

            }
        );


        /*
         * 番号順
         */

        scores.sort(
            (a, b) => {

                const aNumber =
                    Number(
                        a.number
                            .replace("G-", "")
                    );


                const bNumber =
                    Number(
                        b.number
                            .replace("G-", "")
                    );


                return (
                    aNumber - bNumber
                );

            }
        );


        renderScores(scores);

    },
    error => {

        console.error(
            "一覧取得エラー:",
            error
        );

    }
);


/* =========================
   一覧表示
========================= */

function renderScores(scores) {

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


    scores.forEach(
        item => {

            const row =
                document.createElement("tr");


            /* -------------------------
               番号
            ------------------------- */

            const numberCell =
                document.createElement("td");

            numberCell.textContent =
                item.number;


            /* -------------------------
               人数
            ------------------------- */

            const peopleCell =
                document.createElement("td");

            peopleCell.textContent =
                `${item.people}人`;


            /* -------------------------
               点数
            ------------------------- */

            const scoreCell =
                document.createElement("td");

            scoreCell.className =
                "score-cell";

            scoreCell.textContent =
                `${item.score}点`;


            /* -------------------------
               状態
            ------------------------- */

            const statusCell =
                document.createElement("td");


            const status =
                document.createElement("span");


            if (
                item.status === "completed"
            ) {

                status.className =
                    "status completed";

                status.textContent =
                    "完了";

            } else {

                status.className =
                    "status waiting";

                status.textContent =
                    "未確認";

            }


            statusCell.appendChild(
                status
            );


            /* -------------------------
               操作
            ------------------------- */

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


            /* -------------------------
               行へ追加
            ------------------------- */

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

        }
    );

}


/* =========================
   完了
========================= */

async function completeScore(id) {

    try {

        const target =
            doc(
                db,
                "scores",
                id
            );


        await updateDoc(
            target,
            {

                status:
                    "completed",

                completedAt:
                    serverTimestamp()

            }
        );


    } catch (error) {

        console.error(
            "完了処理エラー:",
            error
        );

        alert(
            "完了処理に失敗しました。"
        );

    }

}


/* =========================
   全データ削除
========================= */

clearAllButton.addEventListener(
    "click",
    async () => {

        const confirmed =
            confirm(
                "登録されている点数をすべて削除しますか？"
            );


        if (!confirmed) {

            return;

        }


        try {

            const snapshot =
                await getDocs(
                    scoresCollection
                );


            const deletePromises = [];


            snapshot.forEach(
                item => {

                    deletePromises.push(
                        deleteDoc(
                            doc(
                                db,
                                "scores",
                                item.id
                            )
                        )
                    );

                }
            );


            await Promise.all(
                deletePromises
            );


        } catch (error) {

            console.error(
                "削除エラー:",
                error
            );


            alert(
                "データの削除に失敗しました。"
            );

        }

    }
);
