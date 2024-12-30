import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body: any = await request.json();
    const { query }: { query: string } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing search query' },
        { status: 400 }
      );
    }

    const [users, posts] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          username: true,
        },
      }),
      prisma.post.findMany({
        where: {
          OR: [
            { caption: { contains: query, mode: 'insensitive' } },
            { hashtags: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          caption: true,
          hashtags: true,
        },
      }),
    ]);

    const responseData = {
      users: users.map(user => ({
        userId: user.id,
        username: user.username,
      })),
      posts: posts.map(post => ({
        postId: post.id,
        caption: post.caption,
        hashtags: post.hashtags,
      })),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Search results retrieved successfully',
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}