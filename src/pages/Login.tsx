import { IonContent, IonPage, IonInput, IonButton, IonText, IonLoading } from '@ionic/react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          setError('Display name is required');
          setLoading(false);
          return;
        }
        await signup(email, password, displayName);
      }
      history.push('/servers');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <div className="login-container">
          <div className="login-card">
            <h1 className="login-title">🌊 Wavey</h1>
            <p className="login-subtitle">
              {isLogin ? 'Welcome back!' : 'Create an account'}
            </p>

            <form onSubmit={handleSubmit} className="login-form">
              {!isLogin && (
                <div className="form-group">
                  <IonInput
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onIonInput={(e: any) => setDisplayName(e.target.value)}
                    className="custom-input"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <IonInput
                  type="email"
                  placeholder="Email"
                  value={email}
                  onIonInput={(e: any) => setEmail(e.target.value)}
                  className="custom-input"
                  required
                />
              </div>

              <div className="form-group">
                <IonInput
                  type="password"
                  placeholder="Password"
                  value={password}
                  onIonInput={(e: any) => setPassword(e.target.value)}
                  className="custom-input"
                  required
                />
              </div>

              {error && (
                <IonText color="danger" className="error-text">
                  <p>{error}</p>
                </IonText>
              )}

              <IonButton
                expand="block"
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {isLogin ? 'Log In' : 'Sign Up'}
              </IonButton>
            </form>

            <div className="toggle-mode">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="toggle-button"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
              </button>
            </div>
          </div>
        </div>
        <IonLoading isOpen={loading} message="Please wait..." />
      </IonContent>
    </IonPage>
  );
};

export default Login;
