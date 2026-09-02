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
    initializeApp(
        firebaseConfig
    );


const db =
    getFirestore(
        app
    );



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
    document.getElementById(
        "inputTab"
    );


const listTab =
    document.getElementById(
        "listTab"
    );


const inputScreen =
    document.getElementById(
        "inputScreen"
    );


const listScreen =
    document.getElementById(
        "listScreen"
    );


const numberInput =
    document.getElementById(
        "numberInput"
    );


const peopleSelect =
    document.getElementById(
        "peopleSelect"
    );


const scoreDisplay =
    document.getElementById(
        "scoreDisplay"
    );


const submitButton =
    document.getElementById(
        "submitButton"
    );


const clearButton =
    document.getElementById(
        "clearButton"
    );


const backButton =
    document.getElementById(
        "backButton"
    );


const inputMessage =
    document.getElementById(
        "inputMessage"
    );


const waitingTableBody =
    document.getElementById(
        "waitingTableBody"
    );


const completedTableBody =
    document.getElementById(
        "completedTableBody"
    );


const waitingCount =
    document.getElementById(
        "waitingCount"
    );


const completedCount =
    document.getElementById(
        "completedCount"
    );


const waitingEmpty =
    document.getElementById(
        "waitingEmpty"
    );


const completedEmpty =
    document.getElementById(
        "completedEmpty"
    );



/* ==================================================
   点数
================================================== */

let score = "";



/* ==================================================
   初期番号
================================================== */

numberInput.value =
    "G-001";



/* ==================================================
   タブ切り替え
================================================== */

inputTab.addEventListener(
    "click",
    () => {

        inputTab.classList.add(
            "active"
        );

        listTab.classList.remove(
            "active"
        );


        inputScreen.classList.add(
            "active"
        );

        listScreen.classList.remove(
            "active"
        );

    }
);



listTab.addEventListener(
    "click",
    () => {

        listTab.classList.add(
            "active"
        );

        inputTab.classList.remove(
            "active"
        );


        listScreen.classList.add(
            "active"
        );

        inputScreen.classList.remove(
            "active"
        );

    }
);



/* ==================================================
   番号入力
================================================== */

numberInput.addEventListener(
    "input",
    () => {

        numberInput.value =
            numberInput.value
                .toUpperCase();

    }
);



/* ==================================================
   テンキー
================================================== */

const keys =
    document.querySelectorAll(
        ".key[data-number]"
    );


keys.forEach(
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


                updateScoreDisplay();

            }
        );

    }
);



/* ==================================================
   Cボタン
================================================== */

clearButton.addEventListener(
    "click",
    () => {

        score = "";

        updateScoreDisplay();

    }
);



/* ==================================================
   戻るボタン
================================================== */

backButton.addEventListener(
    "click",
    () => {

        score =
            score.slice(
                0,
                -1
            );


        updateScoreDisplay();

    }
);



/* ==================================================
   点数表示
================================================== */

function updateScoreDisplay() {

    scoreDisplay.textContent =
        score === ""
            ? "0"
            : score;

}



/* ==================================================
   現在の番号を確認
================================================== */

async function getCurrentNumber() {

    const snapshot =
        await getDoc(
            counterRef
        );


    if (
        !snapshot.exists()
    ) {

        return 1;

    }


    const data =
        snapshot.data();


    return (
        Number(
            data.nextNumber
        ) || 1
    );

}



/* ==================================================
   番号をFirebaseで確定
================================================== */

async function reserveNumber(
    inputNumber
) {

    return await runTransaction(
        db,
        async transaction => {


            const counterSnapshot =
                await transaction.get(
                    counterRef
                );


            let nextNumber =
                1;


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


            /*
             * 入力された番号
             */

            const match =
                inputNumber.match(
                    /^G-(\d{3})$/
                );


            if (!match) {

                throw new Error(
                    "INVALID_NUMBER"
                );

            }


            const inputNumberValue =
                Number(
                    match[1]
                );


            /*
             * Firebase側の番号と
             * 入力番号が一致しているか確認
             */

            if (
                inputNumberValue !==
                nextNumber
            ) {

                throw new Error(
                    `NUMBER_MISMATCH:${nextNumber}`
                );

            }


            /*
             * 次の番号へ
             */

            transaction.set(
                counterRef,
                {

                    nextNumber:
                        nextNumber + 1

                },
                {

                    merge:
                        true

                }
            );


            /*
             * 今回使用する番号
             */

            return inputNumber;

        }
    );

}



/* ==================================================
   送信
================================================== */

