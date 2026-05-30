# Security Rules Specification & Threat Modeling

## Collection Data Invariants

1. **User Profiles (`/users/{userId}`)**:
   - Primary identifier must match the User's UID.
   - Profile information can only be read/updated by the user.

2. **Personal Saved Spots / VibeList (`/users/{userId}/savedSpots/{spotId}`)**:
   - Represents personal bookmark lists.
   - Can only be managed (created, viewed, deleted) by the corresponding authenticated owner.

3. **Community Hotspot Live Tips (`/liveTips/{tipId}`)**:
   - Allows public sharing of micro-reviews.
   - Readable by any user (publicly accessible).
   - Writable only by authenticated users (anonymous submissions block).
   - Once posted, live tips cannot be modified or updated from the client.

---

## The "Dirty Dozen" Threat Payloads (Verification Invariants)

Below is the verification plan ensuring the Firestore security model blocks malicious actors, unauthorized modifications, and invalid payload schemas:

1. **Identity Spoofing on User Info**: Attempting to create a user profile document with path `/users/victim_id` where `request.auth.uid` is `attacker_id`. Status: **REJECTED (403)**.
2. **PII Scraping**: Attempting to query or read multiple user document folders under `/users` as an unauthenticated or cross-authenticated user. Status: **REJECTED (403)**.
3. **Ghost Field Vulnerability (User Profiles)**: Attempting to update a user profile containing extra unvalidated variables (`{ email: "john@example.com", adminPrivileges: true }`). Status: **REJECTED (403)**.
4. **Incorrect ID Target on VibeList**: Attempting to insert a bookmark into `/users/victim_uid/savedSpots/secret_cafe` from `auth.uid = attacker_uid`. Status: **REJECTED (403)**.
5. **Bookmark Value Hijacking**: Attempting to create a saved spot bookmark representing cross-user access where `userId` field in resource payload does not match the parent document path. Status: **REJECTED (403)**.
6. **Cross-User Bookmark Deletion**: Attempting to delete a saved spot bookmarked under `/users/victim_uid/savedSpots/spot_1` by `auth.uid = attacker_uid`. Status: **REJECTED (403)**.
7. **Cross-User Bookmark Query**: Attempting to retrieve lists of bookmarks from `/users/victim_uid/savedSpots/` by `auth.uid = attacker_uid`. Status: **REJECTED (403)**.
8. **Unauthenticated Tip Creation**: Attempting to publish review content into `liveTips` without a valid Firebase ID Token. Status: **REJECTED (403)**.
9. **Spam Payload Injection (Over-limits)**: Scurrying a 10MB text blob into `liveTips/{tipId}` payload, exceeding schema bounds. Status: **REJECTED (403)**.
10. **Shadow Edit to Community Board**: Attempting to update/modify or soft-delete other users' posted micro-reviews under `/liveTips/tip_1` from a client session. Status: **REJECTED (403)**.
11. **Malicious Special Character Injection/Path Poisoning**: Injecting path-traversal strings or custom schemas into `savedSpots/{spotId}`. Status: **REJECTED (403)**.
12. **Malicious ID Overwriting**: Overwriting existing database system logs under non-public paths. Status: **REJECTED (403)**.
