import { useState, useEffect, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import api from '../../services/api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', profilePictureUrl: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
  const [message, setMessage] = useState('');

  // ───── Cropping state ─────
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropLoading, setCropLoading] = useState(false);

  // ───── 2FA state ─────
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAMessage, setTwoFAMessage] = useState('');

  // ───── Profile fetching ─────
  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/me');
      setProfile(data);
      setForm({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber || '',
        profilePictureUrl: data.profilePictureUrl || '',
      });
      setTwoFAEnabled(data.is2faEnabled || false);   // <-- NEW

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.profilePictureUrl = data.profilePictureUrl;
      localStorage.setItem('user', JSON.stringify(storedUser));
    } catch (err) {
      setMessage('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ───── File selection → open crop modal ─────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropModalOpen(true);
  };

  // ───── Cropper callback ─────
  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // ───── Convert cropped area to blob ─────
  const getCroppedBlob = async () => {
    if (!imageSrc || !croppedAreaPixels) return null;
    const img = new Image();
    img.src = imageSrc;
    await new Promise((resolve) => { img.onload = resolve; });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0, 0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
    });
  };

  // ───── Upload cropped image ─────
  const handleCropAndUpload = async () => {
    try {
      setCropLoading(true);
      const blob = await getCroppedBlob();
      if (!blob) {
        setMessage('Could not crop image');
        return;
      }
      const formData = new FormData();
      formData.append('file', blob, 'profile.jpg');
      setUploading(true);
      const { data } = await api.post('/users/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Profile picture updated!');
      setProfile((prev) => ({ ...prev, profilePictureUrl: data.profilePictureUrl }));
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.profilePictureUrl = data.profilePictureUrl;
      localStorage.setItem('user', JSON.stringify(storedUser));
      setCropModalOpen(false);
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      setImageSrc(null);
    } catch (err) {
      setMessage('Upload failed');
    } finally {
      setCropLoading(false);
      setUploading(false);
    }
  };

  // ───── Cancel crop ─────
  const handleCancelCrop = () => {
    setCropModalOpen(false);
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
  };

  // ───── Update profile (name, phone) ─────
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/users/profile', {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
      });
      setMessage('Profile updated successfully!');
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      setMessage('Update failed');
    }
  };

  // ───── Change password (already working) ─────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setMessage('New passwords do not match');
      return;
    }
    try {
      await api.patch('/users/change-password', passwordForm);
      setMessage('Password changed successfully!');
      setShowPasswordForm(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setMessage(err.response?.data || 'Password change failed');
    }
  };

  // ───── 2FA toggle handler ─────
  const toggle2FA = async () => {
    const endpoint = twoFAEnabled ? '/auth/2fa/disable' : '/auth/2fa/enable';
    try {
      await api.post(endpoint);
      setTwoFAEnabled(!twoFAEnabled);
      setTwoFAMessage(twoFAEnabled ? '2FA disabled' : '2FA enabled');
    } catch (err) {
      setTwoFAMessage(err.response?.data?.error || 'Action failed');
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `http://localhost:8085${url}`;
  };

  if (loading) return <p style={{ color: '#64748B' }}>Loading profile...</p>;
  if (!profile) return <p style={{ color: '#B00020' }}>{message}</p>;

  const profilePicUrl = getImageUrl(profile.profilePictureUrl);

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ color: '#0A2956', fontWeight: 700, marginBottom: '1.5rem' }}>My Profile</h2>

      {message && (
        <div
          style={{
            background: message.includes('success') || message.includes('updated')
              ? '#E8F5E9'
              : '#FFF0F0',
            color: message.includes('success') || message.includes('updated')
              ? '#2E7D32'
              : '#B00020',
            padding: '0.75rem',
            borderRadius: 8,
            marginBottom: '1rem',
          }}
        >
          {message}
        </div>
      )}

      {/* ───── Profile view (non‑edit) ───── */}
      {!editMode && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {profilePicUrl ? (
              <img
                src={profilePicUrl}
                alt="Profile"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #D2EFF9',
                }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: '#D2EFF9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  color: '#0A2956',
                }}
              >
                {profile.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              style={{
                padding: '0.5rem 1rem',
                background: '#0A2956',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {uploading ? 'Uploading...' : 'Change Photo'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}><strong>Name:</strong> {profile.fullName}</div>
          <div style={{ marginBottom: '1rem' }}><strong>Email:</strong> {profile.email}</div>
          <div style={{ marginBottom: '1rem' }}><strong>Phone:</strong> {profile.phoneNumber || '—'}</div>
          <div style={{ marginBottom: '1rem' }}><strong>Role:</strong> {profile.role}</div>
          <button
            onClick={() => setEditMode(true)}
            style={{
              padding: '0.6rem 1.5rem',
              background: '#0A2956',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Edit Profile
          </button>
        </div>
      )}

      {/* ───── Edit mode ───── */}
      {editMode && (
        <form
          onSubmit={handleUpdateProfile}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
            {profilePicUrl ? (
              <img
                src={profilePicUrl}
                alt="Profile"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #D2EFF9',
                }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: '#D2EFF9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  color: '#0A2956',
                }}
              >
                {profile.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ color: '#64748B', fontSize: '0.9rem' }}>
              Use the upload button on your profile to change the picture.
            </span>
          </div>

          <label>
            <span style={{ fontWeight: 500 }}>Full Name</span>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} style={inputStyle} required />
          </label>
          <label>
            <span style={{ fontWeight: 500 }}>Phone Number</span>
            <input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} style={inputStyle} />
          </label>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ padding: '0.6rem 1.5rem', background: '#0A2956', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Save</button>
            <button type="button" onClick={() => setEditMode(false)} style={{ padding: '0.6rem 1.5rem', background: '#E2E8F0', color: '#0A2956', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          </div>
        </form>
      )}

      {/* ───── Change Password ───── */}
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          style={{ padding: '0.6rem 1.5rem', background: 'transparent', color: '#0A2956', border: '1px solid #0A2956', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
        >
          {showPasswordForm ? 'Cancel' : 'Change Password'}
        </button>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} style={{ marginTop: '1rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label>
              <span style={{ fontWeight: 500 }}>Old Password</span>
              <input type="password" value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} style={inputStyle} required />
            </label>
            <label>
              <span style={{ fontWeight: 500 }}>New Password</span>
              <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} style={inputStyle} required />
            </label>
            <label>
              <span style={{ fontWeight: 500 }}>Confirm New Password</span>
              <input type="password" value={passwordForm.confirmNewPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })} style={inputStyle} required />
            </label>
            <button type="submit" style={{ padding: '0.6rem 1.5rem', background: '#0A2956', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Change Password</button>
          </form>
        )}
      </div>

      {/* ───── Two‑Factor Authentication (SMS) ───── */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#0A2956', fontWeight: 600, marginBottom: '1rem' }}>
          Two‑Factor Authentication (SMS)
        </h3>
        <p style={{ color: '#64748B' }}>
          {twoFAEnabled
            ? '2FA is enabled. You will receive an SMS code at login.'
            : '2FA is disabled.'}
        </p>

        {!twoFAEnabled && (!profile.phoneNumber || profile.phoneNumber === '') && (
          <p style={{ color: '#B00020', fontSize: '0.9rem' }}>
            ⚠️ Add a phone number to your profile before enabling 2FA.
          </p>
        )}

        <button
          onClick={toggle2FA}
          disabled={!twoFAEnabled && (!profile.phoneNumber || profile.phoneNumber === '')}
          style={{
            padding: '0.5rem 1.2rem',
            background: twoFAEnabled ? '#EF4444' : '#0A2956',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            marginTop: '0.5rem',
            opacity: (!twoFAEnabled && (!profile.phoneNumber || profile.phoneNumber === '')) ? 0.5 : 1,
          }}
        >
          {twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </button>

        {twoFAMessage && (
          <p style={{ color: '#0A2956', marginTop: '0.5rem' }}>{twoFAMessage}</p>
        )}
      </div>

      {/* ───── Crop Modal ───── */}
      {cropModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.6)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E2E8F0', fontWeight: 600, color: '#0A2956' }}>
              Crop your photo
            </div>
            <div style={{ position: 'relative', height: '350px', background: '#000' }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={handleCancelCrop}
                style={{ padding: '0.5rem 1.2rem', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#0A2956', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={handleCropAndUpload}
                disabled={cropLoading}
                style={{ padding: '0.5rem 1.2rem', border: 'none', background: '#0A2956', color: '#FFFFFF', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                {cropLoading ? 'Uploading...' : 'Crop & Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1.5px solid #E2E8F0',
  outline: 'none',
  fontSize: '0.95rem',
  color: '#0A2956',
  background: '#F8FAFC',
  marginTop: '0.25rem',
};