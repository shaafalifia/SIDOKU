// --- STATE MANAGEMENT ---
let currentUser = "User";
let currentJobTitle = "Supervisor Produksi Herbal";
let currentEmail = "user@sidomuncul.id";
let isHRD = false;

// --- UTILS ---
function getTodayDateString() {
    const today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
}

// Data Pengumuman
const newsData = [
    { id: 1, title: "Pendaftaran Mudik Bareng 2026", date: "12 Des 2025", content: "<p>Program Mudik Gratis Sido Muncul 2026 kembali hadir! Sebagai bentuk apresiasi kepada seluruh karyawan dan keluarga, perusahaan menyediakan armada bus eksekutif untuk perjalanan mudik ke berbagai kota di Pulau Jawa.</p><br><p><b>Detail Pendaftaran:</b></p><ul><li>Dibuka mulai: 20 Desember 2025</li><li>Lokasi: Ruang HRD (Bu Salsabila)</li><li>Syarat: Membawa FC KK dan KTP</li></ul><br><p>Segera daftarkan diri Anda sebelum kuota penuh!</p>" },
    { id: 2, title: "Maintenance Server SiDoKu", date: "15 Des 2025", content: "<p>Diberitahukan kepada seluruh karyawan bahwa akan dilakukan pemeliharaan sistem (maintenance) pada aplikasi SiDoKu untuk meningkatkan keamanan dan performa server.</p><br><p><b>Waktu Downtime:</b></p><p>Senin, 15 Desember 2025 pukul 12.00 - 13.00 WIB.</p><br><p>Selama periode tersebut, fitur Clock In/Out dan Pengajuan Cuti tidak dapat diakses. Mohon lakukan absensi sebelum jam tersebut.</p>" },
    { id: 3, title: "Gathering Akhir Tahun 2025", date: "20 Des 2025", content: "<p>Manajemen mengundang seluruh karyawan Divisi Produksi untuk hadir dalam acara Gathering Akhir Tahun & Syukuran Pencapaian Target 2025.</p><br><p><b>Pelaksanaan:</b></p><ul><li>Hari/Tgl: Sabtu, 27 Desember 2025</li><li>Waktu: 09.00 WIB - Selesai</li><li>Lokasi: Agrowisata Sido Muncul</li><li>Dresscode: Seragam Batik Sido Muncul</li></ul><br><p>Akan ada doorprize menarik dan hiburan musik. Kehadiran bersifat wajib.</p>" },
    { id: 4, title: "Beasiswa Anak Berprestasi Sido Muncul 2026", date: "22 Des 2025", content: "<p>PT Sido Muncul Tbk kembali membuka program <b>Beasiswa Anak Berprestasi</b> bagi putra-putri karyawan untuk tahun ajaran 2026/2027.</p><br><p><b>Kategori Beasiswa:</b></p><ul><li>SD/MI (Juara 1-3 di kelas)</li><li>SMP/Mts (Rata-rata nilai rapor > 8.5)</li><li>SMA/SMK (Rata-rata nilai rapor > 8.5)</li><li>Perguruan Tinggi (IPK > 3.50)</li></ul><br><p><b>Berkas Persyaratan:</b></p><ul><li>Fotokopi Rapor/KHS Terlegalisir</li><li>Surat Keterangan Berprestasi dari Sekolah/Kampus</li><li>Fotokopi KK & Kartu Karyawan</li></ul><br><p>Pengumpulan berkas paling lambat <b>15 Januari 2026</b> di HRD Department.</p>" }
];

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

    document.getElementById('detail-name').innerText = name;
    document.getElementById('detail-job').innerText = jobTitle;
    document.getElementById('detail-email').innerText = email;

    const savedPic = localStorage.getItem('profilePic_' + currentUser);
    if (savedPic) {
        document.querySelectorAll('.avatar-large, .avatar-small').forEach(el => {
            el.style.backgroundImage = `url('${savedPic}')`;
        });
    }

    const todayStr = new Date().toDateString();
    if (localStorage.getItem('lastClockDate') !== todayStr) {
        localStorage.setItem('clockStatus', 'none'); 
        localStorage.setItem('lastClockDate', todayStr);
    }

    const balanceKey = `leaveBalance_${currentUser}`;
    if (!localStorage.getItem(balanceKey)) localStorage.setItem(balanceKey, 10);
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
    
    let targetId = viewId;
    if (!viewId.endsWith('-view') && viewId !== 'home' && viewId !== 'absensi' && viewId !== 'news-detail' && viewId !== 'inbox-detail') {
        targetId = viewId + '-view';
    } else if (viewId === 'home') targetId = 'home-view';
    else if (viewId === 'absensi') targetId = 'absensi-view';
    else if (viewId === 'profile') targetId = 'profile-view';
    else if (viewId === 'inbox') targetId = 'inbox-view';
    else if (viewId === 'news-detail') targetId = 'news-detail-view';
    else if (viewId === 'inbox-detail') targetId = 'inbox-detail-view';

    if (targetId === 'job-detail-view') renderJobDetail();
    if (targetId === 'edu-exp-view') renderEduExp();
    if (targetId === 'inbox-view') {
        if(isHRD) renderInboxHRD(); else renderInboxEmployee();
    }

    document.getElementById(targetId).classList.remove('hidden');

    document.querySelectorAll('.app-nav .nav-item, .bottom-nav .nav-item').forEach(el => el.classList.remove('active'));
    
    if (viewId === 'home' || targetId === 'news-detail-view') document.querySelectorAll('#nav-home, #desk-home').forEach(el => el.classList.add('active'));
    else if (viewId === 'absensi' || targetId === 'absen-view') document.querySelectorAll('#nav-absen, #desk-absen').forEach(el => el.classList.add('active'));
    else if (viewId === 'inbox' || targetId === 'inbox-detail-view') {
        document.querySelectorAll('#nav-inbox, #desk-inbox').forEach(el => el.classList.add('active'));
    }
    else if (viewId === 'profile' || targetId === 'personal-view' || targetId === 'job-detail-view' || targetId === 'edu-exp-view') {
        document.querySelectorAll('#nav-profile, #desk-profile').forEach(el => el.classList.add('active'));
    }
}

