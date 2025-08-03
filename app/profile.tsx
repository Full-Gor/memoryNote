import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    Switch,
    TextInput,
    Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    User,
    Settings,
    FileText,
    Shield,
    HelpCircle,
    Info,
    LogOut,
    Bell,
    Moon,
    Sun,
    Palette,
    Camera,
    Edit3,
    Save,
    X
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotes } from '@/contexts/NotesContext';

interface UserData {
    name: string;
    email: string;
    avatar?: string;
}

interface ProfileSectionProps {
    title: string;
    children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => {
    const { isDarkMode } = useTheme();

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
                {title}
            </Text>
            {children}
        </View>
    );
};

interface ProfileItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    showArrow?: boolean;
}

const ProfileItem: React.FC<ProfileItemProps> = ({
    icon,
    title,
    subtitle,
    onPress,
    rightComponent,
    showArrow = true
}) => {
    const { isDarkMode } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.profileItem,
                { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }
            ]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.profileItemLeft}>
                <View style={styles.profileItemIcon}>
                    {icon}
                </View>
                <View style={styles.profileItemContent}>
                    <Text style={[styles.profileItemTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={[styles.profileItemSubtitle, { color: isDarkMode ? '#ccc' : '#666' }]}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>
            <View style={styles.profileItemRight}>
                {rightComponent}
                {showArrow && onPress && (
                    <ArrowLeft size={20} color={isDarkMode ? '#ccc' : '#666'} style={{ transform: [{ rotate: '180deg' }] }} />
                )}
            </View>
        </TouchableOpacity>
    );
};

