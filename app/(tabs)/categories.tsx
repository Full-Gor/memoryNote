import { Animated, Easing } from 'react-native';
import { useFocusEffect } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useNotes } from '@/contexts/NotesContext';
import { useAnimation } from '@/contexts/AnimationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Category } from '@/types/Note';
import { Folder, Plus, CreditCard as Edit3, Trash2, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
  '#F44336', '#607D8B', '#795548', '#E91E63',
  '#00BCD4', '#8BC34A', '#FF5722', '#3F51B5',
];

export default function CategoriesScreen() {
  const { categories, addCategory, deleteCategory, notes } = useNotes();
  const {
    widget1Animations,
    widget2Animations,
    widget3Animations
  } = useAnimation();
  const { isDarkMode } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const router = useRouter();

  // Références pour les animations des icônes
  const iconAnimations = useRef<Animated.Value[]>([]);

  // Initialiser les animations
  useEffect(() => {
    iconAnimations.current = categories.map(() => new Animated.Value(0));
  }, [categories.length]);

  // Déclencher l'animation au focus
  useFocusEffect(
    React.useCallback(() => {
      iconAnimations.current.forEach(anim => anim.setValue(0));

      const animations = iconAnimations.current.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          delay: index * 75,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        })
      );

      Animated.parallel(animations).start();
    }, [])
  );

  const handleAddCategory = () => {
    if (!categoryName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour la catégorie');
      return;
    }

    if (editingCategory) {
      // TODO: Implement update category
      Alert.alert('Info', 'Modification de catégorie bientôt disponible');
    } else {
      addCategory({
        name: categoryName.trim(),
        color: selectedColor,
      });
    }

    resetModal();
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setCategoryName('');
    setSelectedColor(COLORS[0]);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setSelectedColor(category.color);
    setShowModal(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const notesInCategory = notes.filter(note => note.category === categoryId);

    if (notesInCategory.length > 0) {
      Alert.alert(
        'Impossible de supprimer',
        `Cette catégorie contient ${notesInCategory.length} note(s). Veuillez d'abord déplacer ou supprimer ces notes.`
      );
      return;
    }

    Alert.alert(
      'Supprimer la catégorie',
      'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteCategory(categoryId);
          }
        },
      ]
    );
  };

  const getCategoryNotesCount = (categoryId: string) => {
    return notes.filter(note => note.category === categoryId).length;
  };

  const renderCategory = ({ item, index }: { item: Category; index: number }) => {
    const animatedValue = iconAnimations.current[index] || new Animated.Value(0);

    const rotate = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const notesCount = getCategoryNotesCount(item.id);

    // Appliquer les animations selon les widgets activés
    const transforms = [];

    if (widget1Animations) {
      transforms.push({
        rotateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
        })
      });
    }

    if (widget2Animations) {
      transforms.push({ rotateY: rotate }); // Rotation des icônes
    }

    if (widget3Animations) {
      transforms.push({ rotateZ: rotate }); // Rotation comme un moulin
    }

    return (
      <TouchableOpacity
        style={[styles.categoryCard, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}
        onPress={() => {
          // Naviguer vers la page d'accueil avec la catégorie sélectionnée
          router.push({
            pathname: '/(tabs)',
            params: { selectedCategory: item.id }
          });
        }}
      >
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <Animated.View
              style={[
                styles.categoryColor,
                { backgroundColor: item.color },
                { transform: transforms }
              ]}
            >
              <Folder size={20} color="#fff" />
            </Animated.View>
            <View style={styles.categoryDetails}>
              <Text style={[styles.categoryName, { color: isDarkMode ? '#fff' : '#333' }]}>{item.name}</Text>
              <Text style={[styles.categoryCount, { color: isDarkMode ? '#ccc' : '#666' }]}>
                {notesCount} note{notesCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <View style={styles.categoryActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation(); // Empêcher la navigation
                handleEditCategory(item);
              }}
            >
              <Edit3 size={16} color={isDarkMode ? '#ccc' : '#666'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation(); // Empêcher la navigation
                handleDeleteCategory(item.id);
              }}
            >
              <Trash2 size={16} color="#f44336" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderColorOption = (color: string) => (
    <TouchableOpacity
      key={color}
      style={[
        styles.colorOption,
        { backgroundColor: color },
        selectedColor === color && styles.colorOptionSelected
      ]}
      onPress={() => setSelectedColor(color)}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff', borderBottomColor: isDarkMode ? '#333' : '#e0e0e0' }]}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Catégories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
          <Text style={styles.statNumber}>{categories.length}</Text>
          <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Catégories</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
          <Text style={styles.statNumber}>{notes.length}</Text>
          <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Notes totales</Text>
        </View>
      </View>

      {categories.length === 0 ? (
        <View style={styles.emptyState}>
          <Folder size={64} color="#ccc" />
          <Text style={[styles.emptyStateText, { color: isDarkMode ? '#ccc' : '#666' }]}>Aucune catégorie</Text>
          <Text style={[styles.emptyStateSubtext, { color: isDarkMode ? '#999' : '#999' }]}>
            Créez votre première catégorie pour organiser vos notes
          </Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={resetModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </Text>
              <TouchableOpacity onPress={resetModal}>
                <X size={24} color={isDarkMode ? '#ccc' : '#666'} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: isDarkMode ? '#fff' : '#333' }]}>Nom de la catégorie</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: isDarkMode ? '#333' : '#fff',
                  borderColor: isDarkMode ? '#444' : '#e0e0e0',
                  color: isDarkMode ? '#fff' : '#333'
                }]}
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="Saisir le nom..."
                placeholderTextColor={isDarkMode ? '#999' : '#999'}
                autoFocus
              />

              <Text style={[styles.inputLabel, { color: isDarkMode ? '#fff' : '#333' }]}>Couleur</Text>
              <View style={styles.colorsContainer}>
                {COLORS.map(renderColorOption)}
              </View>

              <View style={styles.previewContainer}>
                <Text style={[styles.previewLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Aperçu:</Text>
                <View style={[styles.previewCategory, { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' }]}>
                  <View style={[styles.categoryColor, { backgroundColor: selectedColor }]}>
                    <Folder size={16} color="#fff" />
                  </View>
                  <Text style={[styles.previewText, { color: isDarkMode ? '#fff' : '#333' }]}>
                    {categoryName || 'Nom de la catégorie'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' }]}
                onPress={resetModal}
              >
                <Text style={[styles.cancelButtonText, { color: isDarkMode ? '#ccc' : '#666' }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddCategory}
              >
                <Text style={styles.saveButtonText}>
                  {editingCategory ? 'Modifier' : 'Créer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',

  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  categoriesList: {
    padding: 16,
  },
  categoryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 14,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#333',
  },
  previewContainer: {
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
  },
  previewText: {
    fontSize: 16,
    marginLeft: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});