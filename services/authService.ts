
import { auth, googleProvider } from './firebase';
import { 
    signInWithPopup, 
    signOut as firebaseSignOut, 
    User as FirebaseUser, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    signInWithEmailAndPassword, 
    updatePassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updateEmail
} from 'firebase/auth';
import { User } from '../types';

const LICENSE_API_URL = "https://script.google.com/macros/s/AKfycbwC5xHIrnG39FMYU853IOAwrLGE4U25ZTZc_MbWXkhQHNgY27WIRXy48NmzXTkXhZeStQ/exec";

// Map Firebase User to App User Type
export const mapFirebaseUser = (fbUser: FirebaseUser): User => {
    return {
        id: fbUser.uid,
        name: fbUser.displayName || 'User',
        email: fbUser.email || '',
        passwordHash: '', // Not used with Google Auth
    };
};

export const loginWithGoogle = async (): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = mapFirebaseUser(result.user);
        return { success: true, message: 'Login berhasil!', user };
    } catch (error: any) {
        console.error("Firebase Login Error", error);
        return { success: false, message: error.message || 'Gagal login dengan Google.' };
    }
};

export const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        
        // Check Email Verification
        if (!result.user.emailVerified) {
            await firebaseSignOut(auth);
            return { success: false, message: 'Email belum diverifikasi. Silakan cek inbox email Anda.' };
        }

        const user = mapFirebaseUser(result.user);
        return { success: true, message: 'Login berhasil!', user };
    } catch (error: any) {
        console.error("Firebase Email Login Error", error);
        let message = 'Gagal login.';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            message = 'Email atau kata sandi salah.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Format email tidak valid.';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Terlalu banyak percobaan gagal. Coba lagi nanti.';
        }
        return { success: false, message: message !== 'Gagal login.' ? message : (error.message || message) };
    }
};

export const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        
        // Send Verification Email
        await sendEmailVerification(result.user);
        
        // Force Logout so they can't access app without verifying
        await firebaseSignOut(auth);

        // Note: user is undefined here because we logged out
        return { success: true, message: 'Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi sebelum login.' };
    } catch (error: any) {
        console.error("Firebase Register Error", error);
        let message = 'Gagal mendaftar.';
        if (error.code === 'auth/email-already-in-use') message = 'Email sudah digunakan.';
        if (error.code === 'auth/weak-password') message = 'Password terlalu lemah.';
        if (error.code === 'auth/invalid-email') message = 'Email tidak valid.';
        
        return { success: false, message: message !== 'Gagal mendaftar.' ? message : (error.message || message) };
    }
};

export const updateUserPassword = async (password: string): Promise<{ success: boolean; message: string }> => {
    const user = auth.currentUser;
    if (!user) {
        return { success: false, message: 'Tidak ada sesi pengguna aktif.' };
    }

    try {
        await updatePassword(user, password);
        return { success: true, message: 'Kata sandi berhasil disimpan. Sekarang Anda bisa login menggunakan Email & Password atau Google.' };
    } catch (error: any) {
        console.error("Update Password Error", error);
        let message = 'Gagal menyimpan kata sandi.';
        if (error.code === 'auth/weak-password') {
            message = 'Kata sandi terlalu lemah (minimal 6 karakter).';
        } else if (error.code === 'auth/requires-recent-login') {
            message = 'Demi keamanan, silakan logout dan login kembali untuk mengubah kata sandi.';
        }
        return { success: false, message };
    }
};

export const changeUserEmail = async (newEmail: string, password: string): Promise<{ success: boolean; message: string }> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
        return { success: false, message: 'Tidak ada sesi pengguna aktif.' };
    }
    const oldEmail = user.email;

    try {
        // 1. Re-authenticate User (Security Requirement)
        const credential = EmailAuthProvider.credential(oldEmail, password);
        await reauthenticateWithCredential(user, credential);

        // 2. Update License Database (Crucial to prevent lockout)
        const licenseKey = localStorage.getItem('veroz_license_key');
        if (licenseKey) {
            const params = new URLSearchParams({
                action: 'update_email',
                key: licenseKey,
                old_email: oldEmail,
                new_email: newEmail,
                uid: user.uid
            });
            
            // Call API silently but await it to ensure data consistency
            await fetch(`${LICENSE_API_URL}?${params.toString()}`);
        }

        // 3. Update Firebase Email
        await updateEmail(user, newEmail);

        return { success: true, message: 'Email berhasil diperbarui.' };
    } catch (error: any) {
        console.error("Change Email Error", error);
        let message = 'Gagal memperbarui email.';
        
        if (error.code === 'auth/wrong-password') {
            message = 'Kata sandi saat ini salah.';
        } else if (error.code === 'auth/email-already-in-use') {
            message = 'Email baru sudah digunakan oleh akun lain.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Format email baru tidak valid.';
        } else if (error.code === 'auth/requires-recent-login') {
            message = 'Sesi kadaluarsa. Silakan logout dan login kembali.';
        }

        return { success: false, message };
    }
};

export const sendPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: 'Link reset kata sandi telah dikirim ke email Anda, Jangan Lupa cek di SPAM jika tidak muncul di Kotak Masuk.' };
    } catch (error: any) {
        console.error("Reset Password Error", error);
        let message = 'Gagal mengirim link reset.';
        if (error.code === 'auth/user-not-found') message = 'Email tidak terdaftar.';
        if (error.code === 'auth/invalid-email') message = 'Format email tidak valid.';
        return { success: false, message };
    }
};

export const logout = async (): Promise<void> => {
    await firebaseSignOut(auth);
};

export const getCurrentUser = (): User | null => {
    const fbUser = auth.currentUser;
    return fbUser ? mapFirebaseUser(fbUser) : null;
};
