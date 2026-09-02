"use strict";


/* ==================================================
   Firebase SDK
================================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    query,
    orderBy,
    onSnapshot,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* ==================================================
   Firebase設定
================================================== */

const firebaseConfig = {

    apiKey:
        "AIzaSyBFxMSaBSoGkmqgwPHP_yU0c6D4FQY6tHQ",

    authDomain:
        "fastival-point-system.firebaseapp.com",

    projectId:
        "fastival-point-system",

    storageBucket:
        "fastival-point-system.firebasestorage.app",

    messagingSenderId:
        "348384076481",

    appId:
        "1:348384076481:web:549450c37c602d3b03ea40"

};


/* ==================================================
   Firebase初期化
================================================== */

const app =
    initializeApp(firebaseConfig);


const db =
    getFirestore(app);


/* ==================================================
   Firestore
================================================== */

const scoresCollection =
    collection(
        db,
        "scores"
    );


const counterRef =
    doc(
        db,
        "settings",
        "counter"
    );


/* ==================================================
   DOM
================================================== */

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


/* ==================================================
   点数
================================================== */

let score = "";


/* ==================================================
   初期番号
================================================== */

numberInput.value = "G-001";


/* ==================================================
   タブ
================================================== */

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


/* ==================================================
   テンキー
================================================== */

document
    .querySelectorAll(".key[data-number]")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const number =
                        button.dataset.number;


                    /*
                     * 最大4桁
                     */

                    if (
                        score.length >= 4
                    ) {

                        return;

                    }


                    /*
                     * 0だけの場合
                     */

                    if (
                        score === "0"
                    ) {

                        score =
                            number;

                    } else {

                        score +=
                            number;

                    }


                    updateScore();

                }
            );

        }
    );


/* ==================================================
   C
================================================== */

clearButton.addEventListener(
    "click",
    () => {

        score = "";

        updateScore();

    }
);


/* ==================================================
   戻る
================================================== */

backButton.addEventListener(
    "click",
    () => {

        score =
            score.slice(
                0,
                -1
            );

        updateScore();

    }
);


/* ==================================================
   点数表示
================================================== */

function updateScore() {

    scoreDisplay.textContent =
        score === ""
            ? "0"
            : score;

}


/* ==================================================
   次の番号を取得
================================================== */

async function getNextNumber() {

    return await runTransaction(
        db,
        async transaction => {

            const counterSnapshot =
                await transaction.get(
                    counterRef
                );


            let nextNumber = 1;


            if (
                counterSnapshot.exists()
            ) {

                const data =
                    counterSnapshot.data();


                nextNumber =
                    Number(
                        data.nextNumber
                    ) || 1;

            }


            transaction.set(
                counterRef,
                {

                    nextNumber:
                        nextNumber + 1

                },
                {
                    merge: true
                }
            );


            return (
                "G-" +
                String(
                    nextNumber
                ).padStart(
                    3,
                    "0"
                )
            );

        }
    );

}


/* ==================================================
   送信
================================================== */

submitButton.addEventListener(
    "click",
    async () => {

        const people =
            peopleSelect.value;


        /*
         * 人数
         */

        if (!people) {

            showMessage(
                "人数を選択してください。",
                "error"
            );

            return;

        }


        /*
         * 点数
         *
         * 空欄だけエラー。
         * 0点はOK。
         */

        if (score === "") {

            showMessage(
                "点数を入力してください。",
                "error"
            );

            return;

        }


        submitButton.disabled =
            true;

        submitButton.textContent =
            "送信中";


        try {

            /*
             * Firebaseから
             * 番号を取得
             */

            const number =
                await getNextNumber();


            /*
             * 点数を保存
             */

            await addDoc(
                scoresCollection,
                {

                    number:
                        number,

                    people:
                        Number(
                            people
                        ),

                    score:
                        Number(
                            score
                        ),

                    status:
                        "waiting",

                    createdAt:
                        serverTimestamp()

                }
            );


            /*
             * 次の番号を表示
             */

            const counter =
                await getDoc(
                    counterRef
                );


            let nextNumber =
                1;


            if (
                counter.exists()
            ) {

                nextNumber =
                    Number(
                        counter.data().nextNumber
                    );

            }


            numberInput.value =
                "G-" +
                String(
                    nextNumber
                ).padStart(
                    3,
                    "0"
                );


            /*
             * リセット
             */

            score = "";

            peopleSelect.value =
                "";

            updateScore();


            showMessage(
                `${number} を登録しました。`,
                "success"
            );


        } catch (error) {

            console.error(
                error
            );


            showMessage(
                "送信に失敗しました。",
                "error"
            );

        } finally {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "点数を送信";

        }

    }
);


/* ==================================================
   メッセージ
================================================== */

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


/* ==================================================
   リアルタイム一覧
================================================== */

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

                    id:
                        item.id,

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
                            .replace(
                                "G-",
                                ""
                            )
                    );


                const bNumber =
                    Number(
                        b.number
                            .replace(
                                "G-",
                                ""
                            )
                    );


                return (
                    aNumber -
                    bNumber
                );

            }
        );


        renderScores(
            scores
        );

    },

    error => {

        console.error(
            "一覧取得エラー",
            error
        );

        emptyMessage.textContent =
            "Firebaseからデータを取得できません。";

    }
);


/* ==================================================
   一覧
================================================== */

function renderScores(
    scores
) {

    scoreTableBody.innerHTML =
        "";


    totalCount.textContent =
        scores.length;


    if (
        scores.length === 0
    ) {

        emptyMessage.style.display =
            "block";

        return;

    }


    emptyMessage.style.display =
        "none";


    scores.forEach(
        item => {

            const row =
                document.createElement(
                    "tr"
                );


            /*
             * 番号
             */

            const numberCell =
                document.createElement(
                    "td"
                );

            numberCell.textContent =
                item.number;


            /*
             * 人数
             */

            const peopleCell =
                document.createElement(
                    "td"
                );

            peopleCell.textContent =
                item.people + "人";


            /*
             * 点数
             */

            const scoreCell =
                document.createElement(
                    "td"
                );

            scoreCell.className =
                "score-cell";

            scoreCell.textContent =
                item.score + "点";


            /*
             * 状態
             */

            const statusCell =
                document.createElement(
                    "td"
                );


            const status =
                document.createElement(
                    "span"
                );


            if (
                item.status === "completed"
            ) {

                status.className =
                    "status completed";

                status.textContent =
                    "完了";

            } else {

                status.className =
                    "status";

                status.textContent =
                    "未確認";

            }


            statusCell.appendChild(
                status
            );


            /*
             * 操作
             */

            const actionCell =
                document.createElement(
                    "td"
                );


            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "complete-button";


            if (
                item.status === "completed"
            ) {

                button.textContent =
                    "完了済み";

                button.disabled =
                    true;

            } else {

                button.textContent =
                    "確認して完了";


                button.addEventListener(
                    "click",
                    () => {

                        completeScore(
                            item.id
                        );

                    }
                );

            }


            actionCell.appendChild(
                button
            );


            /*
             * 行
             */

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


/* ==================================================
   完了
================================================== */

async function completeScore(
    id
) {

    const confirmed =
        confirm(
            "この点数を確認して完了にしますか？"
        );


    if (!confirmed) {

        return;

    }


    try {

        await updateDoc(
            doc(
                db,
                "scores",
                id
            ),
            {

                status:
                    "completed",

                completedAt:
                    serverTimestamp()

            }
        );

    } catch (error) {

        console.error(
            error
        );

        alert(
            "完了処理に失敗しました。"
        );

    }

}
