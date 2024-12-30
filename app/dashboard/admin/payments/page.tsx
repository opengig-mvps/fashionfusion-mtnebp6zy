'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/lib/api';

const PaymentManagementPage = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [stripeSessionUrl, setStripeSessionUrl] = useState<string | null>(null);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);

  const createStripeSession = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/payments/stripe/create-session', {
        priceId: 'price_1Hh1Yl2eZvKYlo2C0A9aM2aG',
        successUrl: 'https://your-success-url.com',
        cancelUrl: 'https://your-cancel-url.com',
        mode: 'payment',
      });
      setStripeSessionUrl(response.data.data.sessionUrl);
      toast.success('Stripe session created successfully!');
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? 'Something went wrong');
      } else {
        console.error(error);
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const createRazorpayOrder = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/payments/razorpay/create-order', {
        amount: 5000,
        receipt: 'receipt#1',
        notes: { key1: 'value3', key2: 'value2' },
      });
      setRazorpayOrderId(response.data.data.orderId);
      toast.success('Razorpay order created successfully!');
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? 'Something went wrong');
      } else {
        console.error(error);
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Payment Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stripe Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={createStripeSession}
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Create Stripe Session'}
            </Button>
            {stripeSessionUrl && (
              <a
                href={stripeSessionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline mt-4 block"
              >
                Go to Stripe Checkout
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Razorpay Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={createRazorpayOrder}
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Create Razorpay Order'}
            </Button>
            {razorpayOrderId && (
              <p className="mt-4">Order ID: {razorpayOrderId}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Payment Metrics</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Total Transactions</TableCell>
              <TableCell>150</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Successful Payments</TableCell>
              <TableCell>145</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Failed Payments</TableCell>
              <TableCell>5</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentManagementPage;