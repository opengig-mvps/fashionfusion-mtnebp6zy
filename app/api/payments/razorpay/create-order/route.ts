import { NextResponse } from 'next/server';
import { razorpayCheckout } from '@/modules/razorpay';
import prisma from '@/lib/prisma';

type CreateOrderRequestBody = {
  amount: number;
  receipt: string;
  notes: Record<string, string>;
};

export async function POST(request: Request) {
  try {
    const body: CreateOrderRequestBody = await request.json();
    const { amount, receipt, notes } = body;

    if (!amount || !receipt) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const order = await razorpayCheckout.createOrder({
      amount,
      receipt,
      notes,
    });

    const parsedAmount = parseFloat(order?.amount?.toString() || '0') / 100;

    await prisma.payment.create({
      data: {
        amount: parsedAmount,
        paymentStatus: 'created',
        paymentMethod: 'razorpay',
        userId: 1,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: { orderId: order?.id },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}