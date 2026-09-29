import { useState, useEffect, KeyboardEvent } from 'react'

// 简单密码验证门禁（防君子不防小人）
// 密码存储在前端，关闭标签页后需重新输入
const ACCESS_PASSWORD = 'bosch2026'
const AUTH_KEY = 'bosch-auth-passed'

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    // 检查 sessionStorage 中是否已验证通过
    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
      setAuthenticated(true)
    }
  }, [])

  const handleSubmit = () => {
    if (password === ACCESS_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true')
      setAuthenticated(true)
      setError(false)
    } else {
      setError(true)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
      setPassword('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  if (authenticated) {
    return <>{children}</>
  }

  return (
    <div className="password-gate">
      <div className={`password-card ${shaking ? 'shake' : ''}`}>
        {/* Logo / Icon */}
        <div className="password-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C9.24 2 7 4.24 7 7V10H5C3.9 10 3 10.9 3 12V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V12C21 10.9 20.1 10 19 10H17V7C17 4.24 14.76 2 12 2ZM12 4C13.66 4 15 5.34 15 7V10H9V7C9 5.34 10.34 4 12 4ZM12 14C13.1 14 14 14.9 14 16C14 17.1 13.1 18 12 18C10.9 18 10 17.1 10 16C10 14.9 10.9 14 12 14Z" fill="currentColor"/>
          </svg>
        </div>

        <h2 className="password-title">博世业务学习</h2>
        <p className="password-subtitle">请输入访问密码</p>

        <div className="password-input-wrapper">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(false)
            }}
            onKeyDown={handleKeyDown}
            placeholder="请输入密码..."
            className={`password-input ${error ? 'input-error' : ''}`}
            autoFocus
          />
        </div>

        {error && (
          <p className="password-error">密码错误，请重试</p>
        )}

        <button onClick={handleSubmit} className="password-btn">
          进入系统
        </button>

        <p className="password-hint">提示：如需获取密码，请联系管理员</p>
      </div>

      <style>{`
        .password-gate {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0D1117 0%, #161B22 50%, #1C2333 100%);
          padding: 20px;
        }

        .password-card {
          background: rgba(33, 40, 59, 0.95);
          border: 1px solid rgba(0, 110, 255, 0.2);
          border-radius: 16px;
          padding: 48px 40px;
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 110, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .password-card.shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .password-icon {
          color: #006EFF;
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
        }

        .password-title {
          font-size: 24px;
          font-weight: 700;
          color: #E6EDF3;
          margin-bottom: 8px;
        }

        .password-subtitle {
          font-size: 14px;
          color: #8B949E;
          margin-bottom: 32px;
        }

        .password-input-wrapper {
          margin-bottom: 16px;
        }

        .password-input {
          width: 100%;
          padding: 14px 18px;
          background: rgba(13, 17, 23, 0.8);
          border: 1px solid rgba(139, 148, 158, 0.3);
          border-radius: 10px;
          color: #E6EDF3;
          font-size: 16px;
          outline: none;
          transition: all 0.3s ease;
        }

        .password-input:focus {
          border-color: #006EFF;
          box-shadow: 0 0 0 3px rgba(0, 110, 255, 0.15);
        }

        .password-input.input-error {
          border-color: #F85149;
          box-shadow: 0 0 0 3px rgba(248, 81, 73, 0.15);
        }

        .password-input::placeholder {
          color: rgba(139, 148, 158, 0.5);
        }

        .password-error {
          color: #F85149;
          font-size: 13px;
          margin-bottom: 16px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .password-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #006EFF 0%, #0052D9 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .password-btn:hover {
          background: linear-gradient(135deg, #1A7FFF 0%, #006EFF 100%);
          box-shadow: 0 4px 15px rgba(0, 110, 255, 0.3);
          transform: translateY(-1px);
        }

        .password-btn:active {
          transform: translateY(0);
        }

        .password-hint {
          margin-top: 24px;
          font-size: 12px;
          color: rgba(139, 148, 158, 0.6);
        }

        @media (max-width: 480px) {
          .password-card {
            padding: 36px 24px;
          }
        }
      `}</style>
    </div>
  )
}
