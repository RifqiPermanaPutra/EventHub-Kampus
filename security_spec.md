# Security Specification: KampusHub

## Data Invariants
1. A user profile MUST match the authenticated user's UID and email.
2. Only Admins can approve/reject events.
3. Panitia can create events, but they remain 'pending' until approved.
4. Panitia can only edit/delete their own events.
5. RSVPs must be linked to the current user's UID and a valid event.
6. Comments can be made by any authenticated user on any approved event.
7. Notifications are private to the recipient.

## The "Dirty Dozen" Payloads (Denial Expected)
1. Creating a user profile with a different UID.
2. Updating a user's role from 'mahasiswa' to 'admin'.
3. Approving an event as a non-admin.
4. Creating an event with 'status' set to 'approved'.
5. Editing an event belonging to someone else.
6. RSVPing for another user.
7. Deleting a comment belonging to another user.
8. Reading another user's notifications.
9. Injecting a 2MB string into an event description.
10. Creating an RSVP for a non-existent event.
11. Updating the `createdAt` timestamp of a document.
12. Creating a user profile without a verified email (if strict verification is enabled).

## Test Runner (Draft)
The tests will verify that standard operations follow the rules and that the "Dirty Dozen" are rejected.
