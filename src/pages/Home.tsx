import { useState, useEffect } from "react";
import {
  IonPage,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButton,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonAlert,
  IonToast,
  IonFab,
  IonFabButton,
  IonIcon,
  IonBadge,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  useIonToast,
  IonSearchbar,
  IonChip,
  IonModal,
  IonTextarea,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonAvatar,
  IonNote,
  IonItemDivider,
  IonProgressBar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSkeletonText,
  IonRippleEffect,
  IonActionSheet,
} from "@ionic/react";
import { add, trash, star, create, filter, search, timeOutline, flagOutline, colorPaletteOutline, pricetagOutline, ellipsisVertical, filterOutline, menuOutline, share } from "ionicons/icons";
import Layout from "../components/Layout";
import { saveToStorage, loadFromStorage, StorageKeys } from '../utils/storage';
import { Category } from '../types';

// First, let's define our interfaces
interface Item {
  id: string; // Change to string for unique IDs
  title: string;
  favorite: boolean;
  description: string;
  category: Category;
  createdAt: Date;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
}

interface NewItem {
  title: string;
  description: string;
  category: Category;
}

const Home: React.FC = () => {
  const [items, setItems] = useState<Item[]>(() => {
    const savedItems = loadFromStorage<Item[]>(StorageKeys.ITEMS);
    return savedItems || [
      { 
        id: crypto.randomUUID(), // Use UUID for unique IDs
        title: 'Item 1', 
        favorite: false, 
        description: 'Description for item 1',
        category: 'other',
        createdAt: new Date()
      },
      { 
        id: crypto.randomUUID(), 
        title: 'Item 2', 
        favorite: true, 
        description: 'Description for item 2',
        category: 'work',
        createdAt: new Date()
      },
      { 
        id: crypto.randomUUID(), 
        title: 'Item 3', 
        favorite: false, 
        description: 'Description for item 3',
        category: 'personal',
        createdAt: new Date()
      },
    ];
  });
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [present] = useIonToast();
  const [searchText, setSearchText] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<NewItem>({ 
    title: '', 
    description: '', 
    category: 'other' as Category 
  });
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);

  // Save items to localStorage whenever they change
  useEffect(() => {
    saveToStorage(StorageKeys.ITEMS, items);
  }, [items]);

  const handleRefresh = (event: CustomEvent): void => {
    setTimeout(() => {
      setItems([...items, { 
        id: crypto.randomUUID(), // Use UUID for unique IDs
        title: `Item ${items.length + 1}`, 
        favorite: false,
        description: '',
        category: 'other',
        createdAt: new Date()
      }]);
      event.detail.complete();
      presentToast('New item added!');
    }, 1000);
  };

  const presentToast = (message: string): void => {
    present({
      message,
      duration: 1500,
      position: 'bottom',
      color: 'success'
    });
  };

  const handleDelete = (id: string): void => {
    setItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== id);
      saveToStorage(StorageKeys.ITEMS, newItems);
      return newItems;
    });
    presentToast('Item deleted');
  };

  const toggleFavorite = (id: string): void => {
    setItems(prevItems => 
      {
        const newItems = prevItems.map(item => 
          item.id === id ? { ...item, favorite: !item.favorite } : item
        );
        saveToStorage(StorageKeys.ITEMS, newItems);
        return newItems;
      });
    presentToast('Favorite updated');
  };

  const viewDetails = (item: Item): void => {
    setSelectedItem(item);
    setShowAlert(true);
  };

  const handleAddItem = () => {
    if (newItem.title.trim()) {
      const newId = crypto.randomUUID(); // Use UUID for unique IDs
      const itemToAdd: Item = {
        ...newItem,
        id: newId,
        createdAt: new Date(),
        favorite: false
      };
      
      setItems(prev => [...prev, itemToAdd]);
      saveToStorage(StorageKeys.ITEMS, [...items, itemToAdd]);
      setNewItem({
        title: '',
        description: '',
        category: 'other'
      });
      setShowModal(false);
      presentToast('Item added successfully!');
    }
  };

  const getSortedAndFilteredItems = () => {
    let result = [...items];
    
    // Apply category filter
    if (filterCategory !== 'all') {
      result = result.filter(item => item.category === filterCategory);
    }
    
    // Apply search filter
    if (searchText) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Apply sorting
    return result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.title.localeCompare(b.title);
    });
  };

  const handleItemClick = (item: Item): void => {
    setSelectedItem(item);
    setShowActionSheet(true);
  };

  const filteredItems = getSortedAndFilteredItems();

  return (
    <IonPage>
      <Layout title="Tasks">
        <IonContent>
          {/* Search and Filter Section */}
          <IonCard>
            <IonCardContent>
              <IonSearchbar
                animated={true}
                placeholder="Search items..."
                debounce={500}
                value={searchText}
                onIonChange={e => setSearchText(e.detail.value || '')}
              />
              
              <IonSegment 
                scrollable 
                value={filterCategory} 
                onIonChange={e => setFilterCategory(e.detail.value as (Category | 'all'))}
              >
                <IonSegmentButton value="all" className="ion-text-wrap">
                  <IonLabel>All</IonLabel>
                  <IonBadge color="primary">{items.length}</IonBadge>
                </IonSegmentButton>
                {['work', 'personal', 'shopping', 'other'].map(cat => (
                  <IonSegmentButton key={cat} value={cat} className="ion-text-wrap">
                    <IonLabel>{cat}</IonLabel>
                    <IonBadge color="medium">
                      {items.filter(item => item.category === cat).length}
                    </IonBadge>
                  </IonSegmentButton>
                ))}
              </IonSegment>
            </IonCardContent>
          </IonCard>

          {/* Items List */}
          <IonList>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <IonItem key={i}>
                  <IonSkeletonText animated style={{ width: '100%' }} />
                </IonItem>
              ))
            ) : (
              getSortedAndFilteredItems().map(item => (
                <IonItemSliding key={item.id}>
                  <IonItem className="ion-activatable ripple-parent">
                    <IonAvatar slot="start">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${item.title}&background=${item.priority === 'high' ? 'red' : 'random'}`} 
                        alt={item.title}
                      />
                    </IonAvatar>
                    <IonLabel>
                      <h2>{item.title}</h2>
                      <p>{item.description}</p>
                      <IonNote color="medium">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </IonNote>
                      {item.tags?.map(tag => (
                        <IonChip key={tag} color="tertiary" outline>
                          <IonLabel>{tag}</IonLabel>
                        </IonChip>
                      ))}
                    </IonLabel>
                    <IonButton 
                      slot="end" 
                      fill="clear"
                      onClick={() => handleItemClick(item)}
                    >
                      <IonIcon icon={ellipsisVertical} />
                    </IonButton>
                    <IonRippleEffect />
                  </IonItem>
                  <IonItemOptions side="start">
                    <IonItemOption color="warning" onClick={() => toggleFavorite(item.id)}>
                      <IonIcon slot="icon-only" icon={star} />
                    </IonItemOption>
                  </IonItemOptions>
                  <IonItemOptions side="end">
                    <IonItemOption color="danger" onClick={() => handleDelete(item.id)}>
                      <IonIcon slot="icon-only" icon={trash} />
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              ))
            )}
          </IonList>

          <IonActionSheet
            isOpen={showActionSheet}
            onDidDismiss={() => setShowActionSheet(false)}
            buttons={[
              {
                text: 'Delete',
                role: 'destructive',
                icon: trash,
                handler: () => { if (selectedItem) handleDelete(selectedItem.id); }
              },
              {
                text: 'Favorite',
                icon: star,
                handler: () => { if (selectedItem) toggleFavorite(selectedItem.id); }
              },
              {
                text: 'Share',
                icon: share,
                handler: () => {
                  if (selectedItem && navigator.share) {
                    navigator.share({
                      title: selectedItem.title,
                      text: selectedItem.description
                    }).catch(error => console.error('Error sharing:', error));
                  }
                }
              },
              {
                text: 'Cancel',
                role: 'cancel'
              }
            ]}
          />

          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => setShowModal(true)}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>

          {/* Add Item Modal */}
          <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Add New Item</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddItem();
              }}>
                <IonItem>
                  <IonLabel position="stacked">Title</IonLabel>
                  <IonInput
                    value={newItem.title}
                    onIonChange={e => setNewItem({...newItem, title: e.detail.value || ''})}
                    placeholder="Enter title"
                    required
                  />
                </IonItem>
                
                <IonItem>
                  <IonLabel position="stacked">Description</IonLabel>
                  <IonTextarea
                    value={newItem.description}
                    onIonChange={e => setNewItem({...newItem, description: e.detail.value || ''})}
                    placeholder="Enter description"
                    rows={4}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Category</IonLabel>
                  <IonSelect
                    value={newItem.category}
                    onIonChange={e => setNewItem({...newItem, category: e.detail.value})}
                  >
                    <IonSelectOption value="work">Work</IonSelectOption>
                    <IonSelectOption value="personal">Personal</IonSelectOption>
                    <IonSelectOption value="shopping">Shopping</IonSelectOption>
                    <IonSelectOption value="other">Other</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonButton 
                  expand="block" 
                  type="submit" 
                  className="ion-margin"
                  disabled={!newItem.title.trim()}
                >
                  Add Item
                </IonButton>
              </form>
            </IonContent>
          </IonModal>
        </IonContent>
      </Layout>
    </IonPage>
  );
};

export default Home;