function openAnnouncement(id) {
    const news = newsData.find(n => n.id === id);
    if(news) {
        document.getElementById('news-detail-title').innerText = news.title;
        document.getElementById('news-detail-date').innerText = news.date;
        document.getElementById('news-detail-body').innerHTML = news.content;
        switchTab('news-detail');
    }
}

function openInboxDetail(id) {
    const requests = JSON.parse(localStorage.getItem('leaveRequests'));
    const req = requests.find(r => r.id === id);
    if(!req) return;

    document.getElementById('inbox-d-reimburse-area').classList.add('hidden');
    document.getElementById('inbox-d-lembur-area').classList.add('hidden');
    document.getElementById('inbox-d-action-area').innerHTML = '';
    
    document.getElementById('inbox-d-type').innerText = req.type;
    document.getElementById('inbox-d-status').innerText = req.status;
    document.getElementById('inbox-d-status').className = req.status === 'Disetujui' ? 'status-avail' : (req.status === 'Diproses' ? 'badge-dept' : 'badge-role'); 
    
    document.getElementById('inbox-d-name').innerText = req.name;
    document.getElementById('inbox-d-date').innerText = req.date;
    document.getElementById('inbox-d-reason').innerText = req.reason;

    if(req.type === 'Lembur') {
        document.getElementById('inbox-d-lembur-area').classList.remove('hidden');
        document.getElementById('inbox-d-duration').innerText = req.duration + " Jam";
    }
    
    if(req.type === 'Reimburse') {
        document.getElementById('inbox-d-reimburse-area').classList.remove('hidden');
        document.getElementById('inbox-d-amount').innerText = "Rp " + parseInt(req.amount).toLocaleString('id-ID');
        const imgContainer = document.getElementById('inbox-d-img-container');
        if(req.attachmentData) {
            imgContainer.innerHTML = `<img src="${req.attachmentData}" style="width:100%; display:block;">`;
        } else {
            imgContainer.innerHTML = `<div style="padding:20px; text-align:center; color:#999; font-size:12px;">Tidak ada lampiran foto.</div>`;
        }
    }

    if(isHRD && req.status === 'Diproses') {
        document.getElementById('inbox-d-action-area').innerHTML = `<button class="btn-primary" onclick="approveRequest(${req.id})">Setujui Pengajuan</button>`;
    } else if (req.status === 'Disetujui') {
        document.getElementById('inbox-d-action-area').innerHTML = `<button class="btn-primary" disabled style="background:#ccc; cursor:default;">Telah Disetujui</button>`;
    }

    switchTab('inbox-detail');
}

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
        date: `${startDate} s/d ${endDate} (${diffDays} Hari)`,
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

