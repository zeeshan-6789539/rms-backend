// Database constraint name -> the message a client should see when it trips.
// Empty for now: payments have no unique/check constraints of their own, and
// the composite FKs can't trip because the service always resolves leaseId
// through LeasesService.findRowOrFail first.
export const PAYMENT_CONSTRAINT_MESSAGES: Record<string, string> = {};
