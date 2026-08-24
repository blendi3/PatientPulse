# PatientPulse

A patient management platform for scheduling appointments, registering doctors, and handling day-to-day clinic operations through a secure admin dashboard.

## Features

- **Patient Self-Registration** — Patients register with their own details, which are stored for admin and doctor visibility.
- **Appointment Scheduling** — Patients book, reschedule, or cancel appointments with a doctor of their choice. Bookings respect each doctor's working hours and prevent double-booking within the same hour.
- **Role-Based Admin Access** — Two tiers of admin accounts:
  - **Main Admin** — full access, including doctor registration and the ability to create new admin accounts.
  - **Admin** — access to the appointments and patients dashboards only.
- **Doctor Management** — Main admins can register doctors, assign specializations, and upload identification photos.
- **SMS Notifications** — Appointment confirmations and reminders sent via Twilio.
- **Admin Dashboard** — Live counts of scheduled, pending, and cancelled appointments, with search and filtering across doctors and patients.
- **Secure Authentication** — Email and password login backed by Appwrite Auth, with session-based access control (no shared passkeys).

## Technologies Used

- **Next.js** — Server-side rendering and routing
- **React** — UI layer
- **TailwindCSS** — Styling and responsive design
- **Appwrite** — Authentication, database, and file storage
- **Twilio** — SMS notifications
- **Sentry** — Error tracking and monitoring

## Usage

- **Patients** register through the homepage, then complete a detailed intake form covering contact details, medical history, and identification.
- **Booking** — patients select a doctor, choose a reason and time, and confirm their appointment. The system enforces doctor availability and prevents overlapping bookings.
- **Admin Login** — admins sign in with an email and password at `/admin`. What they see depends on their assigned role.
- **Doctor Management** *(Main Admin only)* — register new doctors, who then become selectable in the patient booking flow.
- **Admin Management** *(Main Admin only)* — create new admin accounts and assign them either Admin or Main Admin access.

## Live Demo

[PatientPulse Live Demo](https://patient-pulse.vercel.app/)

Feel free to register as a patient, schedule an appointment, or explore the admin dashboard using the demo credentials below.

> **Demo Admin Access**
> Email: `admin123@gmail.com`
> Password: `admin123`
>
> This is a demo-only account for evaluation purposes.
