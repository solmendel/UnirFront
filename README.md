
# UNIR Web App Interface Design

This is a code bundle for UNIR Web App Interface Design. The original project is available at https://www.figma.com/design/rpMel1MPrIIG6mjin4UJdM/UNIR-Web-App-Interface-Design.

## Features

- **Persistent Session Management**: Login state persists across page reloads
- **Google OAuth Integration**: Login with Google account
- **Responsive Design**: Modern UI with Tailwind CSS
- **Multi-page Application**: Messages, History, Collaborators, and Metrics pages

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Google OAuth Setup (Required for Google Login)

**⚠️ IMPORTANT**: Google login requires a valid Google OAuth Client ID. Without it, the Google login button will show an error.

### Step-by-Step Setup:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click "Select a project" → "New Project"
   - Name it "UNIR Frontend" (or any name)
   - Click "Create"

3. **Enable Google Identity Platform API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Identity Platform"
   - Click on it and press "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - If prompted, configure OAuth consent screen first:
     - Choose "External" user type
     - Fill required fields (App name: "UNIR Frontend")
     - Add your email as developer contact
     - Save and continue through all steps

5. **Configure OAuth Client**
   - Application type: "Web application"
   - Name: "UNIR Frontend Web Client"
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173` (for development)
   - Click "Create"

6. **Copy the Client ID**
   - Copy the generated Client ID (looks like: `123456789-abcdefg.apps.googleusercontent.com`)

7. **Update Environment File**
   - The `.env` file is already created in the project root
   - Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   ```

8. **Restart Development Server**
   ```bash
   npm run dev
   ```

### Testing:
- Click "Continuar con Google" button
- It should open Google's OAuth popup
- Any Google account can now log in
- User's real Gmail and name will be used

### For Production:
- Add your production domain to authorized origins
- Update redirect URIs for production URL

## Mock Backend for Testing

A mock backend is available for testing the frontend without connecting to a real backend server.

### Quick Start

1. **Navigate to the mock backend folder:**
   ```bash
   cd mock-backend-ex
   ```

2. **Install dependencies (first time only):**
   ```bash
   npm install
   ```

3. **Start the mock backend:**
   ```bash
   npm start
   ```
   
   The server will start on `http://localhost:8000`

4. **Configure the frontend** (if not already done):
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_WS_URL=ws://localhost:8000
   ```

5. **Start the frontend** (in the main project directory):
   ```bash
   npm run dev
   ```

The frontend will now connect to the mock backend for testing.

### Mock Backend Features

- ✅ All API endpoints implemented
- ✅ WebSocket support for real-time updates
- ✅ Pre-loaded sample data (conversations, messages)
- ✅ Auto-reset on server restart

For more information, see [mock-backend-ex/README.md](./mock-backend-ex/README.md)
  