import { ReactNode } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonFooter 
} from '@ionic/react';

interface LayoutProps {
  title: string;
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  return (
    <>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {children}
      </IonContent>
      <IonFooter>
        <IonToolbar color="light">
          <IonTitle size="small">NavaFlow</IonTitle>
        </IonToolbar>
      </IonFooter>
    </>
  );
};

export default Layout;