// Database constraint name -> the message a client should see when it trips
export const LEASE_CONSTRAINT_MESSAGES: Record<string, string> = {
  leases_one_active_per_property_idx:
    'This property already has an active lease',
};
