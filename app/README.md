# WorkRide

WorkRide is a web application that helps users to find the mutual route to their destination. It is a web app built for the rider and passenger to find the mutual route so that the passenger can get a ride for free of cost and the rider can get a company for the ride. It helps to reduce the traffic and pollution in the city, cost effective and time saving for both rider and passenger.

---

## 🚀 Features

- **User Authentication**: Users can sign up and log in to the application.
- **Create a Ride**: Riders can create a ride by providing the details of the ride.
- **Find a Ride**: Passengers can find the ride by searching the destination.
- **Request a Ride**: Passengers can request a ride by providing the details of the ride.
- **Accept/Reject Request**: Riders can accept or reject the ride request.
- **Chat**: Riders and passengers can chat with each other.
- **Rating**: Riders and passengers can rate each other.

---

## 🛠️ Technologies Used

- **React**: Frontend library
- **Vite**: Fast build tool
- **TypeScript**: For static typing
- **TailwindCSS**: Utility-first CSS framework
- **Yup**: Validation schema
- **React Hook Form**: For form management
- **react-toastify**: For user notifications
- **react-google-recaptcha**: For bot protection
- **react-leaflet**: For maps 
- **leaflet**: For maps
- **@react-google-maps/api**: For google maps

---

## 📁 Project Structure

### **src/**

| Folder            | Description                                      |
|--------------------|--------------------------------------------------|
| `components/`     | Contains reusable React components               |
| `hooks/`          | Custom React hooks                               |
| `pages/`          | Page-level components                            |
| `styles/`         | Global CSS and TailwindCSS configurations         |
| `utils/`          | Utility functions and API calls                  |
| `types/`          | TypeScript type definitions                      |

---

## ⚙️ Setup and Installation

1. Clone the repository:
   ```bash
   git clone 
    ```

2. Install dependencies:
    ```bash
    pnpm install
    ```
3. Create an `.env` file: 
    ```bash
    VITE_API_URL=https://api.com # Your API URL
    VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI # Your reCAPTCHA site key
    ```
4. Start the development server:
    ```bash
    pnpm run dev
    ```

## 📂 File Structure

``` plaintext
📂 commute-helper
├── 📂 public
│   ├── favicon.ico
│   ├── robots.txt
│   └── index.html
├── 📂 src
│   ├── 📂 components
│   │   ├── 📂 ui
│   │   └── [Other Components]
|   ├── 📂 components
│   │   ├── 📂 ui
│   │   └── [Other Components]
|   ├── 📂 constants
│   │   └── data.ts
|   ├── 📂 layouts
│   │   └── [Layout Components]
│   ├── 📂 hooks
│   │   └── useCustomHook.tsx
│   ├── 📂 pages
│   │   ├── Home.tsx
│   │   └── About.tsx
│   ├── 📂 utils
│   │   ├── api.tsx
│   ├── App.tsx
│   ├── global.d.ts
│   ├── main.tsx
│   ├── vite-env.d.ts
│   └── index.css
├── .env
├── .gitignore
├── .prettierignore
├── .prettierrc
├── eslintrc.config.js
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Used pnpm for package management

```bash
pnpm i react-router-dom
```

```bash
pnpm i react-icons
```

```bash
pnpm i --save-dev @types/react-google-recaptcha
```

```bash
pnpm i react-hook-form yup @hookform/resolvers react-toastify
```

---

## Team Members

- **[Purna Shrestha](https://www.purnashrestha.com.np)** - _Frontend Developer_ - _UI/UX Designer_

---

## License

All the assets, and codes used in this project are the propety of `WorkRide`. Use of any of the assets, codes, and designs without the permission of the owner is strictly prohibited.