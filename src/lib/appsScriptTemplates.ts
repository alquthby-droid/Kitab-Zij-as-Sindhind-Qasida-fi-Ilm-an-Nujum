export interface AppsScriptConfig {
  appTitle: string;
  defaultUsername: string;
  defaultPassword: string;
  usersSheetName: string;
  dataSheetName: string;
}

export const DEFAULT_APPS_SCRIPT_CONFIG: AppsScriptConfig = {
  appTitle: 'Portal Login Google Sheet - Zij as-Sindhind',
  defaultUsername: 'Husni75',
  defaultPassword: '12345678',
  usersSheetName: 'Users',
  dataSheetName: 'DataSheet',
};

function escapeJsString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n');
}

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Menghasilkan file Code.gs siap pakai untuk Google Apps Script (V8 Runtime)
 * yang terhubung ke Google Sheets dengan fitur:
 * - Login aman (SHA-256 + Salt di sheet Users, session token di CacheService)
 * - Akun default (Husni75 / 12345678) otomatis dibuat saat pertama dijalankan
 * - Ubah Password langsung memperbarui hash & salt pada Google Sheet
 * - Baca, Tambah, dan Hapus baris pada sheet data secara terautentikasi
 */
export function generateCodeGs(config: AppsScriptConfig): string {
  const appTitle = escapeJsString(config.appTitle.trim() || DEFAULT_APPS_SCRIPT_CONFIG.appTitle);
  const defaultUsername = escapeJsString(
    config.defaultUsername.trim() || DEFAULT_APPS_SCRIPT_CONFIG.defaultUsername
  );
  const defaultPassword = escapeJsString(
    config.defaultPassword || DEFAULT_APPS_SCRIPT_CONFIG.defaultPassword
  );
  const usersSheetName = escapeJsString(
    config.usersSheetName.trim() || DEFAULT_APPS_SCRIPT_CONFIG.usersSheetName
  );
  const dataSheetName = escapeJsString(
    config.dataSheetName.trim() || DEFAULT_APPS_SCRIPT_CONFIG.dataSheetName
  );

  return `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - SISTEM LOGIN, UBAH PASSWORD & KELOLA GOOGLE SHEET
 * ============================================================================
 * Aplikasi       : ${appTitle}
 * Akun Default   : Username "${defaultUsername}" | Password "${defaultPassword}"
 * Sheet Pengguna : "${usersSheetName}"
 * Sheet Data     : "${dataSheetName}"
 *
 * Cara Pasang:
 * 1. Buka Google Sheet Anda -> Menu Ekstensi (Extensions) -> Apps Script
 * 2. Hapus kode lama di file Code.gs lalu tempel (paste) seluruh isi file ini
 * 3. Klik tombol (+) di sebelah "File" -> pilih HTML -> beri nama persis: Index
 * 4. Tempel (paste) isi file Index.html ke dalam file Index.html tersebut
 * 5. Simpan (Ctrl+S), jalankan fungsi "setupInitialSheets" sekali untuk inisialisasi
 * 6. Klik Terapkan (Deploy) -> Deployment baru -> Aplikasi Web (Web app)
 *    - Jalankan sebagai (Execute as): Saya (Me)
 *    - Yang memiliki akses (Who has access): Siapa saja (Anyone)
 * ============================================================================
 */

var APP_CONFIG = {
  APP_TITLE: '${appTitle}',
  USERS_SHEET: '${usersSheetName}',
  DATA_SHEET: '${dataSheetName}',
  DEFAULT_USERNAME: '${defaultUsername}',
  DEFAULT_PASSWORD: '${defaultPassword}',
  SESSION_TTL_SECONDS: 21600 // 6 jam
};

/**
 * Menambahkan menu kustom di Google Sheet saat dibuka
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Sistem Login Sheet')
    .addItem('Inisialisasi Sheet Users & Data', 'setupInitialSheets')
    .addItem('Reset Password Akun Default', 'resetDefaultUserPassword')
    .addToUi();
}

/**
 * Endpoint utama Web App untuk merender Index.html
 */
function doGet() {
  ensureSheetsInitialized_();
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle(APP_CONFIG.APP_TITLE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Fungsi manual / menu untuk membuat sheet Users & Data beserta akun default
 */
function setupInitialSheets() {
  ensureSheetsInitialized_();
  try {
    SpreadsheetApp.getUi().alert(
      'Inisialisasi Berhasil',
      'Sheet "' + APP_CONFIG.USERS_SHEET + '" dan "' + APP_CONFIG.DATA_SHEET +
      '" siap digunakan.\\nAkun default: ' + APP_CONFIG.DEFAULT_USERNAME,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {
    Logger.log('Inisialisasi sheet berhasil.');
  }
}

/**
 * Mengembalikan password akun default jika pengguna lupa password
 */
function resetDefaultUserPassword() {
  var sheet = ensureUsersSheet_();
  var data = sheet.getDataRange().getValues();
  var salt = generateRandomToken_(16);
  var hash = hashPassword_(APP_CONFIG.DEFAULT_PASSWORD, salt);
  var nowStr = formatTimestamp_(new Date());

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === APP_CONFIG.DEFAULT_USERNAME.toLowerCase()) {
      sheet.getRange(i + 1, 2).setValue(hash);
      sheet.getRange(i + 1, 3).setValue(salt);
      sheet.getRange(i + 1, 5).setValue(nowStr);
      SpreadsheetApp.flush();
      return { success: true, message: 'Password akun default telah direset.' };
    }
  }

  sheet.appendRow([APP_CONFIG.DEFAULT_USERNAME, hash, salt, 'Admin', nowStr]);
  SpreadsheetApp.flush();
  return { success: true, message: 'Akun default dibuat ulang.' };
}

/**
 * Autentikasi Login Pengguna
 */
function loginUser(username, password) {
  try {
    ensureSheetsInitialized_();

    var cleanUser = String(username || '').trim();
    var cleanPass = String(password || '');

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'Username dan password wajib diisi.' };
    }

    var sheet = ensureUsersSheet_();
    var rows = sheet.getDataRange().getValues();
    var matchedRow = null;

    for (var i = 1; i < rows.length; i++) {
      var rowUser = String(rows[i][0] || '').trim();
      if (rowUser.toLowerCase() === cleanUser.toLowerCase()) {
        matchedRow = {
          rowIndex: i + 1,
          username: rowUser,
          passwordHash: String(rows[i][1] || ''),
          salt: String(rows[i][2] || ''),
          role: String(rows[i][3] || 'User'),
          updatedAt: String(rows[i][4] || '')
        };
        break;
      }
    }

    if (!matchedRow) {
      return { success: false, message: 'Username tidak ditemukan.' };
    }

    var expectedHash = hashPassword_(cleanPass, matchedRow.salt);
    if (expectedHash !== matchedRow.passwordHash) {
      return { success: false, message: 'Password salah. Silakan periksa kembali.' };
    }

    var token = generateRandomToken_(32);
    var sessionPayload = JSON.stringify({
      username: matchedRow.username,
      role: matchedRow.role,
      loginAt: formatTimestamp_(new Date())
    });

    CacheService.getScriptCache().put(
      'SESSION_' + token,
      sessionPayload,
      APP_CONFIG.SESSION_TTL_SECONDS
    );

    return {
      success: true,
      token: token,
      username: matchedRow.username,
      role: matchedRow.role,
      updatedAt: matchedRow.updatedAt,
      message: 'Login berhasil.'
    };
  } catch (err) {
    return { success: false, message: 'Terjadi kesalahan server: ' + err.message };
  }
}

/**
 * Verifikasi apakah token sesi masih aktif
 */
function verifySession(token) {
  var session = getSessionData_(token);
  if (!session) {
    return { valid: false };
  }
  return {
    valid: true,
    username: session.username,
    role: session.role,
    loginAt: session.loginAt
  };
}

/**
 * Keluar dan hapus token sesi dari CacheService
 */
function logoutUser(token) {
  if (token) {
    CacheService.getScriptCache().remove('SESSION_' + String(token));
  }
  return { success: true };
}

/**
 * Ubah Password Pengguna yang Sedang Login
 */
function changePassword(token, oldPassword, newPassword) {
  try {
    var session = getSessionData_(token);
    if (!session) {
      return {
        success: false,
        expired: true,
        message: 'Sesi login telah berakhir. Silakan login kembali.'
      };
    }

    var oldPassStr = String(oldPassword || '');
    var newPassStr = String(newPassword || '');

    if (!oldPassStr || !newPassStr) {
      return { success: false, message: 'Password lama dan password baru wajib diisi.' };
    }

    if (newPassStr.length < 6) {
      return { success: false, message: 'Password baru minimal harus 6 karakter.' };
    }

    if (oldPassStr === newPassStr) {
      return { success: false, message: 'Password baru tidak boleh sama dengan password lama.' };
    }

    var sheet = ensureUsersSheet_();
    var rows = sheet.getDataRange().getValues();

    for (var i = 1; i < rows.length; i++) {
      var rowUser = String(rows[i][0] || '').trim();
      if (rowUser.toLowerCase() === session.username.toLowerCase()) {
        var currentHash = String(rows[i][1] || '');
        var currentSalt = String(rows[i][2] || '');
        var verifyOldHash = hashPassword_(oldPassStr, currentSalt);

        if (verifyOldHash !== currentHash) {
          return { success: false, message: 'Password lama tidak sesuai.' };
        }

        var newSalt = generateRandomToken_(16);
        var newHash = hashPassword_(newPassStr, newSalt);
        var updatedAt = formatTimestamp_(new Date());

        sheet.getRange(i + 1, 2).setValue(newHash);
        sheet.getRange(i + 1, 3).setValue(newSalt);
        sheet.getRange(i + 1, 5).setValue(updatedAt);
        SpreadsheetApp.flush();

        return {
          success: true,
          updatedAt: updatedAt,
          message: 'Password untuk "' + rowUser + '" berhasil diperbarui di Google Sheet.'
        };
      }
    }

    return { success: false, message: 'Akun pengguna tidak ditemukan di sheet Users.' };
  } catch (err) {
    return { success: false, message: 'Gagal mengubah password: ' + err.message };
  }
}

/**
 * Membaca data dari sheet DataSheet (khusus pengguna terautentikasi)
 */
function getSheetRows(token) {
  try {
    var session = getSessionData_(token);
    if (!session) {
      return { success: false, expired: true, message: 'Sesi habis. Silakan login kembali.' };
    }

    var sheet = ensureDataSheet_();
    var values = sheet.getDataRange().getDisplayValues();
    if (values.length <= 1) {
      return {
        success: true,
        sheetName: sheet.getName(),
        headers: values[0] || ['ID', 'Tanggal', 'Judul', 'Keterangan', 'Dibuat Oleh'],
        rows: []
      };
    }

    var headers = values[0];
    var rows = [];
    for (var i = 1; i < values.length; i++) {
      rows.push({
        rowNumber: i + 1,
        cells: values[i]
      });
    }

    return {
      success: true,
      sheetName: sheet.getName(),
      headers: headers,
      rows: rows.reverse()
    };
  } catch (err) {
    return { success: false, message: 'Gagal membaca Google Sheet: ' + err.message };
  }
}

/**
 * Menambahkan baris baru ke sheet DataSheet
 */
function addSheetRow(token, payload) {
  try {
    var session = getSessionData_(token);
    if (!session) {
      return { success: false, expired: true, message: 'Sesi habis. Silakan login kembali.' };
    }

    var judul = String((payload && payload.judul) || '').trim();
    var keterangan = String((payload && payload.keterangan) || '').trim();
    if (!judul) {
      return { success: false, message: 'Judul / nama entri wajib diisi.' };
    }

    var sheet = ensureDataSheet_();
    var id = 'ROW-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
    var tanggal = formatTimestamp_(new Date());

    sheet.appendRow([id, tanggal, judul, keterangan, session.username]);
    SpreadsheetApp.flush();

    return {
      success: true,
      message: 'Data baru berhasil disimpan ke Google Sheet.'
    };
  } catch (err) {
    return { success: false, message: 'Gagal menambahkan baris: ' + err.message };
  }
}

/**
 * Menghapus baris berdasarkan nomor baris pada Google Sheet
 */
function deleteSheetRow(token, rowNumber) {
  try {
    var session = getSessionData_(token);
    if (!session) {
      return { success: false, expired: true, message: 'Sesi habis. Silakan login kembali.' };
    }

    var num = Number(rowNumber);
    var sheet = ensureDataSheet_();
    if (!num || num < 2 || num > sheet.getLastRow()) {
      return { success: false, message: 'Nomor baris tidak valid.' };
    }

    sheet.deleteRow(num);
    SpreadsheetApp.flush();
    return { success: true, message: 'Baris #' + num + ' berhasil dihapus.' };
  } catch (err) {
    return { success: false, message: 'Gagal menghapus baris: ' + err.message };
  }
}

/* ============================================================================
 * FUNGSI INTERNAL (PRIVATE HELPERS)
 * ============================================================================ */

function ensureSheetsInitialized_() {
  ensureUsersSheet_();
  ensureDataSheet_();
}

function ensureUsersSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(APP_CONFIG.USERS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(APP_CONFIG.USERS_SHEET);
    sheet.appendRow(['Username', 'PasswordHash', 'Salt', 'Role', 'UpdatedAt']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#e2e8f0');
    sheet.setFrozenRows(1);
  }

  if (sheet.getLastRow() < 2) {
    var initialSalt = generateRandomToken_(16);
    var initialHash = hashPassword_(APP_CONFIG.DEFAULT_PASSWORD, initialSalt);
    sheet.appendRow([
      APP_CONFIG.DEFAULT_USERNAME,
      initialHash,
      initialSalt,
      'Admin',
      formatTimestamp_(new Date())
    ]);
    SpreadsheetApp.flush();
  }

  return sheet;
}

function ensureDataSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(APP_CONFIG.DATA_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(APP_CONFIG.DATA_SHEET);
    sheet.appendRow(['ID', 'Tanggal', 'Judul', 'Keterangan', 'Dibuat Oleh']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#fef3c7');
    sheet.setFrozenRows(1);
    SpreadsheetApp.flush();
  }

  return sheet;
}

function getSessionData_(token) {
  if (!token) return null;
  var raw = CacheService.getScriptCache().get('SESSION_' + String(token));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function hashPassword_(password, salt) {
  var input = String(salt) + '::' + String(password);
  var rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    input,
    Utilities.Charset.UTF_8
  );
  return rawHash
    .map(function (b) {
      var v = b < 0 ? b + 256 : b;
      return ('0' + v.toString(16)).slice(-2);
    })
    .join('');
}

function generateRandomToken_(length) {
  var raw = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  return raw.slice(0, length || 24);
}

function formatTimestamp_(dateObj) {
  return Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}
`;
}

