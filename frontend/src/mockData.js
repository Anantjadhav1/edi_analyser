// src/mockData.js
export const mockAnalysisResult = {
  messageType: 'INVOICE',
  isImportant: true,
  summary: 'Invoice #INV-789 for $1,250.50 is overdue by 3 days.',
  timestamp: '2025-09-15T14:22:00Z',
  keyFields: {
    invoiceId: 'INV-789',
    poNumber: 'PO-456',
    totalAmount: '$1,250.50',
    dueDate: '2025-09-16',
  },
};