submitButton.addEventListener(
    "click",
    async () => {


        const number =
            numberInput.value
                .trim()
                .toUpperCase();


        const people =
            peopleSelect.value;



        /* =========================
           番号チェック
        ========================== */

        if (
            !/^G-\d{3}$/.test(
                number
            )
        ) {

            showMessage(
                "番号は G-001 の形式で入力してください。",
                "error"
            );


            numberInput.focus();


            return;

        }



        /* =========================
           人数チェック
        ========================== */

        if (
            !people
        ) {

            showMessage(
                "人数を選択してください。",
                "error"
            );


            return;

        }



        /* =========================
           点数チェック
        ========================== */

        /*
         * 空欄だけエラー。
         * 0点は正常に送信可能。
         */

        if (
            score === ""
        ) {

            showMessage(
                "点数を入力してください。",
                "error"
            );


            return;

        }



        /* =========================
           送信中
        ========================== */

        submitButton.disabled =
            true;


        submitButton.textContent =
            "送信中";



        try {


            /* =========================
               Firebaseで番号を確定
            ========================== */

            const registeredNumber =
                await reserveNumber(
                    number
                );



            /* =========================
               点数を保存
            ========================== */

            await addDoc(
                scoresCollection,
                {

                    number:
                        registeredNumber,

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



            /* =========================
               次の番号を取得
            ========================== */

            const nextNumber =
                await getCurrentNumber();



            numberInput.value =
                "G-" +
                String(
                    nextNumber
                ).padStart(
                    3,
                    "0"
                );



            /* =========================
               入力リセット
            ========================== */

            score = "";


            peopleSelect.value =
                "";


            updateScoreDisplay();



            /* =========================
               成功
            ========================== */

            showMessage(
                `${registeredNumber} を登録しました。`,
                "success"
            );


        } catch (
            error
        ) {


            console.error(
                "送信エラー:",
                error
            );



            /* =========================
               番号が違う
            ========================== */

            if (
                error.message.startsWith(
                    "NUMBER_MISMATCH:"
                )
            ) {


                const correctNumber =
                    Number(
                        error.message.split(
                            ":"
                        )[1]
                    );


                const correctText =
                    "G-" +
                    String(
                        correctNumber
                    ).padStart(
                        3,
                        "0"
                    );


                numberInput.value =
                    correctText;


                showMessage(
                    `現在の番号は ${correctText} です。番号を更新しました。`,
                    "error"
                );


            } else {


                showMessage(
                    "送信に失敗しました。Firebaseの設定を確認してください。",
                    "error"
                );

            }


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
   Firebaseリアルタイム一覧
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
         * 番号順に並べる
         */

        scores.sort(
            (a, b) => {


                const aNumber =
                    Number(
                        String(
                            a.number
                        ).replace(
                            "G-",
                            ""
                        )
                    );


                const bNumber =
                    Number(
                        String(
                            b.number
                        ).replace(
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
            "一覧取得エラー:",
            error
        );


        waitingEmpty.textContent =
            "Firebaseからデータを取得できません。";

    }

);



/* ==================================================
   一覧表示
================================================== */

function renderScores(
    scores
) {


    /*
     * 表を空にする
     */

    waitingTableBody.innerHTML =
        "";

    completedTableBody.innerHTML =
        "";



    /*
     * 未完了
     */

    const waitingScores =
        scores.filter(
            item =>
                item.status !==
                "completed"
        );



    /*
     * 完了
     */

    const completedScores =
        scores.filter(
            item =>
                item.status ===
                "completed"
        );



    /*
     * 件数
     */

    waitingCount.textContent =
        `${waitingScores.length}件`;


    completedCount.textContent =
        `${completedScores.length}件`;



    /*
     * 未完了がない
     */

    if (
        waitingScores.length === 0
    ) {

        waitingEmpty.style.display =
            "block";

    } else {

        waitingEmpty.style.display =
            "none";

    }



    /*
     * 完了がない
     */

    if (
        completedScores.length === 0
    ) {

        completedEmpty.style.display =
            "block";

    } else {

        completedEmpty.style.display =
            "none";

    }



    /* ==================================================
       未完了一覧
    ================================================== */

    waitingScores.forEach(
        item => {


            const row =
                document.createElement(
                    "tr"
                );



            /* 番号 */

            const numberCell =
                document.createElement(
                    "td"
                );


            numberCell.textContent =
                item.number;



            /* 人数 */

            const peopleCell =
                document.createElement(
                    "td"
                );


            peopleCell.textContent =
                `${item.people}人`;



            /* 点数 */

            const scoreCell =
                document.createElement(
                    "td"
                );


            scoreCell.className =
                "score-cell";


            scoreCell.textContent =
                `${item.score}点`;



            /* 操作 */

            const actionCell =
                document.createElement(
                    "td"
                );


            const completeButton =
                document.createElement(
                    "button"
                );


            completeButton.type =
                "button";


            completeButton.className =
                "complete-button";


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



            actionCell.appendChild(
                completeButton
            );



            /* 行 */

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
                actionCell
            );



            waitingTableBody.appendChild(
                row
            );

        }
    );



    /* ==================================================
       完了一覧
    ================================================== */

    completedScores.forEach(
        item => {


            const row =
                document.createElement(
                    "tr"
                );



            /* 番号 */

            const numberCell =
                document.createElement(
                    "td"
                );


            numberCell.textContent =
                item.number;



            /* 人数 */

            const peopleCell =
                document.createElement(
                    "td"
                );


            peopleCell.textContent =
                `${item.people}人`;



            /* 点数 */

            const scoreCell =
                document.createElement(
                    "td"
                );


            scoreCell.className =
                "score-cell";


            scoreCell.textContent =
                `${item.score}点`;



            /* 状態 */

            const statusCell =
                document.createElement(
                    "td"
                );


            const status =
                document.createElement(
                    "span"
                );


            status.className =
                "completed-label";


            status.textContent =
                "完了";


            statusCell.appendChild(
                status
            );



            /* 行 */

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



            completedTableBody.appendChild(
                row
            );

        }
    );

}



/* ==================================================
   完了処理
================================================== */

async function completeScore(
    id
) {


    const confirmed =
        confirm(
            "この点数を確認して完了にしますか？"
        );


    if (
        !confirmed
    ) {

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


    } catch (
        error
    ) {


        console.error(
            "完了処理エラー:",
            error
        );


        alert(
            "完了処理に失敗しました。"
        );

    }

}