function submitLembur() {
    const date = document.getElementById('lembur-date').value;
    const duration = document.getElementById('lembur-duration').value;
    const reason = document.getElementById('lembur-reason').value;

    if(!date || !duration) { alert("Lengkapi data!"); return; }

    let requests = JSON.parse(localStorage.getItem('leaveRequests'));
    requests.push({ 
        id: Date.now(), 
        name: currentUser, 
        type: 'Lembur',
        date: date,
        duration: duration,
        reason: reason, 
        status: 'Diproses' 
    });
    localStorage.setItem('leaveRequests', JSON.stringify(requests));

    openModal('modal-success');
    document.getElementById('success-title').innerText = "Berhasil Diajukan!";
    document.getElementById('success-msg').innerText = "Pengajuan lembur telah dikirim ke HRD.";
}

function submitReimburse() {
    const fileInput = document.getElementById('file-upload');
    const typeSelect = document.getElementById('reimburse-type').value;
    const amountInput = document.getElementById('reimburse-amount').value;
    let otherDetail = "";

    if(!amountInput) { alert("Masukkan nominal!"); return; }

    if(typeSelect === 'Lainnya') {
        otherDetail = document.getElementById('reimburse-other-input').value;
        if(otherDetail === "") otherDetail = "Lainnya";
    }

    let reasonText = typeSelect === 'Lainnya' ? otherDetail : typeSelect;
    
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            saveReimburseRequest(reasonText, amountInput, e.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveReimburseRequest(reasonText, amountInput, null);
    }
}

