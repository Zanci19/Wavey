import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { chatbubbles, people, call, person } from 'ionicons/icons';
import Servers from './pages/Servers';
import Friends from './pages/Friends';
import Calls from './pages/Calls';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

// Protected Route component
const ProtectedRoute: React.FC<{ component: React.FC<any>; exact?: boolean; path: string }> = ({ component: Component, ...rest }) => {
  const { currentUser } = useAuth();
  return (
    <Route
      {...rest}
      render={(props: any) =>
        currentUser ? <Component /> : <Redirect to="/login" />
      }
    />
  );
};

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <IonReactRouter>
      <Route exact path="/login" component={Login} />
      {currentUser ? (
        <IonTabs>
          <IonRouterOutlet>
            <ProtectedRoute exact path="/servers" component={Servers} />
            <ProtectedRoute exact path="/friends" component={Friends} />
            <ProtectedRoute exact path="/calls" component={Calls} />
            <ProtectedRoute exact path="/profile" component={Profile} />
            <Route exact path="/">
              <Redirect to="/servers" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <IonTabButton tab="servers" href="/servers">
              <IonIcon aria-hidden="true" icon={chatbubbles} />
              <IonLabel>Servers</IonLabel>
            </IonTabButton>
            <IonTabButton tab="friends" href="/friends">
              <IonIcon aria-hidden="true" icon={people} />
              <IonLabel>Friends</IonLabel>
            </IonTabButton>
            <IonTabButton tab="calls" href="/calls">
              <IonIcon aria-hidden="true" icon={call} />
              <IonLabel>Calls</IonLabel>
            </IonTabButton>
            <IonTabButton tab="profile" href="/profile">
              <IonIcon aria-hidden="true" icon={person} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      ) : (
        <Redirect to="/login" />
      )}
    </IonReactRouter>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </IonApp>
);

export default App;
