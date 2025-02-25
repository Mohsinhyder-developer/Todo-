import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonChip,
  IonLabel,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import { calendar, pricetag, flag } from 'ionicons/icons';
import { Item } from '../types';

interface TaskPreviewProps {
  task: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskPreview: React.FC<TaskPreviewProps> = ({ task, isOpen, onClose }) => {
  if (!task) return null;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>{task.title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <h2>{task.title}</h2>
                  <p className="ion-text-wrap">{task.description}</p>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonChip color="primary">
                    <IonIcon icon={calendar} />
                    <IonLabel>{new Date(task.createdAt).toLocaleDateString()}</IonLabel>
                  </IonChip>
                  <IonChip color="secondary">
                    <IonIcon icon={pricetag} />
                    <IonLabel>{task.category}</IonLabel>
                  </IonChip>
                  {task.priority && (
                    <IonChip color={
                      task.priority === 'high' ? 'danger' :
                      task.priority === 'medium' ? 'warning' : 'success'
                    }>
                      <IonIcon icon={flag} />
                      <IonLabel>{task.priority}</IonLabel>
                    </IonChip>
                  )}
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonModal>
  );
};