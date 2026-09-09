import { pdf } from '@react-pdf/renderer';
import { ExportPDFStyle } from '../ExportPDFStyle';

const exportToPDF = async (input, filename) => {
  const jsonContent = input?.getJSON ? input.getJSON().content : input; // Editor se data uthao
  // PDF generate karo
  const blob = await pdf(<ExportPDFStyle content={jsonContent} title={filename} />).toBlob();

  // Download trigger karo
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.pdf`;
  link.click();

  // Cleanup
  URL.revokeObjectURL(url);
};

export const useExportPDF = () => {
  return { exportToPDF };
};