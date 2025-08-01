import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { FileText, Share2 } from 'lucide-react-native';
import { PDFService, PDFNote } from '../utils/pdfService';
import { useTheme } from '../contexts/ThemeContext';

interface PDFButtonProps {
    onGeneratePDF: () => Promise<PDFNote | PDFNote[]>;
    title?: string;
    type: 'single' | 'multiple';
    icon?: 'pdf' | 'share';
    style?: any;
}

export const PDFButton: React.FC<PDFButtonProps> = ({
    onGeneratePDF,
    title = 'Générer PDF',
    type,
    icon = 'pdf',
    style
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const { isDarkMode } = useTheme();

    const handleGeneratePDF = async () => {
        setIsLoading(true);
        try {
            const data = await onGeneratePDF();

            let pdfUri: string;

            if (type === 'single') {
                const note = data as PDFNote;
                pdfUri = await PDFService.generateNotePDF(note);
            } else {
                const notes = data as PDFNote[];
                pdfUri = await PDFService.generateNotesListPDF(notes, title);
            }

            // Partager le PDF
            await PDFService.sharePDF(pdfUri);

            Alert.alert(
                'Succès',
                'Le PDF a été généré et partagé avec succès !',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            Alert.alert(
                'Erreur',
                'Impossible de générer le PDF. Veuillez réessayer.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const IconComponent = icon === 'pdf' ? FileText : Share2;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' },
                style
            ]}
            onPress={handleGeneratePDF}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color="#2196F3" />
            ) : (
                <>
                    <IconComponent size={20} color="#2196F3" />
                    <Text style={[styles.text, { color: isDarkMode ? '#fff' : '#333' }]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2196F3',
        marginVertical: 8,
        minHeight: 48,
    },
    text: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
    },
}); 