export default function ProfileScreen() {
    const router = useRouter();
    const { isDarkMode, toggleTheme } = useTheme();
    const { notes, categories } = useNotes();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // États pour les données utilisateur
    const [userData, setUserData] = useState<UserData>({
        name: 'Utilisateur Memory Notes',
        email: 'utilisateur@memorynotes.com',
        avatar: undefined
    });

    // États pour l'édition
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<UserData>(userData);
    const [showEditModal, setShowEditModal] = useState(false);

    // Charger les données utilisateur au démarrage
    React.useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const savedUserData = await AsyncStorage.getItem('userData');
            if (savedUserData) {
                const parsedData = JSON.parse(savedUserData);
                setUserData(parsedData);
                setEditData(parsedData);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données utilisateur:', error);
        }
    };

    const saveUserData = async (data: UserData) => {
        try {
            await AsyncStorage.setItem('userData', JSON.stringify(data));
            setUserData(data);
            Alert.alert('Succès', 'Données sauvegardées avec succès !');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            Alert.alert('Erreur', 'Impossible de sauvegarder les données');
        }
    };

    const handleImagePicker = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission refusée', 'Permission d\'accès à la galerie requise');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const newUserData = { ...userData, avatar: result.assets[0].uri };
                await saveUserData(newUserData);
            }
        } catch (error) {
            console.error('Erreur lors de la sélection d\'image:', error);
            Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
        }
    };

    const handleEditProfile = () => {
        setEditData(userData);
        setShowEditModal(true);
    };

    const handleSaveProfile = async () => {
        if (!editData.name.trim() || !editData.email.trim()) {
            Alert.alert('Erreur', 'Le nom et l\'email sont obligatoires');
            return;
        }

        await saveUserData(editData);
        setShowEditModal(false);
    };

    const handleCancelEdit = () => {
        setEditData(userData);
        setShowEditModal(false);
    };

    const handleExportData = () => {
        Alert.alert(
            'Exporter les données',
            'Voulez-vous exporter toutes vos notes au format PDF ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Exporter',
                    onPress: () => {
                        // Ici on pourrait implémenter l'export PDF
                        Alert.alert('Succès', 'Export en cours...');
                    }
                },
            ]
        );
    };

    const handleClearData = () => {
        Alert.alert(
            'Effacer toutes les données',
            'Cette action supprimera définitivement toutes vos notes. Êtes-vous sûr ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Effacer',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Confirmation', 'Fonctionnalité à implémenter');
                    }
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Voulez-vous vraiment vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Déconnexion',
                    style: 'destructive',
                    onPress: () => {
                        // Ici on pourrait implémenter la déconnexion
                        Alert.alert('Déconnexion', 'Fonctionnalité à implémenter');
                    }
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#333'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
                    Profil
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Section Utilisateur */}
                <ProfileSection title="Utilisateur">
                    <View style={[styles.userCard, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
                        <TouchableOpacity onPress={handleImagePicker} style={styles.userAvatarContainer}>
                            {userData.avatar ? (
                                <Image source={{ uri: userData.avatar }} style={styles.userAvatar} />
                            ) : (
                                <View style={styles.userAvatar}>
                                    <User size={40} color="#2196F3" />
                                </View>
                            )}
                            <View style={styles.cameraIcon}>
                                <Camera size={16} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.userInfo}>
                            <Text style={[styles.userName, { color: isDarkMode ? '#fff' : '#333' }]}>
                                {userData.name}
                            </Text>
                            <Text style={[styles.userEmail, { color: isDarkMode ? '#ccc' : '#666' }]}>
                                {userData.email}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
                            <Edit3 size={20} color="#2196F3" />
                        </TouchableOpacity>
                    </View>
                </ProfileSection>

                {/* Section Statistiques */}
                <ProfileSection title="Statistiques">
                    <View style={styles.statsContainer}>
                        <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
                            <FileText size={24} color="#2196F3" />
                            <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#333' }]}>
                                {notes.length}
                            </Text>
                            <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>
                                Notes
                            </Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
                            <Settings size={24} color="#FF9800" />
                            <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#333' }]}>
                                {categories.length}
                            </Text>
                            <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>
                                Catégories
                            </Text>
                        </View>
                    </View>
                </ProfileSection>

                {/* Section Paramètres */}
                <ProfileSection title="Paramètres">
                    <ProfileItem
                        icon={<Bell size={20} color="#2196F3" />}
                        title="Notifications"
                        subtitle="Gérer les notifications"
                        rightComponent={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={notificationsEnabled ? '#f5f5f5' : '#f4f3f4'}
                            />
                        }
                        showArrow={false}
                    />
                    <ProfileItem
                        icon={isDarkMode ? <Moon size={20} color="#9C27B0" /> : <Sun size={20} color="#FF9800" />}
                        title="Thème sombre"
                        subtitle="Basculer entre thème clair et sombre"
                        onPress={toggleTheme}
                        showArrow={false}
                    />
                    <ProfileItem
                        icon={<Palette size={20} color="#4CAF50" />}
                        title="Personnalisation"
                        subtitle="Couleurs et apparence"
                        onPress={() => Alert.alert('Personnalisation', 'Fonctionnalité à venir')}
                    />
                </ProfileSection>

                {/* Section Données */}
                <ProfileSection title="Données">
                    <ProfileItem
                        icon={<FileText size={20} color="#2196F3" />}
                        title="Exporter les données"
                        subtitle="Sauvegarder vos notes"
                        onPress={handleExportData}
                    />
                    <ProfileItem
                        icon={<Shield size={20} color="#f44336" />}
                        title="Effacer toutes les données"
                        subtitle="Supprimer définitivement toutes les notes"
                        onPress={handleClearData}
                    />
                </ProfileSection>

                {/* Section Aide */}
                <ProfileSection title="Aide et Support">
                    <ProfileItem
                        icon={<HelpCircle size={20} color="#2196F3" />}
                        title="Aide"
                        subtitle="Guide d'utilisation"
                        onPress={() => router.push('/help')}
                    />
                    <ProfileItem
                        icon={<Info size={20} color="#FF9800" />}
                        title="À propos"
                        subtitle="Version et informations"
                        onPress={() => Alert.alert('À propos', 'Memory Notes v1.0.0\n\nUne application de prise de notes intuitive et moderne.')}
                    />
                </ProfileSection>

                {/* Section Compte */}
                <ProfileSection title="Compte">
                    <ProfileItem
                        icon={<LogOut size={20} color="#f44336" />}
                        title="Déconnexion"
                        subtitle="Se déconnecter de l'application"
                        onPress={handleLogout}
                    />
                </ProfileSection>
            </ScrollView>

            {/* Modal d'édition des données personnelles */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCancelEdit}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
                                Modifier le profil
                            </Text>
                            <TouchableOpacity onPress={handleCancelEdit} style={styles.closeButton}>
                                <X size={24} color={isDarkMode ? '#fff' : '#333'} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: isDarkMode ? '#fff' : '#333' }]}>
                                    Nom complet
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                                            color: isDarkMode ? '#fff' : '#333',
                                            borderColor: isDarkMode ? '#444' : '#ddd'
                                        }
                                    ]}
                                    value={editData.name}
                                    onChangeText={(text) => setEditData({ ...editData, name: text })}
                                    placeholder="Votre nom"
                                    placeholderTextColor={isDarkMode ? '#ccc' : '#999'}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: isDarkMode ? '#fff' : '#333' }]}>
                                    Email
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                                            color: isDarkMode ? '#fff' : '#333',
                                            borderColor: isDarkMode ? '#444' : '#ddd'
                                        }
                                    ]}
                                    value={editData.email}
                                    onChangeText={(text) => setEditData({ ...editData, email: text })}
                                    placeholder="votre@email.com"
                                    placeholderTextColor={isDarkMode ? '#ccc' : '#999'}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={handleCancelEdit}
                            >
                                <Text style={styles.cancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSaveProfile}
                            >
                                <Save size={20} color="#fff" />
                                <Text style={styles.saveButtonText}>Sauvegarder</Text>
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
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        
    },
    userAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    profileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        elevation: 1,
        
    },
    profileItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    profileItemContent: {
        flex: 1,
    },
    profileItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    profileItemSubtitle: {
        fontSize: 14,
    },
    profileItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    // Styles pour l'avatar et l'édition
    userAvatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    userAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#2196F3',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    editButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
    },
    // Styles pour le modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 16,
        padding: 20,
        elevation: 5,
        
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    formContainer: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    saveButton: {
        backgroundColor: '#2196F3',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
}); 