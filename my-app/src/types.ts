export interface TransactionEntity {
  id: number;
  montant: number;
  cardNumber: string;
  expiration: string;
  status: string;
  bankCode: string;
  bankMessage: string;
  createdAt: string;
  userId?: number;
}

export interface PaymentEntity {
  id: number;
  montant: number;
  cardLast4: string;
  cardBrand: string;
  status: string;
  createdAt: string;
  userId?: number;
}

export interface BankCard {
  cardNumber: string;
  expiration: string;
  cvv: string;
  balance: number;
  active: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  status: 'Validée' | 'Refusée' | 'En attente';
  details: string;
}
