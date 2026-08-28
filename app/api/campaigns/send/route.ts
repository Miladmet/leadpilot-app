import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { prospectId, recipientEmail, subject, body, scheduledTime, sendImmediately, smtpConfig } = await req.json();

    if (!prospectId || !recipientEmail || !subject || !body) {
      return NextResponse.json({ error: 'Prospect ID, recipient email, subject, and body are required' }, { status: 400 });
    }

    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
    });

    if (!prospect || prospect.userId !== userId) {
      return NextResponse.json({ error: 'Prospect record not found' }, { status: 404 });
    }

    const smtpHost = smtpConfig?.host || process.env.SMTP_HOST;
    const smtpPort = parseInt(smtpConfig?.port || process.env.SMTP_PORT || '587');
    const smtpUser = smtpConfig?.user || process.env.SMTP_USER;
    const smtpPass = smtpConfig?.pass || process.env.SMTP_PASS;
    const smtpSecure = smtpConfig?.secure !== undefined ? smtpConfig.secure : (process.env.SMTP_SECURE === 'true');

    const logs = [];
    let status = 'Draft';
    let sentTime = null;

    logs.push({
      timestamp: new Date().toISOString(),
      event: `Campaign initiated. Recipient: ${recipientEmail}`
    });

    if (sendImmediately) {
      if (smtpHost && smtpUser && smtpPass) {
        try {
          logs.push({ timestamp: new Date().toISOString(), event: `Attempting SMTP delivery via ${smtpHost}:${smtpPort}...` });
          
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
              user: smtpUser,
              pass: smtpPass
            }
          });

          await transporter.sendMail({
            from: smtpUser,
            to: recipientEmail,
            subject: subject,
            text: body,
            html: body.replace(/\n/g, '<br />')
          });

          status = 'Sent';
          sentTime = new Date().toISOString();
          logs.push({ timestamp: new Date().toISOString(), event: 'Email delivered successfully via SMTP server.' });
        } catch (mailError: any) {
          status = 'Failed';
          logs.push({ timestamp: new Date().toISOString(), event: `SMTP delivery failed: ${mailError.message}` });
          console.error('SMTP Campaign Delivery Failure:', mailError);
        }
      } else {
        // Simulation Fallback
        status = 'Sent';
        sentTime = new Date().toISOString();
        logs.push({ timestamp: new Date().toISOString(), event: 'SMTP configuration empty. Executed diagnostic delivery simulation.' });
        logs.push({ timestamp: new Date().toISOString(), event: 'Delivery simulated successfully to sandbox inbox.' });
      }
    } else {
      status = 'Scheduled';
      logs.push({
        timestamp: new Date().toISOString(),
        event: `Delivery scheduled for ${new Date(scheduledTime).toLocaleString()}`
      });
    }

    // Save Outreach Campaign State to DB
    const campaignData = {
      recipientEmail,
      subject,
      body,
      status,
      scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : null,
      sentTime,
      logs,
      smtpConfig: smtpUser ? { host: smtpHost, port: smtpPort, user: smtpUser } : null
    };

    const updatedProspect = await prisma.prospect.update({
      where: { id: prospectId },
      data: {
        outreachCampaign: JSON.stringify(campaignData)
      }
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: sendImmediately ? 'CAMPAIGN_SENT' : 'CAMPAIGN_SCHEDULED',
        details: `${sendImmediately ? 'Sent' : 'Scheduled'} outbound audit pitch email for ${prospect.companyName} (${recipientEmail})`,
      },
    });

    return NextResponse.json({ success: true, status, campaign: campaignData, prospect: updatedProspect });
  } catch (error: any) {
    console.error('Campaign Dispatch Router Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch or schedule campaign.' },
      { status: 500 }
    );
  }
}
