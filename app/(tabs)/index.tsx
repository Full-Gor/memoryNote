import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  Easing,
  Switch,
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useNotes } from '@/contexts/NotesContext';
import { useAnimation } from '@/contexts/AnimationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Note } from '@/types/Note';
import { CreditCard as Edit3, Trash2, Lock, Calendar, Mic, Image, SquareCheck as CheckSquare, Clock, User } from 'lucide-react-native';
import { PDFButton } from '@/components/PDFButton';
import { PDFNote } from '@/utils/pdfService';

interface QuickSettingButtonProps {
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const QuickSettingButton: React.FC<QuickSettingButtonProps> = ({ title, value, onValueChange }) => {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.quickSettingContainer, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
      <Text style={[styles.quickSettingText, { color: isDarkMode ? '#fff' : '#333' }]}>
        {title}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? '#f5f5f5' : '#f4f3f4'}
      />
    </View>
  );
};

export default function HomeScreen() {
  const { notes, deleteNote, categories } = useNotes();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { widget1Animations, setWidget1Animations, widget2Animations, setWidget2Animations, widget3Animations, setWidget3Animations } = useAnimation();
  const params = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'category'>('all');
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const rotateZ = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (params.selectedCategory) {
      setSelectedCategory(params.selectedCategory as string);
      setViewMode('category');
    }
  }, [params.selectedCategory]);

  // Déclencher l'animation quand les widgets changent
  useEffect(() => {
    // Arrêter toutes les animations en cours
    rotateX.stopAnimation();
    rotateY.stopAnimation();
    rotateZ.stopAnimation();

    if (widget1Animations) {
      Animated.timing(rotateX, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      rotateX.setValue(0);
    }

    if (widget2Animations) {
      Animated.timing(rotateY, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      rotateY.setValue(0);
    }

    if (widget3Animations) {
      Animated.timing(rotateZ, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      rotateZ.setValue(0);
    }
  }, [widget1Animations, widget2Animations, widget3Animations]);

  const handleWidgetToggle = (widgetType: 'widget1' | 'widget2' | 'widget3') => {
    switch (widgetType) {
      case 'widget1':
        setWidget1Animations(!widget1Animations);
        break;
      case 'widget2':
        setWidget2Animations(!widget2Animations);
        break;
      case 'widget3':
        setWidget3Animations(!widget3Animations);
        break;
    }
  };

  // Handle potential errors
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDarkMode ? '#fff' : '#f44336' }]}>
            Une erreur s'est produite
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => setError(null)}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const filteredNotes = viewMode === 'category' && selectedCategory
    ? notes.filter(note => note.category === selectedCategory)
    : notes;

  const categoryName = selectedCategory
    ? categories.find(cat => cat.id === selectedCategory)?.name
    : null;

  const noteAnimations = {
    transform: [
      ...(widget1Animations ? [{
        rotateX: rotateX.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
        })
      }] : []),
      ...(widget2Animations ? [{
        rotateY: rotateY.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
        })
      }] : []),
      ...(widget3Animations ? [{
        rotateZ: rotateZ.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
        })
      }] : []),
    ],
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'checklist':
        return <CheckSquare size={16} color={isDarkMode ? '#fff' : '#666'} />;
      case 'voice':
        return <Mic size={16} color={isDarkMode ? '#fff' : '#666'} />;
      case 'drawing':
        return <Edit3 size={16} color={isDarkMode ? '#fff' : '#666'} />;
      case 'timer':
        return <Clock size={16} color="#E91E63" />;
      default:
        return null;
    }
  };

  const renderNote = ({ item, index }: { item: Note; index: number }) => {
    const category = categories.find(cat => cat.id === item.category);

    return (
      <Animated.View style={[styles.noteCard, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }, noteAnimations]}>
        <TouchableOpacity
          style={styles.noteContent}
          onPress={() => router.push(`/note/${item.id}`)}
        >
          <View style={styles.noteHeader}>
            <View style={styles.noteTypeContainer}>
              {getTypeIcon(item.type)}
              <Text style={[styles.noteTitle, { color: isDarkMode ? '#fff' : '#333' }]} numberOfLines={1}>
                {item.title || 'Note sans titre'}
              </Text>
            </View>
            <View style={styles.noteActions}>
              {item.isLocked && <Lock size={16} color={isDarkMode ? '#fff' : '#666'} />}
              {item.reminder && <Calendar size={16} color="#FF9800" />}
              <TouchableOpacity onPress={() => handleDeleteNote(item.id)}>
                <Trash2 size={16} color="#f44336" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.noteContent, { color: isDarkMode ? '#ccc' : '#666' }]} numberOfLines={3}>
            {item.content}
          </Text>

          <View style={styles.noteFooter}>
            <View style={styles.noteDateContainer}>
              <Calendar size={14} color={isDarkMode ? '#ccc' : '#666'} />
              <Text style={[styles.noteDateText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                Créé le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>

            <View style={styles.noteMetadata}>
              {category && (
                <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
                  <Text style={styles.categoryText}>{category.name}</Text>
                </View>
              )}
              {item.images.length > 0 && (
                <View style={styles.metadataItem}>
                  <Image size={14} color={isDarkMode ? '#ccc' : '#666'} />
                  <Text style={[styles.metadataText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                    {item.images.length}
                  </Text>
                </View>
              )}
              {item.audioPath && (
                <View style={styles.metadataItem}>
                  <Mic size={14} color={isDarkMode ? '#ccc' : '#666'} />
                </View>
              )}
            </View>
          </View>

          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <Text key={index} style={styles.tag}>
                  #{tag}
                </Text>
              ))}
              {item.tags.length > 3 && (
                <Text style={styles.tag}>+{item.tags.length - 3}</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Supprimer la note',
      'Êtes-vous sûr de vouloir supprimer cette note ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteNote(noteId) },
      ]
    );
  };

  // Fonctions PDF
  const generateSingleNotePDF = async (): Promise<PDFNote> => {
    // Pour l'exemple, on prend la première note filtrée
    const note = filteredNotes[0];
    if (!note) {
      throw new Error('Aucune note disponible');
    }

    const category = categories.find(cat => cat.id === note.category);
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      type: note.type,
      category: category?.name,
      createdAt: new Date(note.createdAt),
      tags: note.tags,
      images: note.images,
      audioPath: note.audioPath,
      isLocked: note.isLocked,
      reminder: note.reminder ? new Date(note.reminder) : undefined,
    };
  };

  const generateAllNotesPDF = async (): Promise<PDFNote[]> => {
    return filteredNotes.map(note => {
      const category = categories.find(cat => cat.id === note.category);
      return {
        id: note.id,
        title: note.title,
        content: note.content,
        type: note.type,
        category: category?.name,
        createdAt: new Date(note.createdAt),
        tags: note.tags,
        images: note.images,
        audioPath: note.audioPath,
        isLocked: note.isLocked,
        reminder: note.reminder ? new Date(note.reminder) : undefined,
      };
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
            {viewMode === 'category' && categoryName ? categoryName : 'Mes Notes'}
          </Text>

          {/* Bouton Profil centré */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <User size={24} color={isDarkMode ? '#fff' : '#333'} />
          </TouchableOpacity>
        </View>

        {/* Widgets alignés horizontalement */}
        <View style={styles.widgetsContainer}>
          <QuickSettingButton
            title="Widget 1"
            value={widget1Animations}
            onValueChange={() => handleWidgetToggle('widget1')}
          />
          <QuickSettingButton
            title="Widget 2"
            value={widget2Animations}
            onValueChange={() => handleWidgetToggle('widget2')}
          />
          <QuickSettingButton
            title="Widget 3"
            value={widget3Animations}
            onValueChange={() => handleWidgetToggle('widget3')}
          />
        </View>
      </View>

      {viewMode === 'category' && (
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}
          onPress={() => {
            setSelectedCategory(null);
            setViewMode('all');
          }}
        >
          <Text style={[styles.backButtonText, { color: isDarkMode ? '#fff' : '#333' }]}>
            ← Retour à toutes les notes
          </Text>
        </TouchableOpacity>
      )}

      {filteredNotes.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
          <Text style={[styles.emptyStateText, { color: isDarkMode ? '#fff' : '#666' }]}>
            {viewMode === 'category' ? 'Aucune note dans cette catégorie' : 'Aucune note'}
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: isDarkMode ? '#ccc' : '#999' }]}>
            {viewMode === 'category' ? 'Créez votre première note dans cette catégorie' : 'Créez votre première note'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notesList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  widgetsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quickSettingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,

  },
  quickSettingText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
  },
  backButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 16,

  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesList: {
    padding: 16,
  },
  noteCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  noteContent: {
    padding: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteDateText: {
    fontSize: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  noteMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    fontSize: 12,
    color: '#2196F3',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    marginLeft: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});