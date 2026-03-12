import { auth, currentUser } from "@clerk/nextjs/server";

import prisma from "../../../lib/prisma";

function getPrimaryEmail(
  emailAddresses: Array<{ id: string; emailAddress: string }>,
  primaryEmailAddressId: string | null
) {
  return (
    emailAddresses.find((email) => email.id === primaryEmailAddressId)
      ?.emailAddress ??
    emailAddresses[0]?.emailAddress ??
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

export async function getCurrentDbUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = getPrimaryEmail(
    clerkUser.emailAddresses.map((address) => ({
      emailAddress: address.emailAddress,
      id: address.id,
    })),
    clerkUser.primaryEmailAddressId
  );

  if (!email) {
    return null;
  }

  return prisma.user.upsert({
    where: {
      clerkId: userId,
    },
    update: {
      email,
      name: getDisplayName({
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        username: clerkUser.username,
      }),
    },
    create: {
      clerkId: userId,
      email,
      name: getDisplayName({
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        username: clerkUser.username,
      }),
    },
  });
}
