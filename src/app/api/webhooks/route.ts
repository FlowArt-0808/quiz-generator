import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";

import prisma from "../../../../lib/prisma";

export const runtime = "nodejs";

function getPrimaryEmail(
  emailAddresses: Array<{ id: string; email_address: string }>,
  primaryEmailAddressId: string | null
) {
  return (
    emailAddresses.find((email) => email.id === primaryEmailAddressId)
      ?.email_address ??
    emailAddresses[0]?.email_address ??
    null
  );
}

function getDisplayName(input: {
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}) {
  const fullName = [input.firstName, input.lastName].filter(Boolean).join(" ");

  if (fullName) {
    return fullName;
  }

  if (input.username) {
    return input.username;
  }

  return input.email.split("@")[0] || "Clerk User";
}

export async function POST(req: NextRequest) {
  if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
    return NextResponse.json(
      { ok: false, error: "CLERK_WEBHOOK_SIGNING_SECRET is not configured." },
      { status: 500 }
    );
  }

  try {
    const event = await verifyWebhook(req);

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const email = getPrimaryEmail(
          event.data.email_addresses,
          event.data.primary_email_address_id
        );

        if (!email) {
          return NextResponse.json(
            {
              ok: false,
              error:
                "Clerk webhook user payload did not include a usable email address.",
            },
            { status: 400 }
          );
        }

        const name = getDisplayName({
          email,
          firstName: event.data.first_name,
          lastName: event.data.last_name,
          username: event.data.username,
        });

        const user = await prisma.user.upsert({
          where: {
            clerkId: event.data.id,
          },
          update: {
            email,
            name,
          },
          create: {
            clerkId: event.data.id,
            email,
            name,
          },
        });

        return NextResponse.json({
          ok: true,
          type: event.type,
          data: {
            id: user.id,
            clerkId: user.clerkId,
          },
        });
      }

      case "user.deleted": {
        if (!event.data.id) {
          return NextResponse.json(
            { ok: false, error: "Deleted Clerk user payload did not include an id." },
            { status: 400 }
          );
        }

        await prisma.user.deleteMany({
          where: {
            clerkId: event.data.id,
          },
        });

        return NextResponse.json({
          ok: true,
          type: event.type,
        });
      }

      default:
        return NextResponse.json({
          ok: true,
          ignored: true,
          type: event.type,
        });
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Webhook verification failed." },
      { status: 400 }
    );
  }
}
