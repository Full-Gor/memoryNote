import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNotes } from '@/contexts/NotesContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Note } from '@/types/Note';
import { Search, X, Clock, Tag, Filter } from 'lucide-react-native';

export default function SearchScreen() {
  const { notes, searchNotes, categories } = useNotes();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Obtenir tous les tags uniques
  const allTags = Array.from(
    new Set(notes.flatMap(note => note.tags))
  ).sort();

  useEffect(() => {
    if (searchQuery.trim()) {
      let results = searchNotes(searchQuery);

      // Filtrer par tags sélectionnés
      if (selectedTags.length > 0) {
        results = results.filter(note =>
          selectedTags.some(tag => note.tags.includes(tag))
        );
      }

      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedTags, notes]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const renderSearchResult = ({ item }: { item: Note }) => {
    const category = categories.find(cat => cat.id === item.category);

    return (
      <TouchableOpacity
        style={[styles.resultCard, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}
        onPress={() => router.push(`/note/${item.id}`)}
      >
        <Text style={[styles.resultTitle, { color: isDarkMode ? '#fff' : '#333' }]} numberOfLines={1}>
          {item.title || 'Note sans titre'}
        </Text>
        <Text style={[styles.resultContent, { color: isDarkMode ? '#ccc' : '#666' }]} numberOfLines={2}>
          {item.content}
        </Text>

        <View style={styles.resultFooter}>
          {category && (
            <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
              <Text style={styles.categoryText}>{category.name}</Text>
            </View>
          )}

          <Text style={[styles.resultDate, { color: isDarkMode ? '#999' : '#999' }]}>
            {item.updatedAt.toLocaleDateString()}
          </Text>
        </View>

        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <Text key={index} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderRecentSearch = (search: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.recentItem}
      onPress={() => handleSearch(search)}
    >
      <Clock size={16} color={isDarkMode ? '#ccc' : '#666'} />
      <Text style={[styles.recentText, { color: isDarkMode ? '#ccc' : '#666' }]}>{search}</Text>
    </TouchableOpacity>
  );

  const renderTag = (tag: string) => (
    <TouchableOpacity
      key={tag}
      style={[
        styles.filterTag,
        selectedTags.includes(tag) && styles.filterTagSelected
      ]}
      onPress={() => toggleTag(tag)}
    >
      <Tag size={14} color={selectedTags.includes(tag) ? '#fff' : (isDarkMode ? '#ccc' : '#666')} />
      <Text style={[
        styles.filterTagText,
        selectedTags.includes(tag) && styles.filterTagTextSelected,
        !selectedTags.includes(tag) && { color: isDarkMode ? '#ccc' : '#666' }
      ]}>
        {tag}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff', borderBottomColor: isDarkMode ? '#333' : '#e0e0e0' }]}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Recherche</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff', borderBottomColor: isDarkMode ? '#333' : '#e0e0e0' }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' }]}>
          <Search size={20} color={isDarkMode ? '#ccc' : '#666'} />
          <TextInput
            style={[styles.searchInput, { color: isDarkMode ? '#fff' : '#333' }]}
            placeholder="Rechercher dans vos notes..."
            placeholderTextColor={isDarkMode ? '#999' : '#999'}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={isDarkMode ? '#ccc' : '#666'} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive, { backgroundColor: isDarkMode && !showFilters ? '#333' : undefined }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? '#fff' : (isDarkMode ? '#ccc' : '#666')} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff', borderBottomColor: isDarkMode ? '#333' : '#e0e0e0' }]}>
          <Text style={[styles.filtersTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Filtrer par tags:</Text>
          <View style={styles.tagsFilter}>
            {allTags.map(renderTag)}
          </View>
          {selectedTags.length > 0 && (
            <TouchableOpacity
              style={styles.clearFilters}
              onPress={() => setSelectedTags([])}
            >
              <Text style={[styles.clearFiltersText, { color: isDarkMode ? '#4CAF50' : '#2196F3' }]}>Effacer les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {searchQuery.trim() === '' ? (
        <View style={styles.emptySearch}>
          {recentSearches.length > 0 && (
            <View style={styles.recentSearches}>
              <Text style={[styles.recentTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Recherches récentes</Text>
              {recentSearches.map(renderRecentSearch)}
            </View>
          )}

          <View style={[styles.searchTips, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
            <Text style={[styles.tipsTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Conseils de recherche:</Text>
            <Text style={[styles.tipText, { color: isDarkMode ? '#ccc' : '#666' }]}>• Recherchez par titre, contenu ou tags</Text>
            <Text style={[styles.tipText, { color: isDarkMode ? '#ccc' : '#666' }]}>• Utilisez les filtres pour affiner</Text>
            <Text style={[styles.tipText, { color: isDarkMode ? '#ccc' : '#666' }]}>• Les résultats sont triés par pertinence</Text>
          </View>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsCount, { color: isDarkMode ? '#ccc' : '#666' }]}>
            {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''} trouvé{searchResults.length !== 1 ? 's' : ''}
          </Text>

          {searchResults.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={[styles.noResultsText, { color: isDarkMode ? '#ccc' : '#666' }]}>Aucun résultat trouvé</Text>
              <Text style={[styles.noResultsSubtext, { color: isDarkMode ? '#999' : '#999' }]}>
                Essayez avec d'autres mots-clés
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagsFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    gap: 4,
  },
  filterTagSelected: {
    backgroundColor: '#2196F3',
  },
  filterTagText: {
    fontSize: 14,
  },
  filterTagTextSelected: {
    color: '#fff',
  },
  clearFilters: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  clearFiltersText: {
    fontSize: 14,
  },
  emptySearch: {
    flex: 1,
    padding: 20,
  },
  recentSearches: {
    marginBottom: 32,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  recentText: {
    fontSize: 16,
  },
  searchTips: {
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 8,
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: 16,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,

  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  resultDate: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    fontSize: 12,
    color: '#2196F3',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
  },
});