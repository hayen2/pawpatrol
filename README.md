# 🐶 PAWPATROL — Pet Shop Management System

PAWPATROL is a modern, responsive, and database-driven Single Page Application (SPA) designed to streamline pet shop operations. It provides a centralized platform for managing pets, products, customers, sales, inventory, employees, and business reports using a modular JavaScript architecture and Supabase-powered data storage.

## 🚀 Features

- **Single Page Application (SPA)** — Navigate between modules without full-page browser reloads.
- **Cloud Database Integration** — Integrate with Supabase and PostgreSQL for persistent data storage and retrieval.
- **Employee Login** — Browser-side authentication logic using the Web Crypto API and PBKDF2.
- **Responsive Interface** — Adaptable layouts for desktop, tablet, and mobile devices.
- **CRUD Operations** — Create, read, update, and delete records across supported management modules.
- **Sales and Inventory Integration** — Record sales and update product stock levels through the sales workflow.
- **Dashboard Overview** — View business summaries, recent transactions, and low-stock indicators.
- **Sales Reporting** — Review sales performance using date-range filters.
- **Modular Architecture** — Organize routing, database utilities, page logic, and styles into separate files.

## 📦 System Modules

### 1. Dashboard
Provides an overview of shop operations, including total pets, products, and customers, today's sales, recent transactions, and low-stock alerts.

### 2. Pets Management
Manage pet records, including breed, age, gender, and availability status.

### 3. Products Management
Maintain product information, pricing, and available stock quantities.

### 4. Customers Management
Organize customer records and contact information for shop transactions.

### 5. Sales Management
Record sales transactions, calculate transaction totals, and integrate product stock deductions into the sales workflow.

### 6. Inventory Management
Monitor stock levels, identify low-stock products, and manage inventory quantities.

### 7. Employee Management
Maintain employee records, roles, and contact information.

### 8. Reports
Review sales summaries, filter transactions by date range, and analyze available business performance data.

### 9. Settings
Manage shop information and available application configuration options.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive layouts |
| Vanilla JavaScript (ES6 Modules) | Application logic and modular functionality |
| Vite | Development server and build tool |
| Supabase | Cloud database platform and client integration |
| PostgreSQL | Relational database |
| Web Crypto API | Browser-side cryptographic operations using PBKDF2 |

## 🏗️ Project Structure

```text
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
├── .env
└── .gitignore
```

## 🗄️ Database Integration

PAWPATROL uses Supabase and PostgreSQL to support persistent storage and retrieval of management records.

The application is organized around the following business entities:

- Pets
- Products
- Customers
- Sales
- Inventory
- Employees
- Shop settings

Database relationships, constraints, and access policies should be configured to maintain data consistency and protect sensitive information.

## 🔐 Security Considerations

The project includes browser-side authentication logic using the Web Crypto API and PBKDF2.

For production use, authentication must be supported by appropriate authorization and database access controls.

Recommended security practices include:

- Use a trusted authentication provider, such as Supabase Auth, for employee identity and session management.
- Configure PostgreSQL Row Level Security (RLS) policies to enforce database permissions.
- Validate input and business rules before modifying records.
- Protect administrative operations with appropriate authorization checks.
- Keep privileged credentials and server-side secrets out of frontend code.
- Never commit environment files containing actual credentials or secrets.

**Note:** Client-side authentication alone does not guarantee secure access to cloud database records. Actual security depends on the implemented authentication flow, database policies, and authorization controls.

## ⚙️ Installation and Setup

### Prerequisites

- [Node.js](https://nodejs.org/)
- npm
- A configured [Supabase](https://supabase.com/) project

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pawpatrol
```

Replace `<repository-url>` with the actual Git repository URL.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root and add the Supabase credentials required by your application.

Example for a Vite frontend:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Ensure the variable names match those used in `src/supabase.js`. Never expose a Supabase service role key in frontend code.

### 4. Configure the Database

- Create the required PostgreSQL tables.
- Configure database relationships and constraints.
- Set up the appropriate Row Level Security policies.
- Configure authentication and permissions according to the application's requirements.

### 5. Run the Development Server

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### 6. Build for Production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 📱 Responsive Design

PAWPATROL is designed to provide a consistent management experience across different screen sizes, with layouts suited to desktop, tablet, and mobile use.

## 🔮 Potential Future Improvements

- Centralized authentication and session management
- Role-based access control
- Transaction-safe sales and inventory updates
- Inventory movement history and audit logs
- Exportable reports in CSV or PDF format
- Employee activity monitoring
- Automated testing for critical workflows
- Improved validation and error handling
- Database backup and recovery procedures

## 🎯 Project Objective

PAWPATROL aims to simplify pet shop operations by centralizing business records, organizing inventory, streamlining sales workflows, and providing accessible management reports through a responsive web application.

---

**PAWPATROL — Simplifying Pet Shop Management, One Paw at a Time.** 🐾
