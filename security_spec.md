# Security Specification

## Data Invariants
1. All documents must have a `userId` field matching the authenticated user's UID.
2. `Transaction` documents must have a `refNo` and `date`.
3. `Party` names must be unique per user (handled in app code, but rules ensure write integrity).
4. `balance` and `totalAmount` must be numbers.

## The "Dirty Dozen" Payloads (Anti-Patterns)
1. Write without `userId`.
2. Write with `userId` mismatch.
3. Update `userId` after creation (Immortal field).
4. Overwrite settings of another user.
5. Create a transaction with a 1MB string in `customerName`.
6. Inject arbitrary fields into `Party`.
7. List transactions of another user.
8. Delete a party that doesn't belong to the user.
9. Bypass `refNo` constraints.
10. Spoof `createdAt` (use server time).
11. Update a closed transaction's amount.
12. Anonymous write (only verified users allowed).

## Test Runner (Planned)
I'll use `firestore.rules.test.ts` to verify these.
