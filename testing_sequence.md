# EventKonnect - Comprehensive Testing Sequence

This sequence is designed to logically test every feature of EventKonnect by simulating a real-world workflow from account creation all the way to post-event moderation. It covers all three roles: **Admin**, **Organizer**, and **Attendee**.

---

### Phase 1: Authentication & Onboarding (The Foundation)
**Goal:** Verify users can securely access the system and receive the correct permissions.

*   **Test 1.1:** Try to access `/dashboard/admin` and `/create-event` without logging in. (Expected: Redirected to Login).
*   **Test 1.2:** Create a new **Attendee** account via Email/Password. Verify you land on the Attendee Dashboard.
*   **Test 1.3:** Create a new **Organizer** account via Google OAuth. Verify you land on the Organizer Dashboard.
*   **Test 1.4:** Create a third account (any role) and test the **Logout** functionality.
*   **Test 1.5:** (If implemented) Test the **Forgot Password / Reset Password** flow.

---

### Phase 2: Event Creation & Administration Workflows
**Goal:** Verify an Organizer can draft an event and an Admin can approve it.

*   **Test 2.1 (Organizer):** Log in as an Organizer. Go to "Create Event". Fill out the form, including uploading a custom Event Poster. Submit the event.
*   **Test 2.2 (Organizer):** Go to "My Events" (or Organizer Dashboard). Verify the newly created event appears in a "Pending Approval" or similar state. Verify the new Empty State UI is gone.
*   **Test 2.3 (Admin):** Log in as an **Admin**. Go to the Admin Dashboard -> Pending Approvals.
*   **Test 2.4 (Admin):** Review the Organizer's newly submitted event. **Reject** it (if your system supports reject reasons, add one).
*   **Test 2.5 (Admin/Organizer):** As Organizer, verify the rejection notification (Bell icon/Toast/Dashboard flag).
*   **Test 2.6 (Organizer):** Edit the rejected event details and re-submit it.
*   **Test 2.7 (Admin):** Log in as Admin. **Approve** the resubmitted event.
*   **Test 2.8 (Admin):** Go to "View Total Events" and "System Analytics" to verify the new approved event is reflected in the global stats.

---

### Phase 3: The Attendee Experience & Ticketing
**Goal:** Verify attendees can discover events, book tickets, and manage their schedules.

*   **Test 3.1 (Attendee):** Log in as an Attendee. Go to the "Browse Events" page.
*   **Test 3.2 (Attendee):** Verify the "Skeleton Loaders" appear briefly.
*   **Test 3.3 (Attendee):** Test the Search bar and Filters (Category / Date). Verify the newly approved event from Phase 2 appears correctly.
*   **Test 3.4 (Attendee):** Click the event to view the "Event Details" page. Verify the Google Maps integration displays the correct location based on the venue data.
*   **Test 3.5 (Attendee):** Click "Register for Event". Verify a success Toast Notification appears.
*   **Test 3.6 (Attendee):** Go to the "My Tickets" (TicketView) page. Verify the unique Ticket ID, QR Code, and 6-Digit Verification Code are generated correctly.
*   **Test 3.7 (Attendee):** Test "Cancel Registration". Verify the ticket disappears and the "Beautiful Empty State" returns if it was the only ticket.
*   **Test 3.8:** Repeat tests 3.5 and 3.6 to obtain a valid ticket again for the next phase.

---

### Phase 4: Event Day (Scanner & Check-In)
**Goal:** Verify the Organizer can successfully admit the Attendee and prevent duplicate entries.

*   **Test 4.1 (Organizer):** Log in as the Organizer of the event. Go to the Organizer Dashboard.
*   **Test 4.2 (Organizer):** Verify the "Live Attendance Counter" or "Total Registrations" stat has increased by 1 based on the Attendee's booking.
*   **Test 4.3 (Organizer):** Go to the Check-In / Scan QR page.
*   **Test 4.4 (Organizer - Manual):** Manually type in the 6-Digit Verification Code of the Attendee's ticket. Verify a "Successful Check-in" message/toast.
*   **Test 4.5 (Organizer - Duplicate Check):** Try to input the exact same 6-Digit Verification Code again. Verify the system REJECTS it (Duplicate Check-in Prevention).
*   **Test 4.6 (Organizer):** Check the "Attendee List" for that event. Verify that specific user is marked as "Checked In" with a Timestamp.
*   **Test 4.7 (Optional/Mobile):** If testing on a phone, use the camera scanner to scan the Attendee's QR code.

---

### Phase 5: Post-Event Memories & Feedback
**Goal:** Verify the Memory Book creation, sharing, and Attendee feedback loop.

*   **Test 5.1 (Admin/System):** Simulate the event ending (either by waiting for the designated end time, or temporarily modifying the event date in the database to be in the past).
*   **Test 5.2 (Organizer):** Log in as Organizer. The event should now be marked "Completed". Access the "Upload Memory Book" section for this event.
*   **Test 5.3 (Organizer):** Upload post-event photos, add captions, and write an Event Summary. Publish the Memory Book.
*   **Test 5.4 (Attendee):** Log in as the Attendee who went to the event. Access "Event History".
*   **Test 5.5 (Attendee):** View the Organizer's published Memory Book. Add a comment in the "Attendee Comments Section".
*   **Test 5.6 (Attendee):** Submit a Rating & Feedback for the completed event.
*   **Test 5.7 (Admin):** Log in as Admin. Review the Attendee's comment on the Memory Book to verify "Admin Moderation of Content".

---

### Phase 6: Reporting & Global Analytics
**Goal:** Verify data aggregation and export functionality.

*   **Test 6.1 (Organizer):** Go to the Organizer Dashboard. Generate an "Event Registration Report" or "Attendance vs Registration Report".
*   **Test 6.2 (Organizer):** Verify the Interactive Charts & Graphs reflect the recent check-in data.
*   **Test 6.3 (Admin):** Go to the Admin Dashboard -> Generate Reports.
*   **Test 6.4 (Admin):** Run a "System Analytics" and "User Activity Report". Export it as a PDF or CSV to verify file generation works.
*   **Test 6.5 (Admin):** Test the Management tools: Find a specific User (e.g., the Attendee you created), Block them, and verify they can no longer log in. Unblock them. Change their role to Organizer and verify Dashboard transition.

---

### Phase 7: Edge Cases & Chatbot Assistant
**Goal:** Verify robust AI integration and system stability.

*   **Test 7.1 (System-Wide):** Open the AI Chatbot on any page (Home, Browse, Dashboard).
*   **Test 7.2 (Chatbot):** Ask an FAQ: "How do I reset my password?" Verify auto-response.
*   **Test 7.3 (Chatbot):** Ask for suggestions: "Find me tech events in New York." Verify Personalized Event Suggestions / Fallback responses.
*   **Test 7.4 (Security Context):** Attempt SQL injection or cross-site scripting inputs in the Chatbot or Event Creation forms to ensure sanitization.
*   **Test 7.5 (Responsive UI):** Shrink your browser window to mobile width (or use Chrome DevTools Mobile Emulation). Verify the Modern Card-Based Layout gracefully stacks, the Sidebar collapses to a Hamburger menu/bottom nav, and tables scroll horizontally without breaking the page layout.