function saveReimburseRequest(reason, amount, imgData) {
    let requests = JSON.parse(localStorage.getItem('leaveRequests'));
    requests.push({ 
        id: Date.now(), 
        name: currentUser, 
        type: 'Reimburse',
        date: getTodayDateString(),
        days: 0,
        reason: reason,
        amount: amount,
        attachmentData: imgData,
        status: 'Diproses' 
    });
    localStorage.setItem('leaveRequests', JSON.stringify(requests));

    openModal('modal-success');
    document.getElementById('success-title').innerText = "Berhasil Diupload!";
    document.getElementById('success-msg').innerText = "Klaim reimbursement telah dikirim.";
}

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
        let statusColor = req.status === 'Disetujui' ? 'color:green;' : 'color:orange;';
        const item = `
            <div class="news-item" id="req-${req.id}" onclick="openInboxDetail(${req.id})">
                <div class="news-date" style="background:#e3f2fd; color:#1976d2;"><i class="fas fa-user"></i></div>
                <div class="news-content">
                    <h5 style="font-size:14px;">${req.name} - ${req.type}</h5>
                    <p style="font-size:11px;">${req.date}</p>
                </div>
                <span style="font-size:11px; font-weight:600; ${statusColor}">${req.status}</span>
                <i class="fas fa-chevron-right" style="margin-left:10px; font-size:10px; color:#ccc;"></i>
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
            <div class="news-item" onclick="openInboxDetail(${req.id})">
                <div class="news-date" style="background:#f5f5f5; color:#666;"><i class="fas fa-file-alt"></i></div>
                <div class="news-content">
                    <h5 style="font-size:14px;">Pengajuan ${req.type}</h5>
                    <p style="font-size:11px;">${req.date}</p>
                </div>
                <span style="font-size:11px; font-weight:600; ${statusColor}">${req.status}</span>
                <i class="fas fa-chevron-right" style="margin-left:10px; font-size:10px; color:#ccc;"></i>
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
        openInboxDetail(id);
    }
}

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

function updateProfilePic(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelectorAll('.avatar-large, .avatar-small').forEach(el => {
                el.style.backgroundImage = `url('${e.target.result}')`;
            });
            localStorage.setItem('profilePic_' + currentUser, e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
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
    
    let gajiPokok, tunjanganTotal, lembur, total;
    const tTransport = "Rp 600.000";
    const tMakan = "Rp 500.000";
    const tKesehatan = "Rp 400.000";

    if (period === 'nov') {
        gajiPokok = "Rp 5.200.000";
        tunjanganTotal = "Rp 1.500.000";
        lembur = "Rp 1.000.000";
        total = "Rp 7.700.000";
    } else {
        gajiPokok = "Rp 5.200.000";
        tunjanganTotal = "Rp 1.500.000";
        lembur = "Rp 1.750.000";
        total = "Rp 8.450.000";
    }

    content.innerHTML = `
        <div class="row"><span>Gaji Pokok</span><b>${gajiPokok}</b></div>
        <div class="row"><span>Tunjangan Tetap</span><b>${tunjanganTotal}</b></div>
        <div class="row sub-row"><span>- Transportasi</span><span>${tTransport}</span></div>
        <div class="row sub-row"><span>- Uang Makan</span><span>${tMakan}</span></div>
        <div class="row sub-row"><span>- BPJS Kesehatan</span><span>${tKesehatan}</span></div>
        <div style="margin-bottom:10px;"></div>
        <div class="row green"><span>Lembur</span><b>${lembur}</b></div>
        <hr>
        <div class="row total"><span>Total Diterima</span><b style="color:var(--primary-green);">${total}</b></div>
    `;
}

// --- RENDER DETAIL PEKERJAAN (UPDATED: LEBIH PANJANG) ---
function renderJobDetail() {
    const titleEl = document.getElementById('job-detail-title');
    const contentEl = document.getElementById('job-desc-content');
    
    titleEl.innerText = currentJobTitle;
    
    let items = [];
    if(isHRD) {
        items = [
            { title: "Strategic HR Planning", desc: "Merancang strategi jangka panjang pengelolaan SDM agar selaras dengan visi misi perusahaan, termasuk perencanaan suksesi dan pengembangan karir." },
            { title: "Talent Acquisition & Recruitment", desc: "Mengelola seluruh siklus rekrutmen mulai dari sourcing, interviewing, hingga onboarding karyawan baru untuk level staff hingga manajerial." },
            { title: "Payroll & Compensation", desc: "Memastikan akurasi perhitungan gaji, lembur, bonus, dan tunjangan lainnya sesuai dengan peraturan ketenagakerjaan yang berlaku." },
            { title: "Industrial Relations", desc: "Menangani hubungan industrial, penyelesaian perselisihan, dan memastikan lingkungan kerja yang kondusif bagi seluruh karyawan." }
        ];
    } else {
        items = [
            { title: "Supervisi Operasional Produksi", desc: "Memastikan target produksi harian tercapai (500.000 sachet/shift) dengan tetap menjaga standar kualitas produk Sido Muncul." },
            { title: "Quality Control & GMP", desc: "Mengawasi penerapan Good Manufacturing Practice (GMP) dan K3 di area produksi ekstraksi herbal untuk mencegah kontaminasi produk." },
            { title: "Manajemen Tim Operator", desc: "Mengatur jadwal shift, pembagian tugas harian, dan memberikan arahan teknis kepada 30 operator mesin produksi." },
            { title: "Laporan & Analisis Downtime", desc: "Membuat laporan harian output produksi serta menganalisis penyebab downtime mesin untuk perbaikan berkelanjutan." }
        ];
    }

    let html = '';
    items.forEach(item => { 
        html += `
        <div class="job-desc-item">
            <h5>${item.title}</h5>
            <p>${item.desc}</p>
        </div>`; 
    });
    contentEl.innerHTML = html;
}

// --- RENDER PENDIDIKAN (UPDATED: LEBIH PANJANG) ---
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
                    <h5>S2 Magister Manajemen (SDM)</h5>
                    <span>Universitas Gadjah Mada (2019 - 2021)</span>
                    <p>Tesis: "Pengaruh Work-Life Balance Terhadap Produktivitas Karyawan Milenial di Industri FMCG". IPK: 3.85</p>
                </div>
            </div>
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>S1 Psikologi</h5>
                    <span>Universitas Indonesia (2014 - 2018)</span>
                    <p>Aktif dalam BEM Fakultas Psikologi sebagai Kepala Departemen Advokasi Mahasiswa.</p>
                </div>
            </div>`;
        
        expHtml = `
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>HR Manager</h5>
                    <span>PT Sido Muncul Tbk (2023 - Sekarang)</span>
                    <p>Bertanggung jawab atas pengelolaan 500+ karyawan pabrik dan kantor pusat, serta digitalisasi sistem HR.</p>
                </div>
            </div>
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>HR Business Partner</h5>
                    <span>PT Unilever Indonesia (2020 - 2023)</span>
                    <p>Menangani divisi Sales & Marketing, fokus pada talent retention dan engagement program.</p>
                </div>
            </div>`;
    } else {
        eduHtml = `
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>S1 Teknologi Pangan</h5>
                    <span>IPB University (2016 - 2020)</span>
                    <p>Skripsi: "Optimasi Ekstraksi Senyawa Bioaktif pada Rimpang Jahe Merah Menggunakan Metode Maserasi". IPK: 3.75</p>
                </div>
            </div>
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>SMA Taruna Nusantara</h5>
                    <span>Jurusan IPA (2013 - 2016)</span>
                    <p>Lulusan terbaik bidang akademik Biologi.</p>
                </div>
            </div>`;
        
        expHtml = `
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>Supervisor Produksi</h5>
                    <span>PT Sido Muncul Tbk (2023 - Sekarang)</span>
                    <p>Mengelola lini produksi Tolak Angin Cair, memastikan efisiensi mesin mencapai 95% dan zero accident.</p>
                </div>
            </div>
            <div class="timeline-item">
                <div class="tl-point"></div>
                <div class="tl-content">
                    <h5>Quality Assurance Staff</h5>
                    <span>PT Kalbe Farma (2020 - 2023)</span>
                    <p>Melakukan audit internal ISO 9001 dan memastikan kepatuhan standar CPOB di area produksi steril.</p>
                </div>
            </div>`;
    }

    eduEl.innerHTML = eduHtml;
    expEl.innerHTML = expHtml;
}

