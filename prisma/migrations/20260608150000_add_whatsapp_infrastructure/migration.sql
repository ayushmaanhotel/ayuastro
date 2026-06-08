-- CreateTable
CREATE TABLE "WhatsappUser" (
    "id" TEXT NOT NULL,
    "appUserId" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "displayName" TEXT,
    "profileName" TEXT,
    "waId" TEXT,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "lastInboundAt" TIMESTAMP(3),
    "lastOutboundAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'open',
    "topic" TEXT,
    "context" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'received',
    "fromNumber" TEXT NOT NULL,
    "toNumber" TEXT NOT NULL,
    "whatsappMessageId" TEXT,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "body" TEXT,
    "mediaUrl" TEXT,
    "rawPayload" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unknown',
    "source" TEXT,
    "reason" TEXT,
    "consentedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "conversationId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "payload" TEXT NOT NULL,
    "result" TEXT,
    "errorMessage" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappUser_phoneNumber_key" ON "WhatsappUser"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappUser_waId_key" ON "WhatsappUser"("waId");

-- CreateIndex
CREATE INDEX "WhatsappUser_appUserId_idx" ON "WhatsappUser"("appUserId");

-- CreateIndex
CREATE INDEX "WhatsappUser_phoneNumber_idx" ON "WhatsappUser"("phoneNumber");

-- CreateIndex
CREATE INDEX "WhatsappConversation_userId_state_idx" ON "WhatsappConversation"("userId", "state");

-- CreateIndex
CREATE INDEX "WhatsappConversation_lastMessageAt_idx" ON "WhatsappConversation"("lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappMessage_whatsappMessageId_key" ON "WhatsappMessage"("whatsappMessageId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_userId_createdAt_idx" ON "WhatsappMessage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "WhatsappMessage_conversationId_createdAt_idx" ON "WhatsappMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "WhatsappMessage_direction_status_idx" ON "WhatsappMessage"("direction", "status");

-- CreateIndex
CREATE INDEX "WhatsappMessage_fromNumber_idx" ON "WhatsappMessage"("fromNumber");

-- CreateIndex
CREATE INDEX "WhatsappMessage_toNumber_idx" ON "WhatsappMessage"("toNumber");

-- CreateIndex
CREATE INDEX "WhatsappConsent_userId_status_idx" ON "WhatsappConsent"("userId", "status");

-- CreateIndex
CREATE INDEX "WhatsappConsent_status_idx" ON "WhatsappConsent"("status");

-- CreateIndex
CREATE INDEX "WhatsappJob_status_scheduledAt_idx" ON "WhatsappJob"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "WhatsappJob_userId_idx" ON "WhatsappJob"("userId");

-- CreateIndex
CREATE INDEX "WhatsappJob_conversationId_idx" ON "WhatsappJob"("conversationId");

-- AddForeignKey
ALTER TABLE "WhatsappUser" ADD CONSTRAINT "WhatsappUser_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappConversation" ADD CONSTRAINT "WhatsappConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "WhatsappUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappMessage" ADD CONSTRAINT "WhatsappMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "WhatsappUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappMessage" ADD CONSTRAINT "WhatsappMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "WhatsappConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappConsent" ADD CONSTRAINT "WhatsappConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "WhatsappUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappJob" ADD CONSTRAINT "WhatsappJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "WhatsappUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappJob" ADD CONSTRAINT "WhatsappJob_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "WhatsappConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
