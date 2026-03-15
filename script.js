document.addEventListener('DOMContentLoaded', () => {
    const studentList = document.getElementById('studentList');
    const studentForm = document.getElementById('studentForm');
    const studentModal = document.getElementById('studentModal');
    const addStudentBtn = document.getElementById('addStudentBtn');
    const closeBtn = document.querySelector('.close');
    const exportDataBtn = document.getElementById('exportDataBtn');

    let students = JSON.parse(localStorage.getItem('english_students_p5')) || [];

    // Initialize the app
    function init() {
        renderStudents();
    }

    // Modal controls
    addStudentBtn.onclick = () => studentModal.style.display = "block";
    closeBtn.onclick = () => studentModal.style.display = "none";
    window.onclick = (event) => {
        if (event.target == studentModal) studentModal.style.display = "none";
    }

    // Create a new student
    studentForm.onsubmit = (e) => {
        e.preventDefault();
        const newStudent = {
            id: Date.now(),
            no: document.getElementById('studentNo').value,
            name: document.getElementById('studentName').value,
            scores: Array(10).fill(0),
            exams: [0, 0], // Midterm, Final
            attendance: false
        };

        students.push(newStudent);
        saveData();
        renderStudents();
        studentForm.reset();
        studentModal.style.display = "none";
    };

    // Save to LocalStorage
    function saveData() {
        localStorage.setItem('english_students_p5', JSON.stringify(students));
    }

    // Calculate total score
    function calculateTotal(student) {
        const assignmentSum = student.scores.reduce((a, b) => Number(a) + Number(b), 0);
        const examSum = student.exams.reduce((a, b) => Number(a) + Number(b), 0);
        return assignmentSum + examSum;
    }

    // Render students table
    function renderStudents() {
        studentList.innerHTML = '';
        
        // Sort students by number
        students.sort((a, b) => a.no - b.no);

        students.forEach((student, index) => {
            const tr = document.createElement('tr');
            
            let html = `
                <td>${student.no}</td>
                <td class="name-col">${student.name}</td>
            `;

            // Assignment score inputs (10 channels)
            student.scores.forEach((score, sIdx) => {
                html += `<td><input type="number" class="score-input" value="${score}" data-id="${student.id}" data-type="score" data-index="${sIdx}" min="0" max="10"></td>`;
            });

            // Exam score inputs (2 channels)
            student.exams.forEach((score, eIdx) => {
                html += `<td><input type="number" class="score-input" value="${score}" data-id="${student.id}" data-type="exam" data-index="${eIdx}" min="0" max="30"></td>`;
            });

            // Attendance checkbox
            html += `
                <td><input type="checkbox" ${student.attendance ? 'checked' : ''} data-id="${student.id}" data-type="attendance"></td>
                <td class="total-cell" id="total-${student.id}">${calculateTotal(student)}</td>
                <td><button class="btn-delete" data-id="${student.id}">🗑️</button></td>
            `;

            tr.innerHTML = html;
            studentList.appendChild(tr);
        });

        attachEventListeners();
    }

    function attachEventListeners() {
        // Handle score and exam inputs
        document.querySelectorAll('.score-input').forEach(input => {
            input.onchange = (e) => {
                const id = e.target.getAttribute('data-id');
                const type = e.target.getAttribute('data-type');
                const index = e.target.getAttribute('data-index');
                const value = Math.max(0, e.target.value);
                
                const student = students.find(s => s.id == id);
                if (type === 'score') {
                    student.scores[index] = value;
                } else if (type === 'exam') {
                    student.exams[index] = value;
                }
                
                document.getElementById(`total-${id}`).innerText = calculateTotal(student);
                saveData();
            };
        });

        // Handle attendance
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.onchange = (e) => {
                const id = e.target.getAttribute('data-id');
                const student = students.find(s => s.id == id);
                student.attendance = e.target.checked;
                saveData();
            };
        });

        // Handle delete
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('คุณต้องการลบข้อมูลนักเรียนคนนี้ใช่หรือไม่?')) {
                    students = students.filter(s => s.id != id);
                    saveData();
                    renderStudents();
                }
            };
        });
    }

    // Export Data (Simple way to save)
    exportDataBtn.onclick = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "english_scores_p5.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        alert('บันทึกข้อมูลสำเร็จ! ตรวจสอบที่โฟลเดอร์ดาวน์โหลดของคุณ');
    };

    init();
});
