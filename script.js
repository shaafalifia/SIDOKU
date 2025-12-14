// --- STATE MANAGEMENT ---
let currentUser = "User";
let currentJobTitle = "Supervisor Produksi Herbal"; // Default role
let currentEmail = "user@sidomuncul.id";
let isHRD = false;

// --- UTILS ---
function getTodayDateString() {
    const today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
}

// Data Dummy Absen
const defaultLogs = [
    { d: '13', m: 'Des', in: '06:55', out: '-', status: 'Hadir', class: 'ontime', timeClass: '' },
    { d: '12', m: 'Des', in: '06:58', out: '15:05', status: 'Hadir', class: 'ontime', timeClass: '' },
    { d: '11', m: 'Des', in: '07:15', out: '17:10', status: 'Terlambat', class: 'late', timeClass: 'text-danger' },
    { d: '10', m: 'Des', in: '06:45', out: '15:00', status: 'Hadir', class: 'ontime', timeClass: '' },
    { d: '09', m: 'Des', in: '06:50', out: '15:02', status: 'Hadir', class: 'ontime', timeClass: '' },
    { d: '08', m: 'Des', in: '07:05', out: '15:15', status: 'Hadir', class: 'ontime', timeClass: '' },
    { d: '06', m: 'Des', in: '06:55', out: '12:00', status: 'Hadir', class: 'ontime', timeClass: '' }
];

// Initialize Data Global
if (!localStorage.getItem('leaveRequests')) localStorage.setItem('leaveRequests', JSON.stringify([]));
if (!localStorage.getItem('attendanceLogs')) localStorage.setItem('attendanceLogs', JSON.stringify(defaultLogs));
if (!localStorage.getItem('clockStatus')) localStorage.setItem('clockStatus', 'none'); 
if (!localStorage.getItem('lastClockDate')) localStorage.setItem('lastClockDate', '');

// --- LOGIN ---
function handleLogin() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    if (email === 'hrd@sidomuncul.id') {
        if (password !== 'sidomuncul456') { alert("Password HRD salah!"); return; }
        isHRD = true;
        updateUI("Human Resource Sido Muncul", "HRD Manager", email);
        document.getElementById('desk-inbox').classList.remove('hidden'); 
        document.getElementById('nav-inbox').classList.remove('hidden'); 
        document.getElementById('inbox-title').innerText = "Kotak Masuk HRD";
        setTimeout(renderInboxHRD, 500);
        return;
    }

    if (!email.endsWith('@sidomuncul.id')) { alert("Email salah!"); return; }
    if (password !== 'sidomuncul123') { alert("Password salah!"); return; }

    let username = email.split('@')[0];
    username = username.charAt(0).toUpperCase() + username.slice(1);
    isHRD = false;
    updateUI("Supervisor Produksi Herbal", username, email);
    document.getElementById('inbox-title').innerText = "Status Pengajuan Saya";
    setTimeout(renderInboxEmployee, 500);
}

function updateUI(jobTitle, name, email) {
    currentUser = name;
    currentJobTitle = jobTitle;
    currentEmail = email;

    document.getElementById('page-title').innerText = name;
    document.getElementById('profile-name-display').innerText = name;
    document.getElementById('job-title-display').innerText = jobTitle;
    document.getElementById('dashboard-date').innerHTML = `<i class="far fa-calendar"></i> ${getTodayDateString()}`;

    // Update Info Personal Page secara dinamis
    document.getElementById('detail-name').innerText = name;
    document.getElementById('detail-job').innerText = jobTitle;
    document.getElementById('detail-email').innerText = email;

    // Reset Absen Check daily
    const todayStr = new Date().toDateString();
    if (localStorage.getItem('lastClockDate') !== todayStr) {
        localStorage.setItem('clockStatus', 'none'); 
        localStorage.setItem('lastClockDate', todayStr);
    }

    // Cek saldo cuti per user
    const balanceKey = `leaveBalance_${currentUser}`;
    if (!localStorage.getItem(balanceKey)) {
        localStorage.setItem(balanceKey, 10);
    }
    document.getElementById('leave-balance-display').innerText = localStorage.getItem(balanceKey);

    document.getElementById('login-page').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        renderAttendance(); 
        updateStats();
        updateClockButtons(); 
    }, 400); 
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('passwordInput');
    const toggleIcon = document.querySelector('.toggle-password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// --- NAVIGATION SWITCHER ---
function switchTab(viewId, navElement) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
    
    // Logic untuk handling page baru (Personal, Job, Edu)
    let targetId = viewId;
    if (!viewId.endsWith('-view') && viewId !== 'home' && viewId !== 'absensi') {
        targetId = viewId + '-view';
    } else if (viewId === 'home') targetId = 'home-view';
    else if (viewId === 'absensi') targetId = 'absensi-view';
    else if (viewId === 'profile') targetId = 'profile-view';
    else if (viewId === 'inbox') targetId = 'inbox-view';

    // Jika masuk ke halaman Detail Pekerjaan atau Edu, render kontennya dulu
    if (targetId === 'job-detail-view') renderJobDetail();
    if (targetId === 'edu-exp-view') renderEduExp();

    document.getElementById(targetId).classList.remove('hidden');

    document.querySelectorAll('.app-nav .nav-item, .bottom-nav .nav-item').forEach(el => el.classList.remove('active'));
    
    // Set Active State Navigasi
    if (viewId === 'home') document.querySelectorAll('#nav-home, #desk-home').forEach(el => el.classList.add('active'));
    else if (viewId === 'absensi' || targetId === 'absen-view') document.querySelectorAll('#nav-absen, #desk-absen').forEach(el => el.classList.add('active'));
    else if (viewId === 'inbox') {
        document.querySelectorAll('#nav-inbox, #desk-inbox').forEach(el => el.classList.add('active'));
        if(isHRD) renderInboxHRD(); else renderInboxEmployee();
    }
    else if (viewId === 'profile' || targetId === 'personal-view' || targetId === 'job-detail-view' || targetId === 'edu-exp-view') {
        document.querySelectorAll('#nav-profile, #desk-profile').forEach(el => el.classList.add('active'));
    }
}

// --- RENDER SUB-PAGES PROFILE ---
function renderJobDetail() {
    const titleEl = document.getElementById('job-detail-title');
    const contentEl = document.getElementById('job-desc-content');
    
    titleEl.innerText = currentJobTitle;
    
    let items = [];
    if(isHRD) {
        items = [
            "Mengelola proses rekrutmen dan seleksi karyawan baru.",
            "Memproses payroll, lembur, dan administrasi gaji bulanan.",
            "Menangani hubungan industrial dan keluhan karyawan.",
            "Mengorganisir pelatihan dan pengembangan SDM.",
            "Memastikan kepatuhan terhadap regulasi ketenagakerjaan."
        ];
    } else {
        items = [
            "Mengawasi jalannya proses produksi ekstraksi herbal.",
            "Memastikan standar GMP (Good Manufacturing Practice) dan CPOTB diterapkan.",
            "Melakukan pengecekan kualitas bahan baku masuk.",
            "Mengatur shift dan pembagian tugas operator produksi.",
            "Membuat laporan harian output produksi."
        ];
    }

    let html = '<ul>';
    items.forEach(item => { html += `<li>${item}</li>`; });
    html += '</ul>';
    contentEl.innerHTML = html;
}

function renderEduExp() {
    const eduEl = document.getElementById('edu-content');
    const expEl = document.getElementById('exp-content');

    let eduHtml = '';
    let expHtml = '';

    if(isHRD) {
        eduHtml = `
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>S1 Psikologi</h5>
                    <span>Universitas Diponegoro (2015 - 2019)</span>
                </div>
            </div>
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>SMA Negeri 1 Semarang</h5>
                    <span>Jurusan IPS (2012 - 2015)</span>
                </div>
            </div>`;
        
        expHtml = `
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>HR Manager</h5>
                    <span>PT Sido Muncul Tbk (2022 - Sekarang)</span>
                </div>
            </div>
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>HR Staff</h5>
                    <span>PT Jamu Jago (2019 - 2022)</span>
                </div>
            </div>`;
    } else {
        eduHtml = `
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>S1 Teknologi Pangan</h5>
                    <span>IPB University (2016 - 2020)</span>
                </div>
            </div>
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>SMK Farmasi Semarang</h5>
                    <span>Farmasi Industri (2013 - 2016)</span>
                </div>
            </div>`;
        
        expHtml = `
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>Supervisor Produksi</h5>
                    <span>PT Sido Muncul Tbk (2023 - Sekarang)</span>
                </div>
            </div>
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>Staff Quality Control</h5>
                    <span>PT Kalbe Farma (2020 - 2023)</span>
                </div>
            </div>`;
    }

    eduEl.innerHTML = eduHtml;
    expEl.innerHTML = expHtml;
}


