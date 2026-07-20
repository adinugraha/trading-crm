# Trading CRM - Business Development Platform

Sebuah sistem CRM profesional untuk mengelola deals, clients, dan contacts dalam industri trading dengan dashboard analytics yang komprehensif.

## 🎯 Fitur Utama

✅ **Clients & Contacts Management**
- Manajemen data clients dengan informasi kontak lengkap
- Hubungan hierarchy clients dan contacts
- Riwayat interaksi dan aktivitas

✅ **Deals Pipeline**
- Pipeline tahapan deals yang fleksibel (7 stage)
- Tracking nilai deals dalam Rupiah
- Estimasi tanggal closing
- Status indicators yang visual

✅ **Activity Tracking**
- Timeline aktivitas untuk setiap deals
- Meeting, proposal, dan notes logging
- Follow-up scheduling
- Activity history

✅ **Dashboard Analytics**
- Pipeline value overview
- Deals count per stage
- Win rate calculations
- Forecast vs actual
- Real-time metric updates

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, Tailwind CSS
- **Database**: MySQL
- **State Management**: Context API

## 📁 Project Structure

```
trading-crm/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── app.js
│   ├── database/
│   │   ├── schema.sql
│   │   └── sample-data.sql
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── styles/
│   │   └── App.jsx
│   └── package.json
└── docs/
    └── API.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- MySQL 8.0+
- npm atau yarn

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
```

2. **Database Setup**
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/sample-data.sql
```

3. **Environment Configuration**
```bash
cp backend/.env.example backend/.env
# Edit dan sesuaikan database credentials
```

4. **Frontend Setup**
```bash
cd frontend
npm install
```

5. **Run Development**
```bash
# Terminal 1 - Backend (port 5000)
cd backend && npm run dev

# Terminal 2 - Frontend (port 3000)
cd frontend && npm run dev
```

## 🎨 Design System

### Color Palette
- **Primary**: Deep Blue (#003F7F)
- **Sidebar**: Dark Slate (#1F2937)
- **Background**: White (#FFFFFF)
- **Borders**: Light Gray (#E5E7EB)

### Deal Stages & Colors
- 🔴 **Prospecting** - Red (#EF4444)
- 🟠 **Qualification** - Amber (#F59E0B)
- 🟡 **Proposal** - Yellow (#FBBF24)
- 🟢 **Negotiation** - Lime (#84CC16)
- 🔵 **Closing** - Blue (#003F7F)
- ✅ **Won** - Green (#10B981)
- ❌ **Lost** - Gray (#6B7280)

## 📊 Sample Data

Proyek ini dilengkapi dengan sample data:
- **PT. Global Trading Solutions** - Perusahaan utama
- 15+ Clients dengan berbagai industri
- 40+ Contacts
- 25+ Active Deals
- **Currency**: Indonesian Rupiah (IDR)

## 📝 License

MIT
