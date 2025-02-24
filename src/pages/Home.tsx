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
  IonSpinner,
  IonToggle,
  IonMenuButton,
  IonPopover,
} from "@ionic/react";
import { add, trash, star, create, filter, search, timeOutline, flagOutline, colorPaletteOutline, pricetagOutline, ellipsisVertical, filterOutline, menuOutline, share, settings, help, informationCircle } from "ionicons/icons";
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
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  // Save items to localStorage whenever they change
  useEffect(() => {
    saveToStorage(StorageKeys.ITEMS, items);
  }, [items]);

  // Show loading spinner when items are being updated
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000); // Simulate loading time
    return () => clearTimeout(timer);
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

  const handleEditItem = () => {
    if (editItem) {
      const updatedItems = items.map(item => 
        item.id === editItem.id ? { ...item, ...newItem } : item
      );
      setItems(updatedItems);
      saveToStorage(StorageKeys.ITEMS, updatedItems);
      setEditItem(null);
      setNewItem({ title: '', description: '', category: 'other' as Category });
      setShowModal(false);
      presentToast('Item updated successfully!');
    }
  };

  const handleAddItem = () => {
    if (newItem.title.trim()) {
      const newId = editItem ? editItem.id : crypto.randomUUID();
      const itemToAdd: Item = {
        ...newItem,
        id: newId,
        createdAt: editItem ? editItem.createdAt : new Date(),
        favorite: editItem ? editItem.favorite : false
      };
      
      if (editItem) {
        handleEditItem();
      } else {
        setItems(prev => [...prev, itemToAdd]);
        saveToStorage(StorageKeys.ITEMS, [...items, itemToAdd]);
      }
      
      setNewItem({ title: '', description: '', category: 'other' });
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

  // Add a confirmation dialog for deletion
  const handleDeleteConfirmation = (id: string) => {
    setSelectedItem(items.find(item => item.id === id) || null);
    setShowDeleteAlert(true);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode); // Toggle dark class on body
  };

  return (
    <IonPage>
      <Layout title="Tasks">
        <IonContent>
          {/* Search and Filter Section */}
          <IonCard>
            <IonCardContent>
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
              <IonItem>
                <IonSpinner name="crescent" />
              </IonItem>
            ) : (
              filteredItems.map(item => (
                <IonItemSliding key={item.id} onIonDrag={() => handleDelete(item.id)}>
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
                    <IonItemOption color="danger" onClick={() => handleDeleteConfirmation(item.id)}>
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
                text: 'Edit',
                icon: create,
                handler: () => { 
                  if (selectedItem) {
                    setEditItem(selectedItem);
                    setNewItem({ title: selectedItem.title, description: selectedItem.description, category: selectedItem.category });
                    setShowModal(true);
                  }
                }
              },
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
              <IonToolbar color="primary">
                <IonTitle>{editItem ? 'Edit Item' : 'Add New Item'}</IonTitle>
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
                  {editItem ? 'Update Item' : 'Add Item'}
                </IonButton>
              </form>
            </IonContent>
          </IonModal>

          <IonAlert
            isOpen={showDeleteAlert}
            onDidDismiss={() => setShowDeleteAlert(false)}
            header={'Confirm Delete'}
            message={`Are you sure you want to delete "${selectedItem?.title}"?`}
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {}
              },
              {
                text: 'Delete',
                handler: () => {
                  if (selectedItem) handleDelete(selectedItem.id);
                }
              }
            ]}
          />

          {/* Show more details in the alert */}
          <IonAlert
            isOpen={showAlert}
            onDidDismiss={() => setShowAlert(false)}
            header={selectedItem?.title}
            message={selectedItem?.description}
            buttons={['OK']}
          />

          {/* Add a button to open the options popover */}
          <IonButtons slot="end">
            <IonMenuButton onClick={() => setShowPopover(true)} />
          </IonButtons>

          {/* Popover for options */}
          <IonPopover
            isOpen={showPopover}
            onDidDismiss={() => setShowPopover(false)}
          >
            <IonList>
              <IonItem button onClick={() => { /* Handle settings */ }}>
                <IonIcon slot="start" icon={settings} />
                <IonLabel>Settings</IonLabel>
              </IonItem>
              <IonItem button onClick={() => { /* Handle help */ }}>
                <IonIcon slot="start" icon={help} />
                <IonLabel>Help</IonLabel>
              </IonItem>
              <IonItem button onClick={() => { /* Handle about */ }}>
                <IonIcon slot="start" icon={informationCircle} />
                <IonLabel>About</IonLabel>
              </IonItem>
            </IonList>
          </IonPopover>
        </IonContent>
      </Layout>
    </IonPage>
  );
};

export default Home;
