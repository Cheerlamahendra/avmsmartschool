'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, CheckCircle2, UserCheck } from 'lucide-react';
import { login, currentUser } from '@/lib/storage';
import { useToast } from '@/components/Toast';

const demoAccounts = [
  { role: 'Admin', user: 'admin', pass: 'admin123', badge: 'Admin', desc: 'School Administrator' },
  { role: 'Teacher', user: 'teacher01', pass: 'teacher123', badge: 'Teacher', desc: 'Classes 1-A & 1-B' },
  { role: 'Parent', user: 'parent01', pass: 'parent123', badge: 'Parent', desc: 'Rajesh & Meena (2 Children)' },
  { role: 'Student', user: 'student01', pass: 'student123', badge: 'Student', desc: 'Aarav Kumar (Class 1-A)' }
];

export default function LoginClient() {
  const router = useRouter();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    // Only auto-redirect if this specific tab already has an active session
    if (typeof window !== 'undefined') {
      const tabSession = sessionStorage.getItem('avmsmart_current_user');
      if (tabSession) {
        try {
          const u = JSON.parse(tabSession);
          if (u?.role) {
            router.replace(`/${u.role}/dashboard`);
          }
        } catch {
          // ignore
        }
      }
    }
  }, [router]);

  const selectDemoAccount = (acc: typeof demoAccounts[0]) => {
    setUsername(acc.user);
    setPassword(acc.pass);
    setSelectedRole(acc.role);
    toast.show(`Auto-filled ${acc.role} credentials (${acc.user})`);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    // Visual feedback for credential validation
    setTimeout(() => {
      const u = login(username.trim(), password);
      if (!u) {
        toast.show('Invalid login credentials. Please try again.', 'error');
        setIsLoading(false);
        return;
      }
      toast.show(`Welcome back, ${u.name}!`);
      router.replace(`/${u.role}/dashboard`);
    }, 500);
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 20,
      background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)'
    }}>
      <div style={{ width: 'min(480px, 100%)' }}>
        <div className="card" style={{
          position: 'relative',
          padding: 30,
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          borderRadius: 24,
          overflow: 'hidden'
        }}>
          {/* Top animated indeterminate progress indicator when loading */}
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: '#fed7aa',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '40%',
                height: '100%',
                background: 'linear-gradient(90deg, #ea580c, #f97316)',
                borderRadius: 2,
                animation: 'loadingProgress 1s infinite linear'
              }} />
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Link href="/" className="logo" style={{ justifyContent: 'center' }}>
              <span className="logo-mark">AV</span>
              <span>AVMSmart School</span>
            </Link>
            <h1 style={{ fontSize: 26, margin: '16px 0 4px', fontWeight: 800 }}>Welcome back</h1>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>Sign in to your school management workspace</p>
          </div>

          {/* Prominent Loading Circle Animation Banner at Top */}
          {isLoading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '14px 16px',
              marginBottom: 20,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 14,
              color: '#1d4ed8',
              fontSize: 13,
              fontWeight: 600
            }}>
              <div style={{
                width: 20,
                height: 20,
                border: '3px solid #bfdbfe',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite'
              }} />
              <span>Validating credentials & signing in...</span>
            </div>
          )}

          <form onSubmit={submit}>
            <div className="field">
              <label className="label">Username</label>
              <input
                className="input"
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  setSelectedRole(null);
                }}
                disabled={isLoading}
                placeholder="e.g. admin or teacher01"
                required
              />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setSelectedRole(null);
                }}
                disabled={isLoading}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '13px',
                fontSize: 15
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: 17,
                    height: 17,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                  }} />
                  <span>Validating Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Interactive Demo Accounts with 1-Click Auto-Fill */}
          <div style={{
            marginTop: 24,
            background: '#f8fafc',
            borderRadius: 16,
            padding: 16,
            border: '1px solid var(--border)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10
            }}>
              <strong style={{ fontSize: 13, color: '#334155' }}>Demo Accounts</strong>
              <span className="muted" style={{ fontSize: 11 }}>Click any account to auto-fill</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {demoAccounts.map(acc => {
                const isSelected = selectedRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => selectDemoAccount(acc)}
                    disabled={isLoading}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: isSelected ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                      background: isSelected ? '#fff7ed' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease-in-out'
                    }}
                    title={`Click to auto-fill ${acc.role} credentials`}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      marginBottom: 3
                    }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: isSelected ? 'var(--primary-dark)' : '#1e293b'
                      }}>
                        {acc.badge}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 size={13} color="var(--primary)" />
                      ) : (
                        <UserCheck size={13} color="#94a3b8" />
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                      {acc.user} / {acc.pass}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

