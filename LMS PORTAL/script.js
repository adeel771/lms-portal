   const appData = {
        users: [],
        classes: [],
        activities: []
    };
    
    
    let currentUser = null;
    let currentClass = null;
    
    
    function initApp() {
        loadData();
        setupEventListeners();
        createDemoData();
    }
    
    // data from localStorage
    function loadData() {
        const savedData = localStorage.getItem('classroomData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            appData.users = parsedData.users || [];
            appData.classes = parsedData.classes || [];
            appData.activities = parsedData.activities || [];
        }
    }
    
    // Save data to localStorage
    function saveData() {
        localStorage.setItem('classroomData', JSON.stringify(appData));
    }
    
    // demo data 
    function createDemoData() {
        if (appData.users.length > 0) return;
        
        // Create admin user - FIXED: Corrected email to match demo account info
        const adminUser = {
            id: generateId(),
            name: "adeel",
            email: "adeel@gmail.com", 
            password: "admin123",
            role: "admin",
            created: new Date().toISOString()
        };
        
        // teacher 
        const teacherUser = {
            id: generateId(),
            name: "uzair ali",
            email: "teacher@example.com",
            password: "teacher123",
            role: "teacher",
            created: new Date().toISOString()
        };
        
        //  student 
        const studentUser = {
            id: generateId(),
            name: "Zakir ullah",
            email: "student@example.com",
            password: "student123",
            role: "student",
            created: new Date().toISOString()
        };
        
        //  class
        const demoClass = {
            id: generateId(),
            name: "databse class 4TH semester",
            subject: "database",
            description: "database lab practice query of my sql",
            code: generateClassCode(),
            teacherId: teacherUser.id,
            students: [studentUser.id],
            assignments: [],
            attendance: {},
            created: new Date().toISOString()
        };
        
        // assignment
        const assignment = {
            id: generateId(),
            title: "Algebra Homework",
            description: "Solve the equations on page 45",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            maxPoints: 100,
            submissions: [
                {
                    studentId: studentUser.id,
                    points: 95,
                    submittedAt: new Date().toISOString()
                }
            ]
        };
        demoClass.assignments.push(assignment);
        
        //  record
        const today = new Date().toISOString().split('T')[0];
        demoClass.attendance[today] = [studentUser.id];
        
        
        appData.users.push(adminUser, teacherUser, studentUser);
        appData.classes.push(demoClass);
        
        
        addActivity(`${teacherUser.name} created class ${demoClass.name}`, 'class');
        addActivity(`${studentUser.name} joined class ${demoClass.name}`, 'class');
        addActivity(`${teacherUser.name} added assignment ${assignment.title}`, 'assignment');
        addActivity(`${teacherUser.name} marked attendance for ${today}`, 'attendance');
        
        saveData();
    }
    
    
    function addActivity(message, type) {
        const activity = {
            id: generateId(),
            message,
            type,
            timestamp: new Date().toISOString()
        };
        appData.activities.unshift(activity);
        saveData();
        return activity;
    }
    
    //  unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    //  code (6 characters)
    function generateClassCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    
    function setupEventListeners() {
        
        document.getElementById('login-form').addEventListener('submit', handleLogin);
        
        
        document.getElementById('admin-logout').addEventListener('click', logout);
        document.getElementById('teacher-logout').addEventListener('click', logout);
        document.getElementById('student-logout').addEventListener('click', logout);
        
        
        document.getElementById('add-teacher-btn').addEventListener('click', () => showModal('add-teacher-modal'));
        document.getElementById('add-teacher-form').addEventListener('submit', addTeacher);
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', switchTab);
        });
        document.getElementById('search-teacher').addEventListener('input', searchTeachers);
        
        

        document.getElementById('create-class-btn').addEventListener('click', () => showModal('create-class-modal'));
        document.getElementById('create-class-form').addEventListener('submit', createClass);
        
        // Student dashboard
        document.getElementById('join-class-btn').addEventListener('click', () => showModal('join-class-modal'));
        document.getElementById('join-class-form').addEventListener('submit', joinClass);
        
        // Class detail 
        document.getElementById('back-to-dashboard').addEventListener('click', goBackToDashboard);
        document.getElementById('add-student-btn').addEventListener('click', () => showAddStudentModal());
        document.getElementById('add-assignment-btn').addEventListener('click', () => showModal('add-assignment-modal'));
        document.getElementById('mark-attendance-btn').addEventListener('click', showMarkAttendanceModal);
        document.getElementById('add-assignment-form').addEventListener('submit', addAssignment);
        document.getElementById('save-attendance-btn').addEventListener('click', saveAttendance);
        
        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                closeModal(closeBtn.closest('.modal'));
            });
        });
        
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        });
        
        
        document.getElementById('fab-help').addEventListener('click', () => {
            alert('Welcome to Classroom Manager!\n\nUse the demo accounts to explore the system:\nAdmin: adeel@gmail.com / admin123\nTeacher: teacher@example.com / teacher123\nStudent: student@example.com / student123');
        });
    }
    
    // Handle login
    function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const role = document.getElementById('login-role').value;
        
        const user = appData.users.find(u => 
            u.email === email && u.password === password && u.role === role
        );
        
        if (user) {
            currentUser = user;
            addActivity(`${user.name} logged in`, 'system');
            
            
            if (user.role === 'admin') {
                showPage('admin-dashboard');
                renderAdminDashboard();
            } else if (user.role === 'teacher') {
                showPage('teacher-dashboard');
                renderTeacherDashboard();
            } else if (user.role === 'student') {
                showPage('student-dashboard');
                renderStudentDashboard();
            }
        } else {
            alert('Invalid email, password, or role. Please try again.');
        }
    }
    
    // Logout
    function logout() {
        addActivity(`${currentUser.name} logged out`, 'system');
        currentUser = null;
        currentClass = null;
        showPage('login-page');
    }
    
    
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }
    
    // Show modal
    function showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }
    
    // Close modal
    function closeModal(modal) {
        modal.classList.remove('active');
    }
    
    //  admin dashboard
    function renderAdminDashboard() {
        renderTeachers();
        renderActivities();
    }


    
    //  teachers list
    function renderTeachers() {
        const teachersList = document.getElementById('teachers-list');
        teachersList.innerHTML = '';
        
        const teachers = appData.users.filter(u => u.role === 'teacher');
        
        if (teachers.length === 0) {
            teachersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <h3>No Teachers Found</h3>
                    <p>Add your first teacher to get started.</p>
                </div>
            `;
            return;
        }
        
        teachers.forEach(teacher => {
            const teacherItem = document.createElement('div');
            teacherItem.className = 'student-item';
            teacherItem.innerHTML = `
                <div>
                    <strong>${teacher.name}</strong>
                    <div>${teacher.email}</div>
                </div>
                <button class="btn btn-danger" data-id="${teacher.id}">
                    <i class="fas fa-trash-alt"></i> Remove
                </button>
            `;
            teacherItem.querySelector('button').addEventListener('click', () => {
                if (confirm(`Are you sure you want to remove ${teacher.name}?`)) {
                    removeTeacher(teacher.id);
                }
            });
            teachersList.appendChild(teacherItem);
        });
    }
    
    // Render activities
    function renderActivities() {
        const activitiesList = document.getElementById('activities-list');
        activitiesList.innerHTML = '';
        
        if (appData.activities.length === 0) {
            activitiesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No Activities Yet</h3>
                    <p>Activities will appear here as users interact with the system.</p>
                </div>
            `;
            return;
        }
        
        appData.activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'assignment-item';
            
            const date = new Date(activity.timestamp);
            const formattedDate = date.toLocaleString();
            
            activityItem.innerHTML = `
                <div>
                    <div class="assignment-title">${activity.message}</div>
                    <div class="assignment-meta">${formattedDate}</div>
                </div>
                <span class="badge badge-primary">${activity.type}</span>
            `;
            activitiesList.appendChild(activityItem);
        });
    }
    
    //  teacher dashboard
    function renderTeacherDashboard() {
        const classesContainer = document.getElementById('classes-container');
        classesContainer.innerHTML = '';
        
        const teacherClasses = appData.classes.filter(c => c.teacherId === currentUser.id);
        
        if (teacherClasses.length === 0) {
            classesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-school"></i>
                    <h3>No Classes Yet</h3>
                    <p>Create your first class to get started.</p>
                </div>
            `;
            return;
        }
        
        teacherClasses.forEach(cls => {
            const classCard = document.createElement('div');
            classCard.className = 'class-card';
            classCard.innerHTML = `
                <div class="class-header">
                    <div class="class-title">${cls.name}</div>
                    <div class="class-code">${cls.code}</div>
                </div>
                <div class="class-body">
                    <p>${cls.subject}</p>
                    <div class="class-meta">
                        <span><i class="fas fa-users"></i> ${cls.students.length} Students</span>
                        <span><i class="fas fa-tasks"></i> ${cls.assignments.length} Assignments</span>
                    </div>
                </div>
            `;
            classCard.addEventListener('click', () => {
                currentClass = cls;
                showClassDetail();
            });
            classesContainer.appendChild(classCard);
        });
    }
    
    //  student dashboard
    function renderStudentDashboard() {
        renderStudentClasses();
        renderStudentAssignments();
    }
    
    //  student classes
    function renderStudentClasses() {
        const studentClassesContainer = document.getElementById('student-classes');
        studentClassesContainer.innerHTML = '';
        
        const studentClasses = appData.classes.filter(c => 
            c.students.includes(currentUser.id)
        );
        
        if (studentClasses.length === 0) {
            studentClassesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h3>No Classes Yet</h3>
                    <p>Join a class using a class code to get started.</p>
                </div>
            `;
            return;
        }
        
        studentClasses.forEach(cls => {
            const teacher = appData.users.find(u => u.id === cls.teacherId);
            const classCard = document.createElement('div');
            classCard.className = 'class-card';
            classCard.innerHTML = `
                <div class="class-header">
                    <div class="class-title">${cls.name}</div>
                    <div class="class-code">${cls.code}</div>
                </div>
                <div class="class-body">
                    <p>Teacher: ${teacher ? teacher.name : 'Unknown'}</p>
                    <div class="class-meta">
                        <span><i class="fas fa-tasks"></i> ${cls.assignments.length} Assignments</span>
                    </div>
                </div>
            `;
            classCard.addEventListener('click', () => {
                currentClass = cls;
                showClassDetail();
            });
            studentClassesContainer.appendChild(classCard);
        });
    }
    
    //  student assignments
    function renderStudentAssignments() {
        const assignmentsContainer = document.getElementById('student-assignments');
        assignmentsContainer.innerHTML = '';
        
        let studentAssignments = [];
        
        // Find all classes the student is in
        const studentClasses = appData.classes.filter(c => 
            c.students.includes(currentUser.id)
        );
        
        // Get all assignments from those classes
        studentClasses.forEach(cls => {
            cls.assignments.forEach(assignment => {
                // Check if student has submitted
                const submission = assignment.submissions.find(s => s.studentId === currentUser.id);
                studentAssignments.push({
                    class: cls,
                    assignment,
                    submission
                });
            });
        });
        
        // Sort by due date
        studentAssignments.sort((a, b) => 
            new Date(a.assignment.dueDate) - new Date(b.assignment.dueDate)
        );
        
        if (studentAssignments.length === 0) {
            assignmentsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h3>No Assignments</h3>
                    <p>You don't have any assignments yet.</p>
                </div>
            `;
            return;
        }
        
        studentAssignments.forEach(item => {
            const assignmentItem = document.createElement('div');
            assignmentItem.className = 'assignment-item';
            
            const dueDate = new Date(item.assignment.dueDate);
            const formattedDate = dueDate.toLocaleDateString();
            
            let status = 'Not Submitted';
            let badgeClass = 'badge-warning';
            
            if (item.submission) {
                status = `Submitted: ${item.submission.points || 'Not graded'}/${item.assignment.maxPoints}`;
                badgeClass = item.submission.points ? 'badge-success' : 'badge-warning';
            }
            
            assignmentItem.innerHTML = `
                <div>
                    <div class="assignment-title">${item.assignment.title}</div>
                    <div class="assignment-meta">
                        <span><i class="fas fa-book"></i> ${item.class.name}</span>
                        <span><i class="fas fa-calendar-alt"></i> Due: ${formattedDate}</span>
                    </div>
                </div>
                <span class="badge ${badgeClass}">${status}</span>
            `;
            assignmentsContainer.appendChild(assignmentItem);
        });
    }
    
    // Show class detail page
    function showClassDetail() {
        document.getElementById('class-detail-title').textContent = currentClass.name;
        showPage('class-detail');
        renderClassDetail();
    }
    
    // Render class detail
    function renderClassDetail() {
        renderStudentsList();
        renderAssignmentsList();
        renderAttendance();
    }
    
    // Render students list in class detail
    function renderStudentsList() {
        const studentsList = document.getElementById('students-list');
        studentsList.innerHTML = '';
        
        if (currentClass.students.length === 0) {
            studentsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-graduate"></i>
                    <h3>No Students</h3>
                    <p>Add students to this class.</p>
                </div>
            `;
            return;
        }
        
        currentClass.students.forEach(studentId => {
            const student = appData.users.find(u => u.id === studentId);
            if (student) {
                const studentItem = document.createElement('div');
                studentItem.className = 'student-item';
                studentItem.innerHTML = `
                    <div>
                        <strong>${student.name}</strong>
                        <div>${student.email}</div>
                    </div>
                    <button class="btn btn-danger" data-id="${student.id}">
                        <i class="fas fa-user-minus"></i> Remove
                    </button>
                `;
                studentItem.querySelector('button').addEventListener('click', () => {
                    if (confirm(`Are you sure you want to remove ${student.name} from this class?`)) {
                        removeStudent(studentId);
                    }
                });
                studentsList.appendChild(studentItem);
            }
        });
    }
    
    // Render assignments in class detail
    function renderAssignmentsList() {
        const assignmentsList = document.getElementById('assignments-list');
        assignmentsList.innerHTML = '';
        
        if (currentClass.assignments.length === 0) {
            assignmentsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h3>No Assignments</h3>
                    <p>Add assignments to this class.</p>
                </div>
            `;
            return;
        }
        
        currentClass.assignments.forEach(assignment => {
            const dueDate = new Date(assignment.dueDate);
            const formattedDate = dueDate.toLocaleDateString();
            
            const assignmentItem = document.createElement('div');
            assignmentItem.className = 'assignment-item';
            assignmentItem.innerHTML = `
                <div>
                    <div class="assignment-title">${assignment.title}</div>
                    <div class="assignment-meta">
                        <span><i class="fas fa-calendar-alt"></i> Due: ${formattedDate}</span>
                        <span><i class="fas fa-star"></i> Max Points: ${assignment.maxPoints}</span>
                    </div>
                </div>
                <div>
                    <button class="btn btn-primary view-assignment" data-id="${assignment.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-danger delete-assignment" data-id="${assignment.id}">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            `;
            
            assignmentItem.querySelector('.view-assignment').addEventListener('click', () => {
                viewAssignment(assignment.id);
            });
            
            assignmentItem.querySelector('.delete-assignment').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this assignment?')) {
                    deleteAssignment(assignment.id);
                }
            });
            
            assignmentsList.appendChild(assignmentItem);
        });
    }
    
    // Render attendance
    function renderAttendance() {
        const attendanceContainer = document.getElementById('attendance-container');
        attendanceContainer.innerHTML = '';
        
        // Get unique dates
        const dates = Object.keys(currentClass.attendance).sort().reverse();
        
        if (dates.length === 0) {
            attendanceContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <h3>No Attendance Records</h3>
                    <p>Mark attendance for today to get started.</p>
                </div>
            `;
            return;
        }
        
        // Show last 5 attendance records
        const recentDates = dates.slice(0, 5);
        
        recentDates.forEach(date => {
            const attendanceItem = document.createElement('div');
            attendanceItem.className = 'attendance-item';
            
            const presentCount = currentClass.attendance[date].length;
            const totalStudents = currentClass.students.length;
            const absentCount = totalStudents - presentCount;
            
            attendanceItem.innerHTML = `
                <div style="font-weight: bold;">${date}</div>
                <div><i class="fas fa-check-circle"></i> ${presentCount} Present</div>
                <div><i class="fas fa-times-circle"></i> ${absentCount} Absent</div>
            `;
            
            attendanceContainer.appendChild(attendanceItem);
        });
    }
    
    // View assignment details
    function viewAssignment(assignmentId) {
        const assignment = currentClass.assignments.find(a => a.id === assignmentId);
        if (!assignment) return;
        
        const dueDate = new Date(assignment.dueDate);
        const formattedDate = dueDate.toLocaleDateString();
        
        let content = `
            <h3>${assignment.title}</h3>
            <p><strong>Due Date:</strong> ${formattedDate}</p>
            <p><strong>Max Points:</strong> ${assignment.maxPoints}</p>
            <p><strong>Description:</strong></p>
            <p>${assignment.description || 'No description provided.'}</p>
            <h4>Submissions (${assignment.submissions.length}/${currentClass.students.length})</h4>
        `;
        
        if (assignment.submissions.length === 0) {
            content += '<p>No submissions yet.</p>';
        } else {
            content += '<ul>';
            assignment.submissions.forEach(sub => {
                const student = appData.users.find(u => u.id === sub.studentId);
                if (student) {
                    content += `<li>${student.name}: ${sub.points || 'Not graded'} points</li>`;
                }
            });
            content += '</ul>';
        }
        
        alert(content);
    }
    
    // Add a new teacher
    function addTeacher(e) {
        e.preventDefault();
        
        const name = document.getElementById('teacher-name').value;
        const email = document.getElementById('teacher-email').value;
        const password = document.getElementById('teacher-password').value;
        
        // Check if email already exists
        if (appData.users.some(u => u.email === email)) {
            alert('A user with this email already exists.');
            return;
        }
        
        const newTeacher = {
            id: generateId(),
            name,
            email,
            password,
            role: 'teacher',
            created: new Date().toISOString()
        };
        
        appData.users.push(newTeacher);
        saveData();
        addActivity(`Admin added teacher ${name}`, 'user');
        
        // Close modal and refresh
        closeModal(document.getElementById('add-teacher-modal'));
        renderTeachers();
        
        // Show success message
        alert(`Teacher ${name} added successfully!`);
    }
    
    // Remove a teacher
    function removeTeacher(teacherId) {
        const teacher = appData.users.find(u => u.id === teacherId);
        if (!teacher) return;
        
        
        appData.users = appData.users.filter(u => u.id !== teacherId);
        
        
        appData.classes = appData.classes.filter(c => c.teacherId !== teacherId);
        
        saveData();
        addActivity(`Admin removed teacher ${teacher.name}`, 'user');
        renderTeachers();
    }
    


    function createClass(e) {
        e.preventDefault();
        
        const name = document.getElementById('class-name').value;
        const subject = document.getElementById('class-subject').value;
        const description = document.getElementById('class-description').value;
        
        const newClass = {
            id: generateId(),
            name,
            subject,
            description,
            code: generateClassCode(),
            teacherId: currentUser.id,
            students: [],
            assignments: [],
            attendance: {},
            created: new Date().toISOString()
        };
        
        appData.classes.push(newClass);
        saveData();
        addActivity(`${currentUser.name} created class ${name}`, 'class');
        
        
        closeModal(document.getElementById('create-class-modal'));
        renderTeacherDashboard();
        
        
        alert(`Class "${name}" created successfully!\nClass Code: ${newClass.code}`);
    }
    
    

    function joinClass(e) {
        e.preventDefault();
        
        const code = document.getElementById('class-code').value.toUpperCase();
        const foundClass = appData.classes.find(c => c.code === code);
        
        if (foundClass) {
            
            if (foundClass.students.includes(currentUser.id)) {
                alert('You are already in this class.');
            } else {
                foundClass.students.push(currentUser.id);
                saveData();
                addActivity(`${currentUser.name} joined class ${foundClass.name}`, 'class');
                
                
                closeModal(document.getElementById('join-class-modal'));
                renderStudentDashboard();
                
                
                alert(`Successfully joined ${foundClass.name}!`);
            }
        } else {
            alert('Class not found. Please check the class code and try again.');
        }
    }
    
    

    function addAssignment(e) {
        e.preventDefault();
        
        const title = document.getElementById('assignment-title').value;
        const description = document.getElementById('assignment-description').value;
        const dueDate = document.getElementById('assignment-due-date').value;
        const points = document.getElementById('assignment-points').value;
        
        const newAssignment = {
            id: generateId(),
            title,
            description,
            dueDate,
            maxPoints: parseInt(points),
            submissions: []
        };
        
        currentClass.assignments.push(newAssignment);
        saveData();
        addActivity(`${currentUser.name} added assignment "${title}" to ${currentClass.name}`, 'assignment');
        
     
        closeModal(document.getElementById('add-assignment-modal'));
        renderAssignmentsList();
        
        
        alert(`Assignment "${title}" added successfully!`);
    }
    
   
    function deleteAssignment(assignmentId) {
        const assignment = currentClass.assignments.find(a => a.id === assignmentId);
        if (!assignment) return;
        
        currentClass.assignments = currentClass.assignments.filter(a => a.id !== assignmentId);
        saveData();
        addActivity(`${currentUser.name} deleted assignment "${assignment.title}" from ${currentClass.name}`, 'assignment');
        renderAssignmentsList();
    }
    
    
    function showMarkAttendanceModal() {
        const modal = document.getElementById('mark-attendance-modal');
        const studentsContainer = document.getElementById('attendance-students');
        studentsContainer.innerHTML = '';
        
     
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('attendance-date').value = today;
        
        
        currentClass.students.forEach(studentId => {
            const student = appData.users.find(u => u.id === studentId);
            if (student) {
                const studentItem = document.createElement('div');
                studentItem.className = 'form-group';
                studentItem.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="student-${studentId}" checked>
                        <label for="student-${studentId}" style="margin: 0;">${student.name}</label>
                    </div>
                `;
                studentsContainer.appendChild(studentItem);
            }
        });
        
        modal.classList.add('active');
    }
    
    
    function saveAttendance() {
        const date = document.getElementById('attendance-date').value;
        if (!date) {
            alert('Please select a date');
            return;
        }
        
        const presentStudents = [];
        
    
        currentClass.students.forEach(studentId => {
            const checkbox = document.getElementById(`student-${studentId}`);
            if (checkbox && checkbox.checked) {
                presentStudents.push(studentId);
            }
        });
        
        
        currentClass.attendance[date] = presentStudents;
        saveData();
        addActivity(`${currentUser.name} marked attendance for ${date} in ${currentClass.name}`, 'attendance');
        
      
        closeModal(document.getElementById('mark-attendance-modal'));
        renderAttendance();
        
        
        alert(`Attendance saved for ${date}!`);
    }
    
    
    function removeStudent(studentId) {
        const student = appData.users.find(u => u.id === studentId);
        if (!student) return;
        
        currentClass.students = currentClass.students.filter(id => id !== studentId);
        

        currentClass.assignments.forEach(assignment => {
            assignment.submissions = assignment.submissions.filter(sub => sub.studentId !== studentId);
        });
        
        saveData();
        addActivity(`${currentUser.name} removed ${student.name} from ${currentClass.name}`, 'user');
        renderStudentsList();
    }
    
   
    function goBackToDashboard() {
        if (currentUser.role === 'teacher') {
            showPage('teacher-dashboard');
        } else if (currentUser.role === 'student') {
            showPage('student-dashboard');
        }
        currentClass = null;
    }
    
    
    function switchTab(e) {
        const tabId = e.target.getAttribute('data-tab');
        
       
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        e.target.classList.add('active');
        
     
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }
    
   
    function searchTeachers() {
        const searchTerm = document.getElementById('search-teacher').value.toLowerCase();
        const teachers = appData.users.filter(u => 
            u.role === 'teacher' && 
            (u.name.toLowerCase().includes(searchTerm) || 
             u.email.toLowerCase().includes(searchTerm))
        );
        
        const teachersList = document.getElementById('teachers-list');
        teachersList.innerHTML = '';
        
        if (teachers.length === 0) {
            teachersList.innerHTML = '<div class="alert alert-warning">No teachers found matching your search.</div>';
            return;
        }
        
        teachers.forEach(teacher => {
            const teacherItem = document.createElement('div');
            teacherItem.className = 'student-item';
            teacherItem.innerHTML = `
                <div>
                    <strong>${teacher.name}</strong>
                    <div>${teacher.email}</div>
                </div>
                <button class="btn btn-danger" data-id="${teacher.id}">
                    <i class="fas fa-trash-alt"></i> Remove
                </button>
            `;
            teacherItem.querySelector('button').addEventListener('click', () => {
                if (confirm(`Are you sure you want to remove ${teacher.name}?`)) {
                    removeTeacher(teacher.id);
                }
            });
            teachersList.appendChild(teacherItem);
        });
    }
    
    
    function showAddStudentModal() {
        alert('To add a student to this class:\n1. The student must have an account\n2. They can join using the class code: ' + currentClass.code);
    }
    
    
    document.addEventListener('DOMContentLoaded', initApp);