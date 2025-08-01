import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface PDFNote {
    id: string;
    title: string;
    content: string;
    type: string;
    category?: string;
    createdAt: Date;
    tags: string[];
    images: string[];
    audioPath?: string;
    isLocked: boolean;
    reminder?: Date;
}

export class PDFService {
    static async generateNotePDF(note: PDFNote, categoryName?: string): Promise<string> {
        const htmlContent = this.generateHTMLContent(note, categoryName);

        try {
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false
            });

            return uri;
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            throw error;
        }
    }

    static async generateNotesListPDF(notes: PDFNote[], title: string = 'Mes Notes'): Promise<string> {
        const htmlContent = this.generateNotesListHTML(notes, title);

        try {
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false
            });

            return uri;
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            throw error;
        }
    }

    static async sharePDF(pdfUri: string, filename: string = 'note.pdf'): Promise<void> {
        try {
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(pdfUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Partager le PDF',
                    UTI: 'com.adobe.pdf'
                });
            }
        } catch (error) {
            console.error('Erreur lors du partage du PDF:', error);
            throw error;
        }
    }

    private static generateHTMLContent(note: PDFNote, categoryName?: string): string {
        const date = new Date(note.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const typeIcon = this.getTypeIcon(note.type);
        const tagsHTML = note.tags.length > 0
            ? `<div class="tags">${note.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}</div>`
            : '';

        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${note.title || 'Note sans titre'}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
              color: #333;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              border-bottom: 2px solid #2196F3;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #2196F3;
              margin: 0 0 10px 0;
            }
            .metadata {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            }
            .type-badge {
              background: #E3F2FD;
              color: #1976D2;
              padding: 5px 12px;
              border-radius: 15px;
              font-size: 12px;
              font-weight: bold;
            }
            .category-badge {
              background: #F3E5F5;
              color: #7B1FA2;
              padding: 5px 12px;
              border-radius: 15px;
              font-size: 12px;
            }
            .content {
              font-size: 16px;
              line-height: 1.6;
              margin: 20px 0;
              white-space: pre-wrap;
            }
            .tags {
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1px solid #eee;
            }
            .tag {
              background: #E8F5E8;
              color: #2E7D32;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              margin-right: 8px;
              display: inline-block;
              margin-bottom: 5px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #999;
              text-align: center;
            }
            .icon {
              margin-right: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">${note.title || 'Note sans titre'}</h1>
              <div class="metadata">
                <div>
                  <span class="type-badge">
                    <span class="icon">${typeIcon}</span>
                    ${this.getTypeLabel(note.type)}
                  </span>
                  ${categoryName ? `<span class="category-badge">${categoryName}</span>` : ''}
                </div>
                <div>Créé le ${date}</div>
              </div>
            </div>
            
            <div class="content">${note.content}</div>
            
            ${tagsHTML}
            
            <div class="footer">
              Généré par Memory Notes - ${new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
        </body>
      </html>
    `;
    }

    private static generateNotesListHTML(notes: PDFNote[], title: string): string {
        const notesHTML = notes.map((note, index) => {
            const date = new Date(note.createdAt).toLocaleDateString('fr-FR');
            const categoryName = note.category || 'Sans catégorie';
            const typeIcon = this.getTypeIcon(note.type);

            return `
        <div class="note-item">
          <div class="note-header">
            <h3 class="note-title">${note.title || 'Note sans titre'}</h3>
            <span class="type-badge">
              <span class="icon">${typeIcon}</span>
              ${this.getTypeLabel(note.type)}
            </span>
          </div>
          <div class="note-content">${note.content.substring(0, 200)}${note.content.length > 200 ? '...' : ''}</div>
          <div class="note-meta">
            <span class="category">${categoryName}</span>
            <span class="date">${date}</span>
          </div>
        </div>
      `;
        }).join('');

        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
              color: #333;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2196F3;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              font-size: 32px;
              font-weight: bold;
              color: #2196F3;
              margin: 0 0 10px 0;
            }
            .subtitle {
              color: #666;
              font-size: 16px;
            }
            .note-item {
              border: 1px solid #eee;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 15px;
              background: #fafafa;
            }
            .note-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            .note-title {
              font-size: 18px;
              font-weight: bold;
              color: #333;
              margin: 0;
            }
            .type-badge {
              background: #E3F2FD;
              color: #1976D2;
              padding: 5px 12px;
              border-radius: 15px;
              font-size: 12px;
              font-weight: bold;
            }
            .note-content {
              color: #666;
              line-height: 1.5;
              margin-bottom: 10px;
            }
            .note-meta {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #999;
            }
            .category {
              background: #F3E5F5;
              color: #7B1FA2;
              padding: 3px 8px;
              border-radius: 10px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #999;
              text-align: center;
            }
            .icon {
              margin-right: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">${title}</h1>
              <p class="subtitle">${notes.length} note${notes.length > 1 ? 's' : ''}</p>
            </div>
            
            ${notesHTML}
            
            <div class="footer">
              Généré par Memory Notes - ${new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
        </body>
      </html>
    `;
    }

    private static getTypeIcon(type: string): string {
        switch (type) {
            case 'text': return '📝';
            case 'checklist': return '✅';
            case 'voice': return '🎤';
            case 'drawing': return '🎨';
            case 'timer': return '⏰';
            case 'photo': return '📷';
            default: return '📄';
        }
    }

    private static getTypeLabel(type: string): string {
        switch (type) {
            case 'text': return 'Texte';
            case 'checklist': return 'Liste';
            case 'voice': return 'Audio';
            case 'drawing': return 'Dessin';
            case 'timer': return 'Minuteur';
            case 'photo': return 'Photo';
            default: return 'Note';
        }
    }
} 