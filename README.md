🐶 PAWPATROL — Pet Shop Management System

A modern, responsive, and database-driven Single Page Application (SPA) designed to streamline pet shop operations. PAWPATROL provides centralized management for pets, products, customers, sales, inventory, employees, and business reports through an intuitive interface powered by Supabase and PostgreSQL.

The system focuses on simplifying daily operations, improving inventory visibility, maintaining organized business records, and providing a foundation for reliable, data-driven management.

🚀 Key Features

Single Page Application (SPA) — Navigate between management modules without full-page browser reloads.

Cloud Database Integration — Store and retrieve business records using Supabase and PostgreSQL.

Employee Login System — Provides a login interface with browser-side password hashing using the Web Crypto API and PBKDF2.

Responsive User Interface — Designed to adapt to desktop, tablet, and mobile screen sizes.

CRUD Operations — Create, read, update, and delete supported records across management modules.

Sales and Inventory Integration — Record transactions and update product stock levels as part of the sales workflow.

Dashboard Overview — Display business summaries, recent transactions, and low-stock indicators.

Business Reporting — Review sales performance across selected date ranges.

Modular JavaScript Architecture — Separate page logic, database utilities, routing, and shared styling for easier maintenance.

📦 System Modules

1. Dashboard

Provides an overview of shop operations, including:

Total pets, products, and customers

Today's sales summary

Recent transactions

Low-stock alerts

2. Pets Management

Manage pet records and monitor their availability.

Pet name, breed, age, and gender

Availability and status tracking

Create, update, view, and delete pet records

3. Products Management

Maintain the shop's product catalog and pricing information.

Product names and descriptions

Prices and available stock

Product record management

4. Customers Management

Maintain organized customer information for sales and recordkeeping.

Customer names and contact information

Customer record management

Access to customer information associated with shop transactions, where supported

5. Sales Management

Record and manage product transactions.

Transaction recording

Product and quantity selection

Sales total calculation

Inventory deduction during successful sales processing

Transaction history

6. Inventory Management

Monitor stock availability and support restocking activities.

Current stock monitoring

Low-stock identification

Inventory quantity updates

Restocking records or workflows, where implemented

7. Employee Management

Maintain employee records and organizational information.

Employee names and contact details

Employee roles and positions

Employee record management

8. Reports

Review business performance using transaction data.

Sales summaries

Date-range filtering

Historical sales review

Overall performance indicators based on available records

9. Settings

Manage application and shop configuration.

Shop information

Application preferences

Database-related configuration options, where applicable

🛠️ Technology Stack

Technology

Purpose

HTML5

Application structure

CSS3

Responsive layout and interface styling

Vanilla JavaScript (ES6 Modules)

Application logic and modular functionality

Vite

Development server and build tooling

Supabase

Cloud database platform and client integration

PostgreSQL

Relational database management

Web Crypto API

Browser-side cryptographic operations for PBKDF2 password derivation

🏗️ Application Architecture

PAWPATROL follows a modular frontend architecture that separates application entry points, routing, database access, page-specific logic, and presentation styles.

pawpatrol/
├── index.html
├── login.html
├── local-auth.js
├── login.css
├── src/
│   ├── main.js
│   ├── supabase.js
│   ├── utils/
│   │   └── storage.js
│   └── pages/
│       ├── dashboard.js
│       ├── pets.js
│       ├── products.js
│       ├── customers.js
│       ├── sales.js
│       ├── inventory.js
│       ├── employees.js
│       ├── reports.js
│       └── settings.js
├── style.css
├── package.json
└── .env

Architecture Responsibilities

index.html — Main SPA document containing the application layout and page sections.

login.html — Employee login interface.

local-auth.js — Browser-side authentication-related logic.

src/main.js — Application entry point and SPA navigation management.

src/supabase.js — Supabase client initialization and configuration.

src/utils/storage.js — Shared database and CRUD utility functions.

src/pages/ — Module-specific JavaScript logic for each management page.

style.css — Global styles, layout rules, and SPA presentation.

login.css — Login-specific styling.

package.json — Project dependencies and development/build scripts.

.env — Local environment configuration; must not be committed when it contains credentials or secrets.

🗄️ Database Design

PAWPATROL uses Supabase with PostgreSQL to support persistent storage of shop management data.

The database can organize records into related entities such as:

Pets

Products

Customers

Sales and sale items

Inventory records

Employees

Shop settings

Relational constraints and transaction handling should be used where appropriate to preserve data consistency between sales and inventory.

Data integrity considerations:

Validate required fields and quantities before saving records.

Prevent sales from reducing stock below zero.

Ensure stock deductions and sale records are committed consistently.

Use appropriate primary keys, foreign keys, and database constraints.

Apply suitable database access policies to protect sensitive records.

The final database schema and implemented constraints depend on the actual Supabase configuration.

🔐 Authentication and Security

The current project structure includes browser-side authentication logic using the Web Crypto API and PBKDF2.

For production deployment, authentication must be evaluated separately from database authorization. Client-side password hashing and a protected login screen alone do not guarantee secure access to cloud data.

Recommended production safeguards include:

Supabase Auth or another trusted identity provider for employee authentication

PostgreSQL Row Level Security (RLS) for enforcing database access permissions

Role-based authorization for administrative and employee operations

Input validation and appropriate error handling

Secure handling of environment variables

Server-side validation for sensitive operations

Protection of privileged credentials and administrative actions

Important: Never expose a Supabase service_role key or other privileged secret in frontend code. Browser applications should use only credentials intended for client-side access, alongside correctly configured database policies.

⚙️ Installation and Setup

Prerequisites

Node.js

npm

A Supabase project

Git (optional, for repository management)

1. Clone the repository

git clone <repository-url>
cd pawpatrol

Replace <repository-url> with the actual repository URL.

2. Install dependencies

npm install

3. Configure environment variables

Create a .env file in the project root using the variable names expected by your Supabase client configuration.

For example, if your application uses Vite's environment variable conventions:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key

Ensure the variable names match those referenced in src/supabase.js. Never place privileged server-side secrets in Vite frontend environment variables.

4. Configure Supabase

Create the required PostgreSQL tables.

Configure table relationships and constraints.

Set up Row Level Security policies where appropriate.

Configure authentication and access permissions according to the application's requirements.

5. Start the development server

npm run dev

Open the local URL provided by Vite in your terminal.

6. Build for production

npm run build

To preview the production build locally:

npm run preview

📱 Responsive Design

The interface is designed to support different screen sizes and usage environments.

Desktop layouts for day-to-day shop management

Tablet-friendly layouts for operational tasks

Mobile-responsive navigation and content

Consistent styling across management modules

🔮 Potential Future Improvements

Centralized employee authentication and session management

Granular role-based access control

Database-level transaction handling for sales and inventory

Inventory movement history and stock adjustment auditing

Exportable sales reports in CSV or PDF

Employee activity logs

Automated database backups and recovery procedures

Automated tests for critical business workflows

Improved validation, loading states, and error feedback

🎯 Project Objective

PAWPATROL aims to provide a centralized digital solution for managing the daily operations of a pet shop. By combining a modular frontend, cloud-based relational storage, and interconnected management workflows, the system provides a foundation for improving operational efficiency, inventory visibility, and business recordkeeping.

PAWPATROL — Simplifying Pet Shop Management, One Paw at a Time. 🐾
