# Meesterproef - Ronald’s BOK - CMD Base

This is the Node.js project for the **Meesterproef** assignment: _Ronald’s BOK - CMD Base_.

## 🚀 Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/dutchcalcifer/meesterproef-ronalds-bok.git
cd meesterproef-ronalds-bok
```

### 2. Install Dependencies

```bash
npm install
```

```bash
npm update
```

### 3. Run vectore embeddings

#### create embeddings

```bash
npm run predev
```

### 4. Run the Project

#### Development Mode (with auto-restart via nodemon)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

## 📁 Project Structure

```
meesterproef-ronalds-bok/
├── public            # Static files
├── src               # Source code
│   ├── controllers   # Controllers
│   ├── data          # Data files
│   ├── routes        # Routes
│   ├── scripts       # Scripts
│   ├── utils         # Utility functions
│   └── views         # Views
├── .env              # Environment variables
├── .gitignore        # Git ignore file
├── . package.json    # Package.json
├── README.md         # Readme file
└── server.js         # Entry point
```

## 🧰 Tech Stack

- **Node.js** Skeleton of the project
- **Express 5** For the backend
- **EJS** for templating
- **Nodemon** for development auto-reloads
- **express-ejs-layouts** for layout support
- **Fuse.js** for fuzzy search
- **dotenv** for environment variables
- **compute-cosine-similarity** for cosine similarity
- **openai** for OpenAI API integration

## 👩‍💻 Code Conventions

We follow these code conventions to ensure consistency and readability across the codebase:

### General

- Use meaningful names for classes, IDs, variables, and functions.
- Always use **English** for code naming.
- Be consistent in naming practices.
- Avoid abbreviations; write out names fully.

### Naming Styles

- **kebab-case** for CSS classes, CSS variables, and IDs in HTML/CSS.
- **camelCase** for JavaScript variables and functions.

### Examples

**CSS**

```css
/* ✅ Descriptive class name and CSS variable */
.header-trigger {
  --primary-color: hotpink;
}

/* ❌ Non-descriptive names and not in English */
.btn-1 {
  --color-1: hotpink;
  --kleur-2: hotpink;
}
```

**HTML**

```html
<!-- ✅ Use kebab-case and descriptive names -->
<form id="contact-form" class="contact-form"></form>

<!-- ❌ Avoid camelCase and unclear names -->
<form id="contactForm" class="myForm"></form>

<!-- ❌ Keep naming consistent (.button-primary vs .button--secondary) -->
<button class="button-primary">Submit</button>
<button class="button--secondary">Submit</button>
```

**JavaScript**

```javascript
// ✅ Modern function notation, camelCase, descriptive name
const initHeader = () => {};

// ❌ Avoid PascalCase for functions and use const/let instead of var
function MyFunction() {}
var initHeader = () => {};
```

## 👥 Authors

- Dante Piekart
- Vivanne Hoogendam
- Lorenzo Horde
- Annika Mekkelhold

## 🐛 Issues

Report bugs or request features on the [issues page](https://github.com/dutchcalcifer/meesterproef-ronalds-bok/issues).

## 📄 License

This project is **UNLICENSED** and intended for educational use only.
