import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stripeCheckout } from '@/modules/stripe';

type PaymentSessionRequestBody = {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  mode: string;
};

export async function POST(request: Request) {
  try {
    const body: PaymentSessionRequestBody = await request.json();
    const { priceId, successUrl, cancelUrl, mode } = body;

    const session = await stripeCheckout.createOneTimePaymentSession({
      amount: parseFloat(priceId),
      successUrl,
      cancelUrl,
      metadata: { mode },
    });

    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(priceId),
        paymentStatus: 'pending',
        paymentMethod: 'stripe',
        userId: 1,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Payment session created successfully',
        data: {
          sessionId: session.id,
          sessionUrl: session.url,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 }
    );
  }
}