// --- CLOCK IN/OUT ---
function clockIn(btn) {
    const status = localStorage.getItem('clockStatus');
    if (status === 'in' || status === 'out') return; 

    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes() < 10 ? '0'+now.getMinutes() : now.getMinutes()}`;
    const day = now.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    
    let logs = JSON.parse(localStorage.getItem('attendanceLogs'));
    let statusLog = "Hadir";
    let cssClass = "ontime";
    let timeCss = "";
    
    if(now.getHours() > 7 || (now.getHours() === 7 && now.getMinutes() > 0)) {
        statusLog = "Terlambat"; cssClass = "late"; timeCss = "text-danger";
    }

    logs.unshift({ name: currentUser, d: day, m: months[now.getMonth()], in: timeString, out: '-', status: statusLog, class: cssClass, timeClass: timeCss });
    localStorage.setItem('attendanceLogs', JSON.stringify(logs));
    localStorage.setItem('clockStatus', 'in');

    updateClockButtons();
    renderAttendance();
    updateStats();
}

function clockOut(btn) {
    const status = localStorage.getItem('clockStatus');
    if (status !== 'in') return; 

    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes() < 10 ? '0'+now.getMinutes() : now.getMinutes()}`;
    
    let logs = JSON.parse(localStorage.getItem('attendanceLogs'));
    const todayLogIndex = logs.findIndex(l => l.name === currentUser && l.out === '-');

    if(todayLogIndex > -1) {
        logs[todayLogIndex].out = timeString;
        localStorage.setItem('attendanceLogs', JSON.stringify(logs));
        localStorage.setItem('clockStatus', 'out');
        updateClockButtons();
        renderAttendance();
    }
}

function updateClockButtons() {
    const status = localStorage.getItem('clockStatus');
    const btnIn = document.querySelectorAll('.btn-in');
    const btnOut = document.querySelectorAll('.btn-out');

    if (status === 'in') {
        btnIn.forEach(b => { b.innerHTML = '<i class="fas fa-check"></i> Sudah Masuk'; b.classList.add('disabled'); });
        btnOut.forEach(b => { b.classList.remove('disabled'); });
    } else if (status === 'out') {
        btnIn.forEach(b => { b.innerHTML = '<i class="fas fa-check"></i> Sudah Masuk'; b.classList.add('disabled'); });
        btnOut.forEach(b => { b.innerHTML = '<i class="fas fa-check"></i> Sudah Pulang'; b.classList.add('disabled'); });
    } else {
        btnIn.forEach(b => { b.innerHTML = '<i class="fas fa-sign-in-alt"></i> Masuk'; b.classList.remove('disabled'); });
        btnOut.forEach(b => { b.innerHTML = '<i class="fas fa-sign-out-alt"></i> Pulang'; b.classList.add('disabled'); });
    }
}

// --- CUTI & REIMBURSE ---
function submitCuti() {
    const startDate = document.getElementById('cuti-start').value;
    const endDate = document.getElementById('cuti-end').value;
    const reason = document.getElementById('cuti-reason').value;
    
    if(!startDate || !endDate) { alert("Pilih tanggal!"); return; }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1; 

    let requests = JSON.parse(localStorage.getItem('leaveRequests'));
    requests.push({ 
        id: Date.now(), 
        name: currentUser, 
        type: 'Cuti',
        date: `${startDate} s/d ${endDate}`,
        dateObj: startDate,
        days: diffDays,
        reason: reason, 
        status: 'Diproses' 
    });
    localStorage.setItem('leaveRequests', JSON.stringify(requests));

    openModal('modal-success');
    document.getElementById('success-title').innerText = "Berhasil Diajukan!";
    document.getElementById('success-msg').innerText = "Pengajuan cuti telah dikirim ke HRD.";
}

function submitReimburse() {
    let requests = JSON.parse(localStorage.getItem('leaveRequests'));
    const fileInput = document.getElementById('file-upload');
    const typeSelect = document.getElementById('reimburse-type').value;
    let otherDetail = "";

    if(typeSelect === 'Lainnya') {
        otherDetail = document.getElementById('reimburse-other-input').value;
        if(otherDetail === "") otherDetail = "Lainnya";
    }

    let fileName = fileInput.files.length > 0 ? fileInput.files[0].name : "Dokumen";
    let reasonText = typeSelect === 'Lainnya' ? otherDetail : typeSelect;

    requests.push({ 
        id: Date.now(), 
        name: currentUser, 
        type: 'Reimburse',
        date: getTodayDateString(),
        days: 0,
        reason: reasonText + ` (${fileName})`, 
        status: 'Diproses' 
    });
    localStorage.setItem('leaveRequests', JSON.stringify(requests));

    openModal('modal-success');
    document.getElementById('success-title').innerText = "Berhasil Diupload!";
    document.getElementById('success-msg').innerText = "Klaim reimbursement telah dikirim.";
}

