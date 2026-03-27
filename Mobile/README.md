# Dental CarePlus - Mobile Application

Welcome to the **Dental CarePlus** mobile application. This app is designed for dental patients to book and manage appointments seamlessly on the go. It is fully integrated with the Dental CarePlus backend, ensuring real-time data synchronization with the web version.

## 🚀 Key Features

### 🔐 Secure Authentication
- **Synced Accounts**: Login with your existing web account credentials.
- **JWT-Based Sessions**: Secure token-based session management.
- **Role-Based Access**: Mobile access is optimized for **Customers**; Admin and Doctor functions are handled via the web dashboard.

### 📅 Appointment Management
- **Dynamic Booking**: Fetch real-time available time slots based on doctor schedules and existing bookings.
- **Auto-Refresh Dashboard**: The 'Current Appointment Schedule' widget automatically updates when returning from the booking screen.
- **Reschedule & Cancel**: Easily modify your upcoming visits directly from your mobile device.
- **Conflict Prevention**: Intelligent slot filtering prevents double-bookings.

### 🤖 AI Assistant
- Integrated AI-powered chatbot to assist with common dental inquiries.

### 🎨 Modern UI/UX
- **Full-Screen Experience**: A clean, immersive design with minimal navigational distraction.
- **Premium Aesthetics**: Unified design tokens (colors, typography) that match the web version's high-end feel.
- **Responsive Layouts**: Optimized for various smartphone screen sizes.

## 🛠 Tech Stack
- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Icons**: [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)
- **Networking**: [Axios](https://axios-http.com/) for API communication
- **State management**: React Hooks (`useState`, `useEffect`, `useFocusEffect`, `useCallback`)

## ⚙️ Setup & Installation

1.  **Clone the Repository**:
    ```bash
    git clone [repository-url]
    cd Dental/Mobile
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure the API**:
    Update the `BASE_URL` in `services/api.js` to match your local computer's IP or public backend URL:
    ```javascript
    export const BASE_URL = 'http://192.168.1.54:5000/api';
    ```

4.  **Launch the App**:
    ```bash
    npx expo start
    ```
    - Use 'a' to run on an Android emulator.
    - Use 'i' to run on an iOS simulator.
    - Scan the QR code with the **Expo Go** app to test on a physical device.

## 📂 Project Structure
- **/screens**: Core application views (Login, Register, Dashboard, Booking).
- **/services**: API configuration and authentication utilities.
- **/navigation**: App stack configuration and navigation settings.
- **/assets**: Branded images and splash screen assets.
- **/components**: Shared UI modules (ChatBot, active widgets).

---
*Created for the Dental CarePlus development team.*