function openModal(modalId) { document.getElementById(modalId).classList.remove('hidden'); }
function closeModal(modalId) { document.getElementById(modalId).classList.add('hidden'); }

// --- FUNGSI OPEN TEAM MODAL (UPDATED) ---
function openTeamModal() {
    if(!isHRD) return; 
    
    // DATA TIM LENGKAP
    const team = [
        {name: 'Shafa', role: 'Staff Marketing', phone: '08123456789', email: 'shafa@sidomuncul.id'},
        {name: 'Tafta', role: 'Staff Produksi', phone: '08129876543', email: 'tafta@sidomuncul.id'},
        {name: 'Rayisha', role: 'Staff Gudang', phone: '08121112223', email: 'rayisha@sidomuncul.id'},
        {name: 'Kayla', role: 'Staff Finance', phone: '08123334445', email: 'kayla@sidomuncul.id'},
        {name: 'Salsabila', role: 'Staff HR', phone: '08125556667', email: 'salsabila@sidomuncul.id'}
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
                <i class="fas fa-phone-alt" onclick="alert('Memanggil ${t.name} (${t.phone})...')"></i>
                <i class="fas fa-envelope" onclick="alert('Mengirim email ke ${t.email}...')"></i>
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

function clockIn(btn) { 
    const status = localStorage.getItem('clockStatus'); if (status === 'in' || status === 'out') return; 
    let logs = JSON.parse(localStorage.getItem('attendanceLogs'));
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes()}`;
    const day = now.getDate(); const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    logs.unshift({ name: currentUser, d: day, m: months[now.getMonth()], in: timeString, out: '-', status: 'Hadir', class: 'ontime', timeClass: '' });
    localStorage.setItem('attendanceLogs', JSON.stringify(logs));
    localStorage.setItem('clockStatus', 'in');
    updateClockButtons(); renderAttendance(); updateStats();
}
function clockOut(btn) {
    const status = localStorage.getItem('clockStatus'); if (status !== 'in') return;
    let logs = JSON.parse(localStorage.getItem('attendanceLogs'));
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes()}`;
    if(logs.length > 0 && logs[0].out === '-') { logs[0].out = timeString; localStorage.setItem('attendanceLogs', JSON.stringify(logs)); localStorage.setItem('clockStatus', 'out'); updateClockButtons(); renderAttendance(); }
}
function updateClockButtons() {
    const status = localStorage.getItem('clockStatus');
    const btnIn = document.querySelectorAll('.btn-in'); const btnOut = document.querySelectorAll('.btn-out');
    if (status === 'in') { btnIn.forEach(b => {b.innerHTML = '<i class="fas fa-check"></i> Masuk'; b.classList.add('disabled');}); btnOut.forEach(b => {b.classList.remove('disabled');}); }
    else if (status === 'out') { btnIn.forEach(b => {b.innerHTML = '<i class="fas fa-check"></i> Masuk'; b.classList.add('disabled');}); btnOut.forEach(b => {b.innerHTML = '<i class="fas fa-check"></i> Pulang'; b.classList.add('disabled');}); }
    else { btnIn.forEach(b => {b.innerHTML = '<i class="fas fa-sign-in-alt"></i> Masuk'; b.classList.remove('disabled');}); btnOut.forEach(b => {b.classList.add('disabled');}); }
}