/**
 * Menghasilkan file Index.html siap pakai untuk Google Apps Script Web App
 * Lengkap dengan:
 * - Form Login responsif (Android/iOS/Desktop)
 * - Dashboard Data Google Sheet (Baca, Tambah, Hapus baris dengan modal konfirmasi)
 * - Fitur Ubah Password (Password Lama, Password Baru, Konfirmasi) terhubung ke Code.gs
 */
export function generateIndexHtml(config: AppsScriptConfig): string {
  const appTitle = escapeHtmlText(config.appTitle.trim() || DEFAULT_APPS_SCRIPT_CONFIG.appTitle);
  const defaultUsername = escapeHtmlText(
    config.defaultUsername.trim() || DEFAULT_APPS_SCRIPT_CONFIG.defaultUsername
  );

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${appTitle}</title>
  <style>
    :root {
      --bg: #0b101b;
      --surface: #121a2a;
      --surface-2: #182236;
      --border: #26344f;
      --text: #ece6da;
      --muted: #9aa7bd;
      --accent: #c59a43;
      --accent-hover: #d7ab50;
      --emerald: #10b981;
      --danger: #ef4444;
      --radius: 14px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: radial-gradient(circle at top right, #182338 0%, var(--bg) 55%);
      color: var(--text);
      min-height: 100vh;
      line-height: 1.5;
      padding: 16px;
    }

    .container {
      max-width: 960px;
      margin: 0 auto;
    }

    .hidden { display: none !important; }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
    }

    .auth-wrap {
      max-width: 420px;
      margin: 6vh auto;
    }

    .brand-eyebrow {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--accent);
      font-weight: 700;
      margin-bottom: 6px;
    }

    h1 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 6px;
    }

    h2 {
      font-size: 17px;
      font-weight: 700;
    }

    .subtitle {
      font-size: 13px;
      color: var(--muted);
      margin-bottom: 20px;
    }

    .field {
      margin-bottom: 14px;
    }

    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
      margin-bottom: 6px;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    input[type="text"],
    input[type="password"],
    textarea {
      width: 100%;
      min-height: 44px;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--surface-2);
      color: var(--text);
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s ease;
    }

    input:focus, textarea:focus {
      border-color: var(--accent);
    }

    .toggle-pass {
      position: absolute;
      right: 8px;
      background: transparent;
      border: none;
      color: var(--muted);
      font-size: 12px;
      font-weight: 600;
      padding: 6px 8px;
      cursor: pointer;
    }

    .toggle-pass:hover { color: var(--text); }

    .btn {
      min-height: 44px;
      padding: 10px 16px;
      border-radius: 10px;
      border: 1px solid transparent;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.15s ease;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--accent);
      color: #111827;
      width: 100%;
    }

    .btn-primary:hover:not(:disabled) { background: var(--accent-hover); }

    .btn-emerald {
      background: var(--emerald);
      color: #052e16;
    }

    .btn-emerald:hover:not(:disabled) { filter: brightness(1.08); }

    .btn-outline {
      background: transparent;
      border-color: var(--border);
      color: var(--text);
    }

    .btn-outline:hover:not(:disabled) {
      border-color: var(--accent);
      color: var(--accent);
    }

    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.4);
      color: #fca5a5;
    }

    .btn-danger:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.25);
    }

    .alert {
      padding: 11px 14px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 16px;
      border: 1px solid transparent;
    }

    .alert-error {
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.4);
      color: #fca5a5;
    }

    .alert-success {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.4);
      color: #6ee7b7;
    }

    .topbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 20px;
    }

    .topbar-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .user-meta {
      font-size: 12px;
      color: var(--muted);
      margin-top: 2px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 18px;
    }

    @media (min-width: 780px) {
      .grid-2 { grid-template-columns: 340px 1fr; align-items: start; }
    }

    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-top: 14px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    th, td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }

    th {
      background: var(--surface-2);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
      white-space: nowrap;
    }

    tr:last-child td { border-bottom: none; }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(5, 9, 18, 0.78);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 50;
    }

    .modal-card {
      width: 100%;
      max-width: 440px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 22px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }

    .hint-box {
      margin-top: 16px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(197, 154, 67, 0.08);
      border: 1px solid rgba(197, 154, 67, 0.25);
      font-size: 12px;
      color: var(--muted);
    }

    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- ==================== HALAMAN LOGIN ==================== -->
    <section id="loginView" class="auth-wrap">
      <div class="card">
        <div class="brand-eyebrow">Google Sheets Web App</div>
        <h1>${appTitle}</h1>
        <p class="subtitle">Masuk dengan akun terdaftar untuk mengelola data Google Sheet dan pengaturan kata sandi.</p>

        <div id="loginAlert" class="alert hidden"></div>

        <form id="loginForm">
          <div class="field">
            <label for="loginUsername">User Name</label>
            <input
              id="loginUsername"
              type="text"
              autocomplete="username"
              placeholder="Masukkan User Name"
              value="${defaultUsername}"
              required
            />
          </div>

          <div class="field">
            <label for="loginPassword">Password</label>
            <div class="input-wrap">
              <input
                id="loginPassword"
                type="password"
                autocomplete="current-password"
                placeholder="Masukkan Password"
                style="padding-right: 68px;"
                required
              />
              <button type="button" class="toggle-pass" onclick="togglePasswordVisibility('loginPassword', this)">Lihat</button>
            </div>
          </div>

          <button id="loginSubmitBtn" type="submit" class="btn btn-primary">
            Masuk ke Dashboard
          </button>
        </form>

        <div class="hint-box">
          Setelah berhasil login, Anda dapat langsung mengganti password melalui tombol <strong>Ubah Password</strong> di bagian atas dashboard.
        </div>
      </div>
    </section>

    <!-- ==================== DASHBOARD UTAMA ==================== -->
    <section id="dashboardView" class="hidden">
      <div class="card topbar">
        <div>
          <div class="brand-eyebrow">Google Sheets Terhubung</div>
          <h1>${appTitle}</h1>
          <div class="user-meta">
            Pengguna aktif: <strong id="activeUserLabel" class="mono">-</strong>
            <span aria-hidden="true"> · </span>
            <span id="activeRoleLabel">Admin</span>
          </div>
        </div>
        <div class="topbar-actions">
          <button type="button" class="btn btn-outline" onclick="openPasswordModal()">
            Ubah Password
          </button>
          <button type="button" class="btn btn-outline" onclick="loadSheetRows()">
            Segarkan Data
          </button>
          <button type="button" class="btn btn-danger" onclick="handleLogout()">
            Keluar
          </button>
        </div>
      </div>

      <div id="dashboardAlert" class="alert hidden"></div>

      <div class="grid-2">
        <!-- Form Tambah Baris -->
        <div class="card">
          <h2 style="margin-bottom: 6px;">Tambah Data ke Sheet</h2>
          <p class="subtitle" style="margin-bottom: 14px;">Entri baru akan langsung ditulis ke tab Google Sheet aktif.</p>

          <form id="addRowForm">
            <div class="field">
              <label for="rowJudul">Judul / Nama Entri</label>
              <input id="rowJudul" type="text" placeholder="Contoh: Catatan Pengamatan Falak" required />
            </div>
            <div class="field">
              <label for="rowKeterangan">Keterangan</label>
              <textarea id="rowKeterangan" rows="3" placeholder="Tulis detail catatan di sini..."></textarea>
            </div>
            <button id="addRowBtn" type="submit" class="btn btn-emerald" style="width: 100%;">
              Simpan ke Google Sheet
            </button>
          </form>
        </div>

        <!-- Tabel Data Google Sheet -->
        <div class="card">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap;">
            <div>
              <h2>Data Google Sheet (<span id="sheetNameLabel">-</span>)</h2>
              <p class="user-meta" id="rowCountLabel">Memuat data...</p>
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead id="sheetTableHead"></thead>
              <tbody id="sheetTableBody">
                <tr><td style="color:var(--muted);">Memuat data...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- ==================== MODAL UBAH PASSWORD ==================== -->
  <div id="passwordModal" class="modal-backdrop hidden" onclick="closePasswordModal()">
    <div class="modal-card" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h2>Ubah Password Akun</h2>
        <button type="button" class="btn btn-outline" style="min-height:34px; padding:4px 10px;" onclick="closePasswordModal()">Tutup</button>
      </div>

      <div id="passwordAlert" class="alert hidden"></div>

      <form id="changePasswordForm">
        <div class="field">
          <label for="oldPassword">Password Lama</label>
          <div class="input-wrap">
            <input id="oldPassword" type="password" placeholder="Masukkan password saat ini" style="padding-right: 68px;" required />
            <button type="button" class="toggle-pass" onclick="togglePasswordVisibility('oldPassword', this)">Lihat</button>
          </div>
        </div>

        <div class="field">
          <label for="newPassword">Password Baru (minimal 6 karakter)</label>
          <div class="input-wrap">
            <input id="newPassword" type="password" minlength="6" placeholder="Masukkan password baru" style="padding-right: 68px;" required />
            <button type="button" class="toggle-pass" onclick="togglePasswordVisibility('newPassword', this)">Lihat</button>
          </div>
        </div>

        <div class="field">
          <label for="confirmPassword">Konfirmasi Password Baru</label>
          <div class="input-wrap">
            <input id="confirmPassword" type="password" minlength="6" placeholder="Ulangi password baru" style="padding-right: 68px;" required />
            <button type="button" class="toggle-pass" onclick="togglePasswordVisibility('confirmPassword', this)">Lihat</button>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="closePasswordModal()">Batal</button>
          <button id="savePasswordBtn" type="submit" class="btn btn-emerald">Simpan Password Baru</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ==================== MODAL KONFIRMASI HAPUS ==================== -->
  <div id="deleteModal" class="modal-backdrop hidden" onclick="closeDeleteModal()">
    <div class="modal-card" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h2>Konfirmasi Hapus Baris</h2>
      </div>
      <p id="deleteModalText" class="subtitle" style="margin-bottom: 12px;"></p>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline" onclick="closeDeleteModal()">Batal</button>
        <button id="confirmDeleteBtn" type="button" class="btn btn-danger" onclick="confirmDeleteRow()">Hapus Baris</button>
      </div>
    </div>
  </div>

  <script>
    var authState = {
      token: null,
      username: null,
      role: null,
      pendingDeleteRow: null
    };

    function showAlert(elId, type, message) {
      var el = document.getElementById(elId);
      el.className = 'alert ' + (type === 'success' ? 'alert-success' : 'alert-error');
      el.textContent = message;
      el.classList.remove('hidden');
    }

    function hideAlert(elId) {
      document.getElementById(elId).classList.add('hidden');
    }

    function togglePasswordVisibility(inputId, btn) {
      var input = document.getElementById(inputId);
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Tutup';
      } else {
        input.type = 'password';
        btn.textContent = 'Lihat';
      }
    }

    function switchToDashboard(username, role) {
      document.getElementById('activeUserLabel').textContent = username;
      document.getElementById('activeRoleLabel').textContent = role || 'User';
      document.getElementById('loginView').classList.add('hidden');
      document.getElementById('dashboardView').classList.remove('hidden');
      loadSheetRows();
    }

    function switchToLogin(message) {
      authState.token = null;
      authState.username = null;
      authState.role = null;
      document.getElementById('dashboardView').classList.add('hidden');
      document.getElementById('loginView').classList.remove('hidden');
      document.getElementById('loginPassword').value = '';
      if (message) {
        showAlert('loginAlert', 'error', message);
      } else {
        hideAlert('loginAlert');
      }
    }

    // Handler Form Login
    document.getElementById('loginForm').addEventListener('submit', function (e) {
      e.preventDefault();
      hideAlert('loginAlert');

      var username = document.getElementById('loginUsername').value.trim();
      var password = document.getElementById('loginPassword').value;
      var btn = document.getElementById('loginSubmitBtn');

      btn.disabled = true;
      btn.textContent = 'Memverifikasi...';

      google.script.run
        .withSuccessHandler(function (res) {
          btn.disabled = false;
          btn.textContent = 'Masuk ke Dashboard';
          if (res && res.success) {
            authState.token = res.token;
            authState.username = res.username;
            authState.role = res.role;
            switchToDashboard(res.username, res.role);
          } else {
            showAlert('loginAlert', 'error', (res && res.message) || 'Login gagal.');
          }
        })
        .withFailureHandler(function (err) {
          btn.disabled = false;
          btn.textContent = 'Masuk ke Dashboard';
          showAlert('loginAlert', 'error', 'Gagal terhubung ke Apps Script: ' + err.message);
        })
        .loginUser(username, password);
    });

    // Handler Logout
    function handleLogout() {
      var tokenToClear = authState.token;
      switchToLogin();
      showAlert('loginAlert', 'success', 'Anda telah keluar dari sesi.');
      if (tokenToClear) {
        google.script.run.logoutUser(tokenToClear);
      }
    }

    // Modal Ubah Password
    function openPasswordModal() {
      hideAlert('passwordAlert');
      document.getElementById('changePasswordForm').reset();
      document.getElementById('passwordModal').classList.remove('hidden');
    }

    function closePasswordModal() {
      document.getElementById('passwordModal').classList.add('hidden');
    }

    document.getElementById('changePasswordForm').addEventListener('submit', function (e) {
      e.preventDefault();
      hideAlert('passwordAlert');

      var oldPass = document.getElementById('oldPassword').value;
      var newPass = document.getElementById('newPassword').value;
      var confirmPass = document.getElementById('confirmPassword').value;

      if (newPass.length < 6) {
        showAlert('passwordAlert', 'error', 'Password baru minimal 6 karakter.');
        return;
      }
      if (newPass !== confirmPass) {
        showAlert('passwordAlert', 'error', 'Konfirmasi password baru tidak cocok.');
        return;
      }

      var btn = document.getElementById('savePasswordBtn');
      btn.disabled = true;
      btn.textContent = 'Menyimpan...';

      google.script.run
        .withSuccessHandler(function (res) {
          btn.disabled = false;
          btn.textContent = 'Simpan Password Baru';

          if (res && res.expired) {
            closePasswordModal();
            switchToLogin(res.message);
            return;
          }

          if (res && res.success) {
            closePasswordModal();
            showAlert('dashboardAlert', 'success', res.message);
          } else {
            showAlert('passwordAlert', 'error', (res && res.message) || 'Gagal mengubah password.');
          }
        })
        .withFailureHandler(function (err) {
          btn.disabled = false;
          btn.textContent = 'Simpan Password Baru';
          showAlert('passwordAlert', 'error', 'Kesalahan server: ' + err.message);
        })
        .changePassword(authState.token, oldPass, newPass);
    });

    // Baca Data Sheet
    function loadSheetRows() {
      if (!authState.token) return;
      document.getElementById('rowCountLabel').textContent = 'Memuat data dari Google Sheet...';

      google.script.run
        .withSuccessHandler(function (res) {
          if (res && res.expired) {
            switchToLogin(res.message);
            return;
          }
          if (!res || !res.success) {
            showAlert('dashboardAlert', 'error', (res && res.message) || 'Gagal memuat data.');
            return;
          }

          document.getElementById('sheetNameLabel').textContent = res.sheetName;
          document.getElementById('rowCountLabel').textContent = res.rows.length + ' baris tersimpan';

          var headEl = document.getElementById('sheetTableHead');
          var bodyEl = document.getElementById('sheetTableBody');
          headEl.innerHTML = '';
          bodyEl.innerHTML = '';

          var headRow = document.createElement('tr');
          (res.headers || []).forEach(function (h) {
            var th = document.createElement('th');
            th.textContent = h;
            headRow.appendChild(th);
          });
          var actionTh = document.createElement('th');
          actionTh.textContent = 'Aksi';
          headRow.appendChild(actionTh);
          headEl.appendChild(headRow);

          if (!res.rows || res.rows.length === 0) {
            var emptyTr = document.createElement('tr');
            var emptyTd = document.createElement('td');
            emptyTd.colSpan = (res.headers ? res.headers.length : 5) + 1;
            emptyTd.style.color = 'var(--muted)';
            emptyTd.textContent = 'Belum ada data di sheet. Gunakan formulir di samping untuk menambahkan baris pertama.';
            emptyTr.appendChild(emptyTd);
            bodyEl.appendChild(emptyTr);
            return;
          }

          res.rows.forEach(function (item) {
            var tr = document.createElement('tr');
            item.cells.forEach(function (val) {
              var td = document.createElement('td');
              td.textContent = val;
              tr.appendChild(td);
            });

            var actionTd = document.createElement('td');
            var delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'btn btn-danger';
            delBtn.style.minHeight = '32px';
            delBtn.style.padding = '4px 10px';
            delBtn.style.fontSize = '12px';
            delBtn.textContent = 'Hapus';
            delBtn.onclick = function () {
              openDeleteModal(item.rowNumber, item.cells[2] || item.cells[0] || ('Baris #' + item.rowNumber));
            };
            actionTd.appendChild(delBtn);
            tr.appendChild(actionTd);
            bodyEl.appendChild(tr);
          });
        })
        .withFailureHandler(function (err) {
          showAlert('dashboardAlert', 'error', 'Gagal membaca Google Sheet: ' + err.message);
        })
        .getSheetRows(authState.token);
    }

    // Tambah Baris Baru
    document.getElementById('addRowForm').addEventListener('submit', function (e) {
      e.preventDefault();
      hideAlert('dashboardAlert');

      var judul = document.getElementById('rowJudul').value.trim();
      var keterangan = document.getElementById('rowKeterangan').value.trim();
      var btn = document.getElementById('addRowBtn');

      btn.disabled = true;
      btn.textContent = 'Menyimpan...';

      google.script.run
        .withSuccessHandler(function (res) {
          btn.disabled = false;
          btn.textContent = 'Simpan ke Google Sheet';

          if (res && res.expired) {
            switchToLogin(res.message);
            return;
          }
          if (res && res.success) {
            document.getElementById('addRowForm').reset();
            showAlert('dashboardAlert', 'success', res.message);
            loadSheetRows();
          } else {
            showAlert('dashboardAlert', 'error', (res && res.message) || 'Gagal menyimpan data.');
          }
        })
        .withFailureHandler(function (err) {
          btn.disabled = false;
          btn.textContent = 'Simpan ke Google Sheet';
          showAlert('dashboardAlert', 'error', 'Kesalahan server: ' + err.message);
        })
        .addSheetRow(authState.token, { judul: judul, keterangan: keterangan });
    });

    // Modal Hapus Baris
    function openDeleteModal(rowNumber, label) {
      authState.pendingDeleteRow = rowNumber;
      document.getElementById('deleteModalText').textContent =
        'Apakah Anda yakin ingin menghapus baris "' + label + '" (baris #' + rowNumber + ') dari Google Sheet?';
      document.getElementById('deleteModal').classList.remove('hidden');
    }

    function closeDeleteModal() {
      authState.pendingDeleteRow = null;
      document.getElementById('deleteModal').classList.add('hidden');
    }

    function confirmDeleteRow() {
      if (!authState.pendingDeleteRow) return;
      var rowNum = authState.pendingDeleteRow;
      var btn = document.getElementById('confirmDeleteBtn');
      btn.disabled = true;
      btn.textContent = 'Menghapus...';

      google.script.run
        .withSuccessHandler(function (res) {
          btn.disabled = false;
          btn.textContent = 'Hapus Baris';
          closeDeleteModal();

          if (res && res.expired) {
            switchToLogin(res.message);
            return;
          }
          if (res && res.success) {
            showAlert('dashboardAlert', 'success', res.message);
            loadSheetRows();
          } else {
            showAlert('dashboardAlert', 'error', (res && res.message) || 'Gagal menghapus baris.');
          }
        })
        .withFailureHandler(function (err) {
          btn.disabled = false;
          btn.textContent = 'Hapus Baris';
          closeDeleteModal();
          showAlert('dashboardAlert', 'error', 'Kesalahan server: ' + err.message);
        })
        .deleteSheetRow(authState.token, rowNum);
    }
  </script>
</body>
</html>
`;
}

/**
 * Mengunduh file teks (Code.gs atau Index.html) secara langsung di browser
 */
export function downloadAppsScriptFile(
  filename: string,
  content: string,
  mimeType = 'text/plain;charset=utf-8'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
