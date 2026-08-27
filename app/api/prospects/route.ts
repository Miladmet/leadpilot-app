import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prospects = await prisma.prospect.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, prospects });
  } catch (error: any) {
    console.error('Get Prospects Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Prospect ID is required' }, { status: 400 });
    }

    // Verify ownership
    const prospect = await prisma.prospect.findFirst({
      where: { id, userId },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    await prisma.prospect.delete({
      where: { id },
    });

    // Write log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'DELETED_PROSPECT',
        details: `Deleted prospect report for ${prospect.companyName}`,
      },
    });

    return NextResponse.json({ success: true, message: 'Prospect deleted' });
  } catch (error: any) {
    console.error('Delete Prospect Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
