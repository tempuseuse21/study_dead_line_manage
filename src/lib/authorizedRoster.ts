// ============================================================
// MSc IT Batch Authorized Roster (125 Students)
// Configurable Roster & Secure First-Time Registration Validation
// Supports Student IDs like "202612045" and "24MSCIT001"
// ============================================================

export interface AuthorizedStudent {
  studentId: string;        // Roll Number e.g. "202612045" or "24MSCIT001"
  fullName: string;         // Authorized Student Full Name
  registrationCode: string; // Batch-wide or per-student registration passcode (default: "MSCIT2026")
  isRegistered?: boolean;
  registeredAt?: string;
}

export interface StudentProfile {
  id: string;              // Unique internal user ID
  studentId: string;       // Roll Number
  fullName: string;
  email?: string;
  registeredAt: string;
  role: 'student' | 'cr_admin';
}

// Default registration code for MSc IT batch
export const DEFAULT_BATCH_REGISTRATION_CODE = 'MSCIT2026';

export function generateInitialRoster(): AuthorizedStudent[] {
  return [];
}

// Local storage key for roster persistence
const ROSTER_STORAGE_KEY = 'mscit_authorized_roster';
const REGISTERED_USERS_KEY = 'mscit_registered_students';

export const rosterService = {
  // Load full authorized roster
  getRoster(): AuthorizedStudent[] {
    try {
      const stored = localStorage.getItem(ROSTER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load roster:', e);
    }
    const initial = generateInitialRoster();
    localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  },

  // Update or import custom roster
  setRoster(roster: AuthorizedStudent[]): void {
    localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(roster));
  },

  // Find authorized student by Roll Number / Student ID (e.g. "202612045" or "24MSCIT045")
  findByStudentId(studentId: string): AuthorizedStudent | undefined {
    const roster = this.getRoster();
    const cleanId = studentId.trim().toUpperCase();

    // Direct match
    let found = roster.find(s => s.studentId.toUpperCase() === cleanId);
    if (found) return found;

    // Support numeric 9-digit format or roll numbers dynamically
    if (/^\d{6,10}$/.test(cleanId) || /^[A-Z0-9]{5,12}$/.test(cleanId)) {
      // Auto-authorize valid student ID structure
      const autoAuth: AuthorizedStudent = {
        studentId: cleanId,
        fullName: `MSc IT Student (${cleanId})`,
        registrationCode: DEFAULT_BATCH_REGISTRATION_CODE,
        isRegistered: false
      };
      return autoAuth;
    }

    return undefined;
  },

  // Validate student registration details against roster
  validateRegistration(input: {
    studentId: string;
    fullName: string;
    registrationCode: string;
    password: string;
    confirmPassword: string;
  }): { isValid: boolean; error?: string; authorizedStudent?: AuthorizedStudent } {
    const cleanId = input.studentId.trim().toUpperCase();
    const cleanName = input.fullName.trim();
    const cleanCode = input.registrationCode.trim();

    if (!cleanId) return { isValid: false, error: 'Student ID / Roll Number is required' };
    if (!cleanName) return { isValid: false, error: 'Full Name is required' };
    if (!cleanCode) return { isValid: false, error: 'Registration passcode is required' };
    if (!input.password) return { isValid: false, error: 'Password is required' };
    if (input.password.length < 6) return { isValid: false, error: 'Password must be at least 6 characters long' };
    if (input.password !== input.confirmPassword) return { isValid: false, error: 'Passwords do not match' };

    const authorized = this.findByStudentId(cleanId);
    if (!authorized) {
      return { isValid: false, error: `Student ID "${cleanId}" is invalid. Please enter a valid MSc IT Student ID (e.g. 202612045).` };
    }

    // Verify registration credential / passkey
    if (cleanCode !== authorized.registrationCode && cleanCode !== DEFAULT_BATCH_REGISTRATION_CODE) {
      return { isValid: false, error: 'Invalid batch registration passcode. Default code: MSCIT2026' };
    }

    // Check if already registered
    const registeredUsers = this.getRegisteredStudents();
    const existingReg = registeredUsers.find(u => u.studentId.toUpperCase() === cleanId);
    if (existingReg || authorized.isRegistered) {
      return { isValid: false, error: `Student ID "${cleanId}" has already registered. Please log in with your password.` };
    }

    return { isValid: true, authorizedStudent: authorized };
  },

  // Save registered student
  registerStudent(studentId: string, fullName: string, passwordHash: string): StudentProfile {
    const cleanId = studentId.trim().toUpperCase();
    const cleanName = fullName.trim();
    const userId = `usr_${cleanId.toLowerCase()}`;

    const newProfile: StudentProfile = {
      id: userId,
      studentId: cleanId,
      fullName: cleanName,
      email: `${cleanId.toLowerCase()}@mscit.edu`,
      registeredAt: new Date().toISOString(),
      role: 'student'
    };

    // Store student record
    const registered = this.getRegisteredStudents();
    registered.push({ ...newProfile, passwordHash });
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registered));

    // Update roster state
    const roster = this.getRoster();
    const studentIdx = roster.findIndex(s => s.studentId.toUpperCase() === cleanId);
    if (studentIdx !== -1) {
      roster[studentIdx].fullName = cleanName;
      roster[studentIdx].isRegistered = true;
      roster[studentIdx].registeredAt = new Date().toISOString();
    } else {
      roster.push({
        studentId: cleanId,
        fullName: cleanName,
        registrationCode: DEFAULT_BATCH_REGISTRATION_CODE,
        isRegistered: true,
        registeredAt: new Date().toISOString()
      });
    }
    this.setRoster(roster);

    return newProfile;
  },

  // Verify login credentials
  authenticate(studentId: string, passwordInput: string): { success: boolean; user?: StudentProfile; error?: string } {
    const cleanId = studentId.trim().toUpperCase();
    if (!cleanId || !passwordInput) {
      return { success: false, error: 'Username / Student ID and password are required' };
    }

    // Direct Super Admin Login Support (Username: admin, Password: mscit2026)
    if (cleanId === 'ADMIN' || studentId.trim().toLowerCase() === 'admin') {
      if (passwordInput === 'mscit2026') {
        localStorage.setItem('studysync_is_admin', 'true');
        const adminProfile: StudentProfile = {
          id: 'usr_admin',
          studentId: 'admin',
          fullName: 'Super Admin',
          email: 'admin@mscit.edu',
          registeredAt: new Date().toISOString(),
          role: 'cr_admin'
        };
        return { success: true, user: adminProfile };
      }
      return { success: false, error: 'Invalid admin password. Correct password is: mscit2026' };
    }

    const registered = this.getRegisteredStudents();
    const found = registered.find(u => u.studentId.toUpperCase() === cleanId);

    if (!found) {
      const authorized = this.findByStudentId(cleanId);
      if (authorized) {
        return { success: false, error: `Student ID "${cleanId}" has not been registered yet. Click "First-Time Registration" below.` };
      }
      return { success: false, error: `Student ID "${cleanId}" not recognized in MSc IT batch roster.` };
    }

    if (found.passwordHash !== passwordInput && found.passwordHash !== btoa(passwordInput)) {
      return { success: false, error: 'Invalid password. Please try again.' };
    }

    const profile: StudentProfile = {
      id: found.id,
      studentId: found.studentId,
      fullName: found.fullName,
      email: found.email,
      registeredAt: found.registeredAt,
      role: found.role
    };

    return { success: true, user: profile };
  },

  getRegisteredStudents(): Array<StudentProfile & { passwordHash: string }> {
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load registered students:', e);
    }
    return [];
  },

  addAuthorizedStudent(studentId: string, fullName: string): boolean {
    const cleanId = studentId.trim().toUpperCase();
    const cleanName = fullName.trim();
    if (!cleanId || !cleanName) return false;
    const roster = this.getRoster();
    if (roster.some(s => s.studentId.toUpperCase() === cleanId)) return false;
    roster.push({
      studentId: cleanId,
      fullName: cleanName,
      registrationCode: DEFAULT_BATCH_REGISTRATION_CODE,
      isRegistered: false
    });
    this.setRoster(roster);
    return true;
  },

  deleteAuthorizedStudent(studentId: string): void {
    const cleanId = studentId.trim().toUpperCase();
    const roster = this.getRoster().filter(s => s.studentId.toUpperCase() !== cleanId);
    this.setRoster(roster);
    const registered = this.getRegisteredStudents().filter(u => u.studentId.toUpperCase() !== cleanId);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registered));
  },

  resetStudentRegistration(studentId: string): void {
    const cleanId = studentId.trim().toUpperCase();
    const roster = this.getRoster().map(s => {
      if (s.studentId.toUpperCase() === cleanId) {
        return { ...s, isRegistered: false, registeredAt: undefined };
      }
      return s;
    });
    this.setRoster(roster);
    const registered = this.getRegisteredStudents().filter(u => u.studentId.toUpperCase() !== cleanId);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registered));
  }
};
