# 🎓 Smart Campus Ticket Management System

## 📌 Project Overview
This project is a Smart Campus Ticket Management System developed to manage student issues in an efficient and organized way. The system allows students to submit support requests and track their progress, while administrators can manage, assign, and resolve tickets through a centralized platform.

---

## 🚀 Key Features

### 👨‍🎓 Student Features
- Create support tickets with detailed information
- Attach files (PDF, PNG, JPG) when submitting tickets
- View only their own submitted tickets
- Add comments and communicate with admin
- Delete tickets (only when status is OPEN)

### 👨‍💼 Admin Features
- View all submitted tickets
- Assign tickets to staff members
- Update ticket status (OPEN → IN_PROGRESS → RESOLVED → CLOSED)
- Reply to student comments
- Delete tickets
- Dashboard to monitor system activity

---

## 📊 Dashboard & Analytics
- Total number of tickets
- Ticket status breakdown:
  - Open
  - In Progress
  - Resolved
  - Closed
- Visual chart representation using Recharts

---

## 📎 File Upload Feature
- Supports file attachments during ticket creation
- Accepted formats:
  - PDF
- Uploaded files are stored on the server and can be viewed via link

---

## 📄 PDF Report Generation
- Admin can download a full ticket report as a PDF
- Includes:
  - Ticket title
  - Category
  - Priority
  - Status
  - Assigned staff
- Useful for documentation and reporting purposes

---

## 🧠 Validation Features
- Student ID format validation (e.g., IT12345678)
- Email validation
- Phone/WhatsApp must be exactly 10 digits
- Dynamic validation based on selected contact type

---

## 🔄 Ticket Lifecycle
The system follows a complete ticket workflow:

OPEN → IN_PROGRESS → RESOLVED → CLOSED

---

## 🛠️ Technologies Used

### Frontend
- React.js
- CSS (Custom styling)
- Recharts (Charts)
- jsPDF & autoTable (PDF generation)

### Backend
- Spring Boot
- Spring Data JPA
- REST APIs

### Database
- MySQL

---

## 📁 Project Structure
