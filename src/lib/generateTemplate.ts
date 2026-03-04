import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, TabStopPosition, TabStopType, Footer, PageNumber, NumberFormat } from 'docx';
import { saveAs } from 'file-saver';

export async function generateTemplate() {
  const FONT = 'Times New Roman';
  const SIZE_12 = 24; // half-points
  const SIZE_14 = 28;
  const SIZE_10 = 20;

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE_12 },
          paragraph: { spacing: { line: 360 }, alignment: AlignmentType.JUSTIFIED },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: '2.5cm', bottom: '2.5cm', left: '2.5cm', right: '2.5cm' },
            size: { width: '21cm', height: '29.7cm' },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: SIZE_10 }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Title RO
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: 'TITLUL ARTICOLULUI ÎN LIMBA ROMÂNĂ', bold: true, font: FONT, size: SIZE_14 }),
            ],
          }),

          // Empty line
          new Paragraph({ spacing: { after: 120 }, children: [] }),

          // Author
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 0 },
            children: [
              new TextRun({ text: 'Prof. univ. dr. Prenume Nume', font: FONT, size: SIZE_12 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 240 },
            children: [
              new TextRun({ text: 'Facultatea…, Universitatea… / Institutul/Muzeul', font: FONT, size: SIZE_12, italics: true }),
            ],
          }),

          // Title international language
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({ text: 'Title of the Article in an International Language', bold: true, font: FONT, size: SIZE_14 }),
            ],
          }),

          // Abstract heading
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Abstract', bold: true, font: FONT, size: SIZE_10 }),
            ],
          }),

          // Abstract text
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120, line: 240 },
            children: [
              new TextRun({
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Maximum 200 cuvinte.',
                font: FONT,
                size: SIZE_10,
              }),
            ],
          }),

          // Keywords
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120, line: 240 },
            children: [
              new TextRun({ text: 'Keywords: ', bold: true, font: FONT, size: SIZE_10 }),
              new TextRun({ text: 'termen1, termen2, termen3, termen4, termen5', font: FONT, size: SIZE_10 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 360, line: 240 },
            children: [
              new TextRun({ text: 'Cuvinte-cheie: ', bold: true, font: FONT, size: SIZE_10 }),
              new TextRun({ text: 'termen1, termen2, termen3, termen4, termen5', font: FONT, size: SIZE_10 }),
            ],
          }),

          // Subtitle 1
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '1. Subtitlu de secțiune', bold: true, font: FONT, size: SIZE_12 }),
            ],
          }),

          // Body text
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120, line: 360 },
            children: [
              new TextRun({
                text: 'Textul articolului începe aici. Se folosește Times New Roman, corp 12, cu distanța între rânduri de 1,5. Alinierea este „Justify". Fiecare paragraf urmează stilul „No spacing". Citatele în limba română se marchează prin ghilimele rotunde „astfel". Numărul recomandat de pagini este 10–12, inclusiv anexele.',
                font: FONT,
                size: SIZE_12,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120, line: 360 },
            children: [
              new TextRun({
                text: 'Un al doilea paragraf demonstrativ. Notele de subsol se plasează la subsolul paginii, cu font Times New Roman corp 10, spațiate la 1 rând, aliniere Justify. Fiecare notă se termină printr-un punct.',
                font: FONT,
                size: SIZE_12,
              }),
            ],
          }),

          // Subtitle 2
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '2. Al doilea subtitlu', bold: true, font: FONT, size: SIZE_12 }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120, line: 360 },
            children: [
              new TextRun({
                text: 'Continuare text demonstrativ. Referințele bibliografice se includ în notele de subsol conform sistemului de citare: Prenume Nume, ',
                font: FONT,
                size: SIZE_12,
              }),
              new TextRun({
                text: 'Titlu carte',
                font: FONT,
                size: SIZE_12,
                italics: true,
              }),
              new TextRun({
                text: ', Localitate, Editură, an, p. 1–100.',
                font: FONT,
                size: SIZE_12,
              }),
            ],
          }),

          // Subtitle 3 - Bibliografie
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 360, after: 120 },
            children: [
              new TextRun({ text: 'Bibliografie', bold: true, font: FONT, size: SIZE_12 }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 60, line: 360 },
            children: [
              new TextRun({ text: 'Nume, Prenume, ', font: FONT, size: SIZE_12 }),
              new TextRun({ text: 'Titlul lucrării', italics: true, font: FONT, size: SIZE_12 }),
              new TextRun({ text: ', Cluj-Napoca, Editura Mega, 2024.', font: FONT, size: SIZE_12 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 60, line: 360 },
            children: [
              new TextRun({ text: 'Nume, Prenume, ', font: FONT, size: SIZE_12 }),
              new TextRun({ text: 'Titlu articol', italics: true, font: FONT, size: SIZE_12 }),
              new TextRun({ text: ' în „Titlu revistă", tomul X, 2023, p. 1–25.', font: FONT, size: SIZE_12 }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'Template_Anuarul_AAF.docx');
}
