import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { ArrowLeft, HelpCircle, Mail, MessageCircle, BookOpen, Star, Shield, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const FAQ_ITEMS = [
  {
    question: "Comment créer une nouvelle note ?",
    answer: "Appuyez sur le bouton + en bas de l'écran, puis choisissez le type de note que vous souhaitez créer (texte, liste, vocal, dessin, etc.)."
  },
  {
    question: "Comment organiser mes notes par catégories ?",
    answer: "Allez dans l'onglet 'Catégories' pour créer et gérer vos catégories. Ensuite, lors de la création d'une note, vous pourrez choisir la catégorie appropriée."
  },
  {
    question: "Comment rechercher dans mes notes ?",
    answer: "Utilisez l'onglet 'Recherche' pour trouver vos notes par titre, contenu ou tags. Vous pouvez aussi filtrer par catégories."
  },
  {
    question: "Comment utiliser les minuteurs ?",
    answer: "Créez un minuteur depuis l'onglet 'Créer', puis sélectionnez 'Minuteur'. Définissez la durée et lancez le compte à rebours."
  },
  {
    question: "Comment sauvegarder mes notes ?",
    answer: "Vos notes sont automatiquement sauvegardées. Vous pouvez aussi exporter vos données depuis les paramètres."
  },
  {
    question: "Comment utiliser les widgets d'animation ?",
    answer: "Sur la page d'accueil, utilisez les trois boutons Widget pour activer différents types d'animations dans l'application."
  }
];

const FEATURE_ITEMS = [
  {
    icon: BookOpen,
    title: "Types de notes",
    description: "Texte, listes, vocales, dessins, minuteurs et plus encore"
  },
  {
    icon: Shield,
    title: "Sécurité",
    description: "Verrouillage de notes et sauvegarde automatique"
  },
  {
    icon: Zap,
    title: "Animations",
    description: "Widgets d'animation personnalisables"
  },
  {
    icon: Star,
    title: "Organisation",
    description: "Catégories, tags et recherche avancée"
  }
];

export default function HelpScreen() {
  const router = useRouter();

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@memorynotes.app?subject=Support Memory Notes');
  };

  const handleRateApp = () => {
    // Ici vous pouvez ajouter le lien vers votre app store
    Linking.openURL('https://play.google.com/store/apps/details?id=com.memorynotes.app');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aide et Support</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Bienvenue */}
        <View style={styles.welcomeSection}>
          <HelpCircle size={48} color="#2196F3" />
          <Text style={styles.welcomeTitle}>Bienvenue dans Memory Notes</Text>
          <Text style={styles.welcomeText}>
            Votre compagnon pour organiser vos idées, notes et rappels. 
            Découvrez toutes les fonctionnalités de l'application.
          </Text>
        </View>

        {/* Section Fonctionnalités */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fonctionnalités principales</Text>
          <View style={styles.featuresGrid}>
            {FEATURE_ITEMS.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <View key={index} style={styles.featureCard}>
                  <IconComponent size={24} color="#2196F3" />
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Section FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          {FAQ_ITEMS.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        {/* Section Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nous contacter</Text>
          
          <TouchableOpacity style={styles.contactCard} onPress={handleContactSupport}>
            <Mail size={24} color="#2196F3" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Support par email</Text>
              <Text style={styles.contactDescription}>
                Envoyez-nous un message pour toute question ou problème
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleRateApp}>
            <Star size={24} color="#FF9800" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Noter l'application</Text>
              <Text style={styles.contactDescription}>
                Donnez votre avis et aidez-nous à améliorer l'application
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section Informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Développeur</Text>
            <Text style={styles.infoValue}>Arnaud</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Technologies</Text>
            <Text style={styles.infoValue}>React Native & Expo</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Merci d'utiliser Memory Notes pour organiser vos idées !
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  faqItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  contactCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  contactInfo: {
    marginLeft: 16,
    flex: 1,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  infoTitle: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 