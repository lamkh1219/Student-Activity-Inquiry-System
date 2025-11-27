// 等待整個網頁文件都載入完成後再執行
document.addEventListener("DOMContentLoaded", () => {

    // 找到 HTML 中的重要元素
    const csvUpload = document.getElementById("csv-upload"); // 新增
    const controlsContainer = document.getElementById("controls-container"); // 新增
    
    const daySelect = document.getElementById("day-select");
    const classSelect = document.getElementById("class-select");
    const classNoInput = document.getElementById("classno-input");
    const findStudentBtn = document.getElementById("find-student-btn");
    const resetBtn = document.getElementById("reset-btn");
    const tableBody = document.querySelector("#data-table tbody");
    
    let allStudentData = []; // 用來儲存從 CSV 讀取的所有資料

    /**
     * 步驟 1: (新) 監聽檔案上傳事件
     * 當使用者選擇了一個檔案時觸發
     */
    csvUpload.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.log("沒有選擇檔案。");
            return;
        }
        
        // 呼叫 PapaParse 來解析這個檔案
        parseCSV(file);
    });

    /**
     * 步驟 2: (新) 解析 CSV 檔案的函式
     * (取代了舊的 loadCSV)
     */
    function parseCSV(file) {
        Papa.parse(file, {
            // "download: true" 已不再需要，因為我們是直接傳遞檔案
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                allStudentData = results.data;
                console.log("CSV 資料已成功解析:", allStudentData);
                
                // 1. 填滿班級下拉選單
                populateClassDropdown();

                // 2. (重要!) 顯示隱藏的篩選器和表格
                controlsContainer.style.display = "block";
                
                // 3. 重設所有欄位，清空舊的查詢結果
                resetAllFields();
                alert("檔案上傳成功！現在可以使用篩選器了。");
            },
            error: (err) => {
                console.error("解析 CSV 時發生錯誤:", err);
                alert("無法解析此 CSV 檔案。請確保檔案格式正確且未損毀。");
            }
        });
    }

    /**
     * 步驟 3: (更新) 填滿班級下拉選單
     * (新增了清空舊選項的邏輯)
     */
    function populateClassDropdown() {
        // (新) 在重新填入之前，先清空舊的班級選項
        // 我們從 1 開始，保留第一個 "-- 請先選擇班級 --"
        while (classSelect.options.length > 1) {
            classSelect.remove(1);
        }

        const allClasses = new Set();
        allStudentData.forEach(student => {
            if (student.Class) {
                allClasses.add(student.Class);
            }
        });

        const sortedClasses = Array.from(allClasses).sort();

        sortedClasses.forEach(className => {
            const option = document.createElement("option");
            option.value = className;
            option.textContent = className;
            classSelect.appendChild(option);
        });
    }

    /**
     * 步驟 4: 顯示資料的通用函式 (無變動)
     */
    function displayData(dataToShow) {
        tableBody.innerHTML = "";

        if (!dataToShow || dataToShow.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5">查無資料。</td></tr>`;
            return;
        }

        dataToShow.forEach(student => {
            const row = document.createElement("tr");
            const classNo = student.ClassNo ? student.ClassNo : "";

            row.innerHTML = `
                <td>${student.Day}</td>
                <td>${student.Name}</td>
                <td>${student.Class}</td>
                <td>${classNo}</td>
                <td>${student.Activity}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    /**
     * 步驟 5: (新) 建立一個重設所有欄位的函式
     */
    function resetAllFields() {
        daySelect.value = "";
        classSelect.value = "";
        classNoInput.value = "";
        tableBody.innerHTML = ""; // 清空表格
    }


    /**
     * 步驟 6: 設定事件監聽器
     */

    // (A) 監聽 "依星期篩選"
    daySelect.addEventListener("change", () => {
        classSelect.value = "";
        classNoInput.value = "";
        const selectedDay = daySelect.value;
        if (!selectedDay) {
            tableBody.innerHTML = "";
            return;
        }
        const filteredData = allStudentData.filter(student => student.Day === selectedDay);
        displayData(filteredData);
    });

    // (B) 監聽 "查詢學生" 按鈕
    findStudentBtn.addEventListener("click", () => {
        const selectedClass = classSelect.value;
        const enteredClassNo = classNoInput.value.trim();

        if (!selectedClass || !enteredClassNo) {
            alert("請同時選擇「班級」並輸入「學號」。");
            return;
        }
        
        daySelect.value = "";
        const filteredData = allStudentData.filter(student => {
            return student.Class === selectedClass && student.ClassNo === enteredClassNo;
        });
        displayData(filteredData);
    });

    // (C) 監聽 "重設" 按鈕
    resetBtn.addEventListener("click", () => {
        resetAllFields(); // 呼叫新的重設函式
    });

    // (重要!)
    // 我們不再需要網頁載入時自動執行 loadCSV()
    // loadCSV(); // <-- 刪除或註解掉這一行

});