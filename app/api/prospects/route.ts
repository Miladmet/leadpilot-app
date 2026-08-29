import { NextRequest, NextResponse } from 'next/server';
import { getTenantPrisma } from '@/lib/tenantPrisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantPrisma(userId);
    const prospects = await tenantDb.prospect.findMany({
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

    const tenantDb = getTenantPrisma(userId);

    // Verify ownership
    const prospect = await tenantDb.prospect.findUnique({
      where: { id },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found or unauthorized' }, { status: 404 });
    }

    await tenantDb.prospect.delete({
      where: { id },
    });

    // Write log activity
    await tenantDb.activityLog.create({
      data: {
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
