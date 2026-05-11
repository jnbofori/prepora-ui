# 🍽️ Recipe Tracker — Frontend

> A unified digital experience for recipe storage, nutritional analysis, and grocery planning.

> ⚠️ **Status: Early concept / Work in Progress** — This project is under active development. Features and documentation are subject to change.

---

## Overview

This is the **React frontend** for Recipe Tracker — the user interface for managing recipes, viewing nutritional data, and planning grocery trips. It communicates with a dedicated [backend API](https://github.com/jnbofori/Prepora) built in .NET.

The full application integrates recipe storage, nutritional analysis, and grocery planning into a unified digital experience.

> The backend API repo is available [here](https://github.com/jnbofori/Prepora).

---

## Features

- 📖 **Recipe Storage** — Add, edit, and organize recipes with ingredients, steps, and metadata (prep time, servings, cuisine, etc.)
- 🥗 **Nutritional Analysis** — View automatically calculated nutritional information per recipe and per serving
- 🛒 **Grocery Planning** — Generate and manage shopping lists based on selected recipes
- 🔍 **Search & Filter** — Browse your recipe library by ingredient, tag, dietary restriction, and more

---

## Tech Stack

| | Technology |
|---|---|
| Framework | React |
| Language | JavaScript |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jnbofori/prepora-ui.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.development .env
   # Set REACT_APP_API_URL to your backend API URL
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:3000`

> Make sure the [backend API](https://github.com/jnbofori/Prepora) is running before starting the frontend.

---

## Project Structure

```
recipe-tracker-frontend/
└── src/
    ├── components/        # Reusable UI components
    ├── pages/             # Page-level components / routes
    ├── api/          # API calls and data fetching
    └── ...
```

---

## Roadmap

- [x] User authentication
- [x] Recipe CRUD (create, read, update, delete)
- [x] Recipe import from URL
- [ ] Ingredient and nutritional data display
- [ ] Grocery list UI
- [ ] Meal planning calendar
- [ ] Mobile-responsive UI

---

## License

This project is licensed under the [MIT License](LICENSE).
