# PatientPulse

A full patient management platform covering the entire loop of a clinic's day-to-day operations — patient booking, admin scheduling, and doctor-side care documentation — all in one system.

## Features

### Patient Booking
- **Self-Registration** — Patients register with contact info, medical history, and identification, all stored securely for admin and doctor visibility.
- **Appointment Scheduling** — Patients pick a specialist, choose a doctor, and book a time. The system automatically hides doctors on their approved days off and prevents double-booking within the same hour.
- **Landing Page** — A proper homepage introducing the clinic, how booking works, and the specialties on offer, before patients reach the booking form.

### Admin Dashboard
- **Role-Based Access** — Two tiers of admin accounts:
  - **Main Admin** — full access, including doctor registration, admin management, and day-off approvals.
  - **Admin** — access to the appointments and patients dashboards only.
- **Secure Authentication** — Email and password login backed by Appwrite Auth, with session-based access control (no shared passkeys).
- **Appointments View** — Toggle between a searchable/filterable table and a full calendar view, color-coded by status.
- **Patient Records** — Full patient profiles including contact info, emergency contacts, medical history, identification documents, and a complete treatment history compiled from every completed visit.
- **Doctor Management** — Register doctors, assign specializations, upload photos, and issue login credentials.
- **Day-Off Approval Workflow** — Doctors request time off; admins review requests grouped by doctor, see automatic coverage-conflict warnings when a specialty would be left fully uncovered, and approve or deny with one click.
- **SMS Notifications** — Appointment confirmations sent via Twilio.

### Doctor Portal
- **Dedicated Login** — Doctors sign in with their own email and password, landing on a portal built just for them.
- **Schedule Overview** — Stats for today and this week, appointments grouped by day, and an expandable view of each patient's contact info and visit reason.
- **Treatment Notes** — Doctors mark appointments complete and attach treatment notes, diagnosis, and follow-up instructions — which flow directly into the patient's record in the admin dashboard.
- **Availability Management** — Doctors mark dates unavailable on a visual calendar; requests go to admin for approval before patients are blocked from booking that day.
- **In-App Notifications** — A notification bell alerts doctors the moment a day-off request is approved or denied.

## Technologies Used

- **Next.js** — Server-side rendering and routing
- **React** — UI layer
- **TailwindCSS** — Styling and responsive design
- **Appwrite** — Authentication, database, and file storage
- **Twilio** — SMS notifications
- **react-big-calendar** — Calendar view for appointments
- **Sentry** — Error tracking and monitoring

## Usage

- **Patients** browse the landing page, then register and book an appointment with a doctor of their choice.
- **Admins** sign in at `/admin` — what they see depends on their assigned role (Admin or Main Admin).
- **Doctors** sign in through the same login and are routed to their own portal, where they manage their schedule, document visits, and request time off.
- **Day-off requests** submitted by doctors appear in the Main Admin's dashboard for review, with built-in warnings if approving would leave a specialty without coverage.

## Live Demo

[PatientPulse Live Demo](https://patient-pulse.vercel.app/)

Feel free to register as a patient, schedule an appointment, or explore the admin and doctor experiences using the demo credentials below.

> **Demo Admin Access**
> Email: `admin123@gmail.com`
> Password: `admin123`

> **Demo Doctor Access**
> Email: `lee@gmail.com`
> Password: `blendi123`
>
> These are demo-only accounts for evaluation purposes.