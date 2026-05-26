/**
 * Mock Donations Data
 *
 * Comprehensive mock data for donations, pledges, payment methods, and giving history.
 */

import type { Donation, Pledge, PaymentMethodRecord, Project } from "./types";

export const DONATIONS: Donation[] = [
  {
    id: "don-001",
    donorId: "donor-001",
    recipientId: "miss-001",
    recipientType: "missionary",
    amount: 100.0,
    currency: "USD",
    frequency: "monthly",
    status: "succeeded",
    paymentMethod: "visa",
    last4: "4242",
    transactionId: "TX-10492",
    date: "2024-12-20T10:30:00Z",
    receiptUrl: "/receipts/TX-10492.pdf",
    isRecurring: true,
    pledgeId: "pledge-001",
  },
  {
    id: "don-002",
    donorId: "donor-001",
    recipientId: "miss-001",
    recipientType: "missionary",
    amount: 100.0,
    currency: "USD",
    frequency: "monthly",
    status: "succeeded",
    paymentMethod: "visa",
    last4: "4242",
    transactionId: "TX-10491",
    date: "2024-11-20T10:30:00Z",
    receiptUrl: "/receipts/TX-10491.pdf",
    isRecurring: true,
    pledgeId: "pledge-001",
  },
  {
    id: "don-003",
    donorId: "donor-001",
    recipientId: "miss-001",
    recipientType: "missionary",
    amount: 100.0,
    currency: "USD",
    frequency: "monthly",
    status: "succeeded",
    paymentMethod: "visa",
    last4: "4242",
    transactionId: "TX-10390",
    date: "2024-10-20T10:30:00Z",
    receiptUrl: "/receipts/TX-10390.pdf",
    isRecurring: true,
    pledgeId: "pledge-001",
  },
  {
    id: "don-004",
    donorId: "donor-001",
    recipientId: "proj-001",
    recipientType: "project",
    amount: 500.0,
    currency: "USD",
    frequency: "one_time",
    status: "succeeded",
    paymentMethod: "mastercard",
    last4: "8821",
    transactionId: "TX-10355",
    date: "2024-11-12T14:15:00Z",
    receiptUrl: "/receipts/TX-10355.pdf",
    isRecurring: false,
  },
  {
    id: "don-005",
    donorId: "donor-002",
    recipientId: "proj-001",
    recipientType: "project",
    amount: 25000.0,
    currency: "USD",
    frequency: "one_time",
    status: "succeeded",
    paymentMethod: "bank_transfer",
    last4: "6789",
    transactionId: "TX-10250",
    date: "2024-11-15T09:00:00Z",
    receiptUrl: "/receipts/TX-10250.pdf",
    isRecurring: false,
  },
  {
    id: "don-006",
    donorId: "donor-003",
    recipientId: "miss-004",
    recipientType: "missionary",
    amount: 1000.0,
    currency: "USD",
    frequency: "monthly",
    status: "succeeded",
    paymentMethod: "visa",
    last4: "1234",
    transactionId: "TX-10480",
    date: "2024-12-01T08:00:00Z",
    receiptUrl: "/receipts/TX-10480.pdf",
    isRecurring: true,
    pledgeId: "pledge-003",
  },
  {
    id: "don-007",
    donorId: "donor-004",
    recipientId: "miss-002",
    recipientType: "missionary",
    amount: 300.0,
    currency: "USD",
    frequency: "monthly",
    status: "succeeded",
    paymentMethod: "visa",
    last4: "5678",
    transactionId: "TX-10475",
    date: "2024-12-01T10:00:00Z",
    receiptUrl: "/receipts/TX-10475.pdf",
    isRecurring: true,
    pledgeId: "pledge-004",
  },
  {
    id: "don-008",
    donorId: "donor-007",
    recipientId: "miss-001",
    recipientType: "missionary",
    amount: 2000.0,
    currency: "USD",
    frequency: "monthly",
    status: "failed",
    paymentMethod: "bank_transfer",
    last4: "4321",
    transactionId: "TX-10500",
    date: "2024-12-15T09:00:00Z",
    isRecurring: true,
    pledgeId: "pledge-005",
  },
  {
    id: "don-009",
    donorId: "donor-005",
    recipientId: "miss-003",
    recipientType: "missionary",
    amount: 250.0,
    currency: "USD",
    frequency: "monthly",
    status: "succeeded",
    paymentMethod: "visa",
    last4: "9012",
    transactionId: "TX-10485",
    date: "2024-12-01T11:00:00Z",
    receiptUrl: "/receipts/TX-10485.pdf",
    isRecurring: true,
    pledgeId: "pledge-006",
  },
  {
    id: "don-010",
    donorId: "donor-001",
    recipientId: "general_fund",
    recipientType: "general_fund",
    amount: 5000.0,
    currency: "USD",
    frequency: "one_time",
    status: "succeeded",
    paymentMethod: "check",
    last4: "1001",
    transactionId: "TX-10200",
    date: "2024-06-15T00:00:00Z",
    receiptUrl: "/receipts/TX-10200.pdf",
    isRecurring: false,
  },
];

