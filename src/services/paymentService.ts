import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Payment } from '../types';
import { PAYMENT_CONFIG } from '../config/stripe';

class PaymentService {
  private readonly paymentsCollection = 'payments';

  /**
   * Calculate payment amount for a ride
   */
  calculatePaymentAmount(baseAmount?: number): number {
    const amount = baseAmount || PAYMENT_CONFIG.defaultTip;
    return Math.max(
      PAYMENT_CONFIG.minAmount,
      Math.min(PAYMENT_CONFIG.maxAmount, amount + PAYMENT_CONFIG.processingFee)
    );
  }

  /**
   * Create a payment record
   */
  async createPayment(
    matchId: string,
    amount: number,
    currency: string = 'usd'
  ): Promise<Payment> {
    try {
      const paymentId = `payment_${matchId}_${Date.now()}`;
      const payment: Payment = {
        id: paymentId,
        matchId,
        amount,
        currency,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, this.paymentsCollection, paymentId), {
        ...payment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return payment;
    } catch (error: any) {
      console.error('Error creating payment:', error);
      throw new Error(error.message || 'Failed to create payment');
    }
  }

  /**
   * Process payment using Stripe (simplified implementation)
   */
  async processPayment(
    paymentId: string,
    paymentMethodId: string,
    amount: number
  ): Promise<Payment> {
    try {
      // Note: In a real implementation, you would:
      // 1. Create a PaymentIntent with Stripe
      // 2. Confirm the payment with the payment method
      // 3. Handle webhooks for payment status updates
      
      // For this MVP, we'll simulate the payment process
      const payment = await this.getPaymentById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update payment status to completed
      const updatedPayment = await this.updatePaymentStatus(paymentId, 'completed');
      
      return updatedPayment;
    } catch (error: any) {
      console.error('Error processing payment:', error);
      // Update payment status to failed
      await this.updatePaymentStatus(paymentId, 'failed');
      throw new Error(error.message || 'Payment processing failed');
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    try {
      const paymentDoc = await getDoc(doc(db, this.paymentsCollection, paymentId));
      
      if (!paymentDoc.exists()) {
        return null;
      }

      const paymentData = paymentDoc.data();
      return {
        ...paymentData,
        id: paymentDoc.id,
        createdAt: paymentData.createdAt?.toDate() || new Date(),
        updatedAt: paymentData.updatedAt?.toDate() || new Date(),
      } as Payment;
    } catch (error: any) {
      console.error('Error getting payment:', error);
      throw new Error(error.message || 'Failed to get payment');
    }
  }

  /**
   * Get payments for a match
   */
  async getPaymentsByMatchId(matchId: string): Promise<Payment[]> {
    try {
      const q = query(
        collection(db, this.paymentsCollection),
        where('matchId', '==', matchId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const payments: Payment[] = [];

      querySnapshot.forEach((doc) => {
        const paymentData = doc.data();
        payments.push({
          ...paymentData,
          id: doc.id,
          createdAt: paymentData.createdAt?.toDate() || new Date(),
          updatedAt: paymentData.updatedAt?.toDate() || new Date(),
        } as Payment);
      });

      return payments;
    } catch (error: any) {
      console.error('Error getting payments by match:', error);
      throw new Error(error.message || 'Failed to get payments');
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    status: Payment['status'],
    stripePaymentIntentId?: string
  ): Promise<Payment> {
    try {
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (stripePaymentIntentId) {
        updateData.stripePaymentIntentId = stripePaymentIntentId;
      }

      await updateDoc(doc(db, this.paymentsCollection, paymentId), updateData);

      const updatedPayment = await this.getPaymentById(paymentId);
      if (!updatedPayment) {
        throw new Error('Payment not found after update');
      }

      return updatedPayment;
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      throw new Error(error.message || 'Failed to update payment status');
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, reason?: string): Promise<Payment> {
    try {
      const payment = await this.getPaymentById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new Error('Can only refund completed payments');
      }

      // Note: In a real implementation, you would create a Stripe refund
      // For this MVP, we'll just update the status
      const updatedPayment = await this.updatePaymentStatus(paymentId, 'refunded');
      
      return updatedPayment;
    } catch (error: any) {
      console.error('Error refunding payment:', error);
      throw new Error(error.message || 'Failed to refund payment');
    }
  }

  /**
   * Get payment methods for user (placeholder)
   */
  async getPaymentMethods(userId: string): Promise<any[]> {
    // Note: In a real implementation, you would fetch from Stripe
    // For this MVP, we'll return a mock payment method
    return [
      {
        id: 'pm_mock_card',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
        },
      },
    ];
  }

  /**
   * Add payment method (placeholder)
   */
  async addPaymentMethod(userId: string, paymentMethodData: any): Promise<any> {
    // Note: In a real implementation, you would create a payment method with Stripe
    // For this MVP, we'll return a mock response
    return {
      id: `pm_${Date.now()}`,
      type: 'card',
      card: paymentMethodData.card,
    };
  }

  /**
   * Format amount for display (convert cents to dollars)
   */
  formatAmount(amountInCents: number, currency: string = 'usd'): string {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }
}

export const paymentService = new PaymentService();
