import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useDocuments() {
  const [downloading, setDownloading] = useState(false);

  const getInvoiceUrl = (bookingId: string) => `${API_URL}/documents/invoice/${bookingId}`;
  const getContractUrl = (bookingId: string) => `${API_URL}/documents/contract/${bookingId}`;
  const getReceiptUrl = (paymentId: string) => `${API_URL}/documents/receipt/${paymentId}`;

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const downloadDocument = async (url: string, filename: string) => {
    try {
      setDownloading(true);
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download document:', err);
    } finally {
      setDownloading(false);
    }
  };

  return {
    downloading,
    getInvoiceUrl,
    getContractUrl,
    getReceiptUrl,
    openDocument,
    downloadDocument,
  };
}