// --- INBOX LOGIC ---
function renderInboxHRD() {
    const requests = JSON.parse(localStorage.getItem('leaveRequests'));
    const inboxList = document.getElementById('inbox-list'); 
    
    if (!inboxList) return;

    if (requests.length === 0) {
        inboxList.innerHTML = `<div class="empty-state" style="text-align:center; padding:30px; color:#ccc;"><i class="far fa-envelope-open" style="font-size:30px;"></i><p>Tidak ada pengajuan.</p></div>`;
        return;
    }

    inboxList.innerHTML = '';
    requests.slice().reverse().forEach(req => {
        let btnHtml = '';
        if(req.status === 'Diproses') {
            btnHtml = `<button class="btn-sm-green" onclick="approveRequest(${req.id})">Approve</button>`;
        } else {
            btnHtml = `<button class="btn-sm-green" disabled style="background:#ccc; color:#fff; cursor:default;">Approved</button>`;
        }

        const item = `
            <div class="news-item" id="req-${req.id}">
                <div class="news-date" style="background:#e3f2fd; color:#1976d2;"><i class="fas fa-user"></i></div>
                <div class="news-content">
                    <h5 style="font-size:14px;">${req.name} - ${req.type} (${req.days > 0 ? req.days + ' Hari' : ''})</h5>
                    <p style="font-size:11px;">Tanggal: ${req.date} <br> Ket: ${req.reason}</p>
                </div>
                ${btnHtml}
            </div>
        `;
        inboxList.innerHTML += item;
    });
}

function renderInboxEmployee() {
    const requests = JSON.parse(localStorage.getItem('leaveRequests'));
    const inboxList = document.getElementById('inbox-list'); 
    
    if (!inboxList) return;

    const myRequests = requests.filter(r => r.name === currentUser);
    
    if (myRequests.length === 0) {
        inboxList.innerHTML = `<div class="empty-state" style="text-align:center; padding:30px; color:#ccc;"><i class="far fa-list-alt" style="font-size:30px;"></i><p>Belum ada riwayat pengajuan.</p></div>`;
        return;
    }

    inboxList.innerHTML = '';
    myRequests.slice().reverse().forEach(req => {
        let statusColor = req.status === 'Disetujui' ? 'color:green;' : 'color:orange;';
        
        const item = `
            <div class="news-item">
                <div class="news-date" style="background:#f5f5f5; color:#666;"><i class="fas fa-file-alt"></i></div>
                <div class="news-content">
                    <h5 style="font-size:14px;">Pengajuan ${req.type}</h5>
                    <p style="font-size:11px;">${req.date}</p>
                </div>
                <span style="font-size:11px; font-weight:600; ${statusColor}">${req.status}</span>
            </div>
        `;
        inboxList.innerHTML += item;
    });
}

function approveRequest(id) {
    let requests = JSON.parse(localStorage.getItem('leaveRequests'));
    const reqIndex = requests.findIndex(r => r.id === id);
    
    if (reqIndex > -1) {
        const req = requests[reqIndex];
        req.status = 'Disetujui';
        
        if (req.type === 'Cuti') {
            const targetUser = req.name; 
            const targetKey = `leaveBalance_${targetUser}`;
            
            let currentBal = parseInt(localStorage.getItem(targetKey) || 10);
            let daysToDeduct = req.days;
            
            if(currentBal >= daysToDeduct) {
                localStorage.setItem(targetKey, currentBal - daysToDeduct);
            }
            
            let logs = JSON.parse(localStorage.getItem('attendanceLogs'));
            const dateParts = new Date(req.dateObj);
            const day = dateParts.getDate();
            const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
            
            logs.unshift({ 
                name: targetUser, 
                d: day, 
                m: months[dateParts.getMonth()], 
                in: 'Cuti', 
                out: '-', 
                status: 'Cuti/Izin', 
                class: 'cuti', 
                timeClass: 'text-primary' 
            });
            localStorage.setItem('attendanceLogs', JSON.stringify(logs));
        }
        
        localStorage.setItem('leaveRequests', JSON.stringify(requests));
        renderInboxHRD(); 
    }
}

// --- UTILS LAINNYA ---
function renderAttendance() {
    const tbody = document.getElementById('attendance-tbody');
    let logs = JSON.parse(localStorage.getItem('attendanceLogs'));
    
    if(!isHRD) {
        logs = logs.filter(l => !l.name || l.name === currentUser);
    }

    tbody.innerHTML = '';
    logs.forEach(log => {
        const row = `<tr><td><div class="td-date"><b>${log.d}</b><span>${log.m}</span></div></td><td class="${log.timeClass}">${log.in}</td><td>${log.out}</td><td><span class="status-badge ${log.class}">${log.status}</span></td></tr>`;
        tbody.innerHTML += row;
    });
}

