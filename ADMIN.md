# VolunteerHub - Administrator Documentation

This document describes the administrative features, tools, and workflows for NGO administrators on the VolunteerHub platform.

## Admin Features

### 1. Analytics & Overview Dashboard
* Visual indicators and KPI cards tracking key metrics:
  - Total volunteer hours logged.
  - Active campaigns / events.
  - Total registered and active volunteers.
  - Pending applications requiring attention.
* Interactive charts:
  - Monthly registration growth charts.
  - Category-wise event participation.
  - Application success/rejection ratios.

### 2. Volunteer Directory
* Full directory listing of all registered users.
* Real-time search and filtering.
* Single-click actions to:
  - **Approve**: Move a pending volunteer to approved status.
  - **Reject**: Reject an account, revoking their event registration access.
  - **Remove**: Permanently delete a user profile from the database.

### 3. Campaign & Event Management (CRUD)
* Complete control over NGO events.
* Create events with titles, categories, dates, venues, capacity limits, banner images, and required volunteer skills.
* Edit existing event details.
* Delete events (which cascades and cleans up applications and certificates).
* Close/reopen events to prevent or allow new applications.

### 4. Application Processing & Hour Awarding
* Central dashboard showing all volunteer requests.
* Approve or reject individual submissions.
* **Hour Logging**: Specify and log volunteer hours when approving participation.
* **Automated Certificate Generation**: Upon application approval, a certificate is automatically generated for the volunteer containing a unique verification code.
* Revert hours if a previously approved application is set back to rejected.

### 5. Reports Center
* Custom tabular data reporting on all volunteers, events, and hours.
* Search and filter reports.
* **Export Options**: Export volunteer lists and hour logs directly to CSV/Excel files or download print-ready PDF spreadsheets.

---

## Administrator Login Credentials

* **Email**: `admin@volunteerhub.org`
* **Password**: `admin123`