export const PLEDGES: Pledge[] = [
  {
    id: "pledge-001",
    donorId: "donor-001",
    recipientId: "miss-001",
    recipientType: "missionary",
    amount: 100,
    frequency: "monthly",
    startDate: "2019-02-01",
    nextChargeDate: "2025-01-20",
    status: "active",
    paymentMethodId: "pm-001",
    totalContributed: 7100,
    missedPayments: 0,
  },
  {
    id: "pledge-002",
    donorId: "donor-001",
    recipientId: "proj-001",
    recipientType: "project",
    amount: 50,
    frequency: "monthly",
    startDate: "2024-01-15",
    nextChargeDate: "2025-01-15",
    status: "active",
    paymentMethodId: "pm-002",
    totalContributed: 600,
    missedPayments: 0,
  },
  {
    id: "pledge-003",
    donorId: "donor-003",
    recipientId: "miss-004",
    recipientType: "missionary",
    amount: 1000,
    frequency: "monthly",
    startDate: "2020-07-01",
    nextChargeDate: "2025-01-01",
    status: "active",
    paymentMethodId: "pm-003",
    totalContributed: 54000,
    missedPayments: 0,
  },
  {
    id: "pledge-004",
    donorId: "donor-004",
    recipientId: "miss-002",
    recipientType: "missionary",
    amount: 300,
    frequency: "monthly",
    startDate: "2021-03-01",
    nextChargeDate: "2025-01-01",
    status: "active",
    paymentMethodId: "pm-004",
    totalContributed: 13800,
    missedPayments: 0,
  },
  {
    id: "pledge-005",
    donorId: "donor-007",
    recipientId: "miss-001",
    recipientType: "missionary",
    amount: 2000,
    frequency: "monthly",
    startDate: "2018-02-01",
    nextChargeDate: "2024-11-01",
    status: "active",
    paymentMethodId: "pm-005",
    totalContributed: 158000,
    missedPayments: 2,
  },
  {
    id: "pledge-006",
    donorId: "donor-005",
    recipientId: "miss-003",
    recipientType: "missionary",
    amount: 250,
    frequency: "monthly",
    startDate: "2024-09-15",
    nextChargeDate: "2025-01-15",
    status: "active",
    paymentMethodId: "pm-006",
    totalContributed: 750,
    missedPayments: 0,
  },
  {
    id: "pledge-007",
    donorId: "donor-006",
    recipientId: "miss-003",
    recipientType: "missionary",
    amount: 100,
    frequency: "monthly",
    startDate: "2020-02-01",
    nextChargeDate: "2024-04-01",
    endDate: "2024-04-01",
    status: "cancelled",
    paymentMethodId: "pm-007",
    totalContributed: 5000,
    missedPayments: 0,
  },
];

export const PAYMENT_METHODS: PaymentMethodRecord[] = [
  {
    id: "pm-001",
    donorId: "donor-001",
    type: "visa",
    brand: "Visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2027,
    isDefault: true,
    createdAt: "2019-01-15T00:00:00Z",
  },
  {
    id: "pm-002",
    donorId: "donor-001",
    type: "mastercard",
    brand: "Mastercard",
    last4: "8821",
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false,
    createdAt: "2023-06-01T00:00:00Z",
  },
  {
    id: "pm-003",
    donorId: "donor-003",
    type: "visa",
    brand: "Visa",
    last4: "1234",
    expiryMonth: 3,
    expiryYear: 2028,
    isDefault: true,
    createdAt: "2020-06-01T00:00:00Z",
  },
  {
    id: "pm-004",
    donorId: "donor-004",
    type: "visa",
    brand: "Visa",
    last4: "5678",
    expiryMonth: 11,
    expiryYear: 2025,
    isDefault: true,
    createdAt: "2021-02-01T00:00:00Z",
  },
  {
    id: "pm-005",
    donorId: "donor-007",
    type: "bank_transfer",
    brand: "Bank of America",
    last4: "4321",
    expiryMonth: 0,
    expiryYear: 0,
    isDefault: true,
    createdAt: "2018-01-15T00:00:00Z",
  },
  {
    id: "pm-006",
    donorId: "donor-005",
    type: "visa",
    brand: "Visa",
    last4: "9012",
    expiryMonth: 6,
    expiryYear: 2029,
    isDefault: true,
    createdAt: "2024-09-01T00:00:00Z",
  },
  {
    id: "pm-007",
    donorId: "donor-006",
    type: "visa",
    brand: "Visa",
    last4: "3456",
    expiryMonth: 2,
    expiryYear: 2024,
    isDefault: true,
    createdAt: "2020-01-15T00:00:00Z",
  },
];

export const PROJECTS: Project[] = [
  {
    id: "proj-001",
    title: "Clean Water Initiative",
    description:
      "We are committed to providing sustainable clean water solutions to rural communities in Ghana. By building wells and implementing filtration systems, we ensure that every family has access to safe drinking water.",
    location: "Tamale, Ghana",
    region: "West Africa",
    category: "Infrastructure",
    imageUrl:
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&h=600&fit=crop",
    goal: 30000,
    raised: 26700,
    donorCount: 145,
    status: "active",
    startDate: "2024-01-01",
    missionaryId: "miss-006",
  },
  {
    id: "proj-002",
    title: "Refugee Crisis Response",
    description:
      "Our team is on the ground in Lesbos, providing essential medical supplies, food, and shelter to refugees arriving on the shores. We work directly with local leaders to identify the most urgent needs.",
    location: "Lesbos, Greece",
    region: "Europe",
    category: "Humanitarian",
    imageUrl:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&h=600&fit=crop",
    goal: 30000,
    raised: 19200,
    donorCount: 98,
    status: "active",
    startDate: "2023-06-01",
    missionaryId: "miss-003",
  },
  {
    id: "proj-003",
    title: "Rural Education Access",
    description:
      "We believe that education is the key to breaking the cycle of poverty. Our projects in northern Thailand focus on building schools and providing resources for children in remote mountain villages.",
    location: "Chiang Mai, Thailand",
    region: "Southeast Asia",
    category: "Education",
    imageUrl:
      "https://images.unsplash.com/photo-1595053826286-2e59efd9ff18?w=800&h=600&fit=crop",
    goal: 30000,
    raised: 27600,
    donorCount: 203,
    status: "active",
    startDate: "2022-08-01",
    missionaryId: "miss-001",
  },
  {
    id: "proj-004",
    title: "Medical Clinic Support",
    description:
      "Supporting local medical clinics with equipment and training for healthcare workers. We focus on maternal health and preventable disease treatment in underserved urban areas.",
    location: "Nairobi, Kenya",
    region: "East Africa",
    category: "Healthcare",
    imageUrl:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop",
    goal: 25000,
    raised: 15000,
    donorCount: 67,
    status: "active",
    startDate: "2023-03-01",
    missionaryId: "miss-002",
  },
  {
    id: "proj-005",
    title: "Youth Arts Program",
    description:
      "An innovative program using creative arts to reach at-risk youth in Lima. We provide music, visual arts, and drama classes while teaching life skills and building community.",
    location: "Lima, Peru",
    region: "Latin America",
    category: "Youth Development",
    imageUrl:
      "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=800&h=600&fit=crop",
    goal: 15000,
    raised: 8500,
    donorCount: 42,
    status: "active",
    startDate: "2024-02-01",
    missionaryId: "miss-004",
  },
  {
    id: "proj-006",
    title: "Digital Ministry Training",
    description:
      "Equipping missionaries and local churches across Asia with technology tools and digital literacy training to expand their reach and effectiveness.",
    location: "Seoul, South Korea",
    region: "East Asia",
    category: "Training",
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
    goal: 20000,
    raised: 20000,
    donorCount: 89,
    status: "funded",
    startDate: "2023-01-01",
    endDate: "2024-12-01",
    missionaryId: "miss-005",
  },
];

export function getDonationsByDonor(donorId: string): Donation[] {
  return DONATIONS.filter((d) => d.donorId === donorId);
}

export function getDonationsByRecipient(recipientId: string): Donation[] {
  return DONATIONS.filter((d) => d.recipientId === recipientId);
}

export function getPledgesByDonor(donorId: string): Pledge[] {
  return PLEDGES.filter((p) => p.donorId === donorId);
}

export function getPledgesByRecipient(recipientId: string): Pledge[] {
  return PLEDGES.filter((p) => p.recipientId === recipientId);
}

export function getActivePledges(): Pledge[] {
  return PLEDGES.filter((p) => p.status === "active");
}

export function getFailedDonations(): Donation[] {
  return DONATIONS.filter((d) => d.status === "failed");
}

export function getPaymentMethodsByDonor(
  donorId: string,
): PaymentMethodRecord[] {
  return PAYMENT_METHODS.filter((pm) => pm.donorId === donorId);
}

export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export function getActiveProjects(): Project[] {
  return PROJECTS.filter((p) => p.status === "active");
}

export function getProjectsByMissionary(missionaryId: string): Project[] {
  return PROJECTS.filter((p) => p.missionaryId === missionaryId);
}

export function calculateDonorYTDTotal(donorId: string): number {
  const currentYear = new Date().getFullYear();
  return DONATIONS.filter(
    (d) => d.donorId === donorId && d.status === "succeeded",
  )
    .filter((d) => new Date(d.date).getFullYear() === currentYear)
    .reduce((sum, d) => sum + d.amount, 0);
}

export function getRecentDonations(limit = 10): Donation[] {
  return [...DONATIONS]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