function updateStats() {
    const logs = JSON.parse(localStorage.getItem('attendanceLogs'));
    let hadir = 0, late = 0, cuti = 0;
    const userLogs = isHRD ? logs : logs.filter(l => !l.name || l.name === currentUser);
    
    userLogs.forEach(log => {
        if(log.status === 'Hadir') hadir++;
        if(log.status === 'Terlambat') late++;
        if(log.status === 'Cuti/Izin') cuti++;
    });
    document.getElementById('val-hadir').innerText = hadir;
    document.getElementById('val-late').innerText = late;
    document.getElementById('val-cuti').innerText = cuti;
}

function checkReimburseType() {
    const type = document.getElementById('reimburse-type').value;
    const otherDiv = document.getElementById('other-reimburse-div');
    if (type === 'Lainnya') otherDiv.classList.remove('hidden');
    else otherDiv.classList.add('hidden');
}

function updateFileName(input) {
    const label = document.getElementById('upload-label-text');
    if(input.files.length > 0) {
        label.innerHTML = `<i class="fas fa-check"></i> <span>${input.files[0].name}</span>`;
        label.style.borderColor = 'var(--primary-green)';
        label.style.color = 'var(--primary-green)';
    }
}

function toggleSalary(icon) {
    const salaryText = document.getElementById('salary-text');
    if (salaryText.classList.contains('blur-text')) {
        salaryText.classList.remove('blur-text');
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        salaryText.classList.add('blur-text');
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

function updateSlipData() {
    const period = document.getElementById('slip-period').value;
    const content = document.getElementById('slip-content');
    if (period === 'nov') {
        content.innerHTML = `<div class="row"><span>Gaji Pokok</span><b>Rp 5.200.000</b></div><div class="row"><span>Tunjangan</span><b>Rp 1.500.000</b></div><div class="row green"><span>Lembur</span><b>Rp 1.000.000</b></div><hr><div class="row total"><span>Total</span><b style="color:var(--primary-green);">Rp 7.700.000</b></div>`;
    } else {
        content.innerHTML = `<div class="row"><span>Gaji Pokok</span><b>Rp 5.200.000</b></div><div class="row"><span>Tunjangan</span><b>Rp 1.500.000</b></div><div class="row green"><span>Lembur</span><b>Rp 1.750.000</b></div><hr><div class="row total"><span>Total</span><b style="color:var(--primary-green);">Rp 8.450.000</b></div>`;
    }
}

function openModal(modalId) { document.getElementById(modalId).classList.remove('hidden'); }
function closeModal(modalId) { document.getElementById(modalId).classList.add('hidden'); }

function submitForm(type) {
    if(type === 'Lembur') {
        openModal('modal-success');
        document.getElementById('success-title').innerText = "Berhasil!";
        document.getElementById('success-msg').innerText = "Pengajuan Lembur Terkirim.";
    }
}

function openTeamModal() {
    if(!isHRD) return; 
    
    const team = [
        {name: 'Shafa', role: 'Staff Marketing', email: 'shafa@sidomuncul.id', phone: '08123456789'},
        {name: 'Tafta', role: 'Staff Produksi', email: 'tafta@sidomuncul.id', phone: '08129876543'},
        {name: 'Rayisha', role: 'Staff Gudang', email: 'rayisha@sidomuncul.id', phone: '08121112223'},
        {name: 'Kayla', role: 'Staff Finance', email: 'kayla@sidomuncul.id', phone: '08123334445'},
        {name: 'Salsabila', role: 'Staff HR', email: 'salsabila@sidomuncul.id', phone: '08125556667'}
    ];
    
    let html = '';
    team.forEach(t => {
        html += `
        <div class="team-item">
            <div class="team-left">
                <div class="team-avatar" style="background-image: url('https://ui-avatars.com/api/?name=${t.name}&background=random');"></div>
                <div class="team-info"><h5>${t.name}</h5><p>${t.role}</p></div>
            </div>
            <div class="team-contact">
                <i class="fas fa-phone-alt" onclick="alert('Call ${t.phone}')"></i>
                <i class="fas fa-envelope" onclick="alert('Email ${t.email}')"></i>
            </div>
        </div>`;
    });
    document.getElementById('team-list-container').innerHTML = html;
    openModal('modal-team');
}

function downloadSlip() {
    openModal('modal-success');
    document.getElementById('success-title').innerText = "Berhasil Diunduh!";
    document.getElementById('success-msg').innerText = "File tersimpan.";
}