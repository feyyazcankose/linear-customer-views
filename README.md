# Linear Customer Views

A modern web application that streamlines customer request management through Linear's project management system. This application provides an intuitive interface for creating, tracking, and managing customer requests while maintaining seamless integration with Linear's powerful project management features.

![Login Screen](/public/login.png)

## Features

### 1. Secure Authentication
- Simple and secure login interface
- Integration with Linear API authentication
- Role-based access control

### 2. Project Access and Management
![Customer Access](/public/customer-access.png)

- View all accessible projects
- Filter and search functionality
- Project status tracking
- Timeline view for project progress

### 3. Customer Request Management
![Create Customer Request](/public/create-customer-request.png)

- Create detailed customer requests with rich text editing
- Automatic labeling with "Customer Request" tag
- Priority level assignment
- Markdown support for request descriptions

### 4. Administrative Controls
![Access Admin](/public/access-admin.png)

- Comprehensive project overview
- Issue tracking and management
- Dark mode support for comfortable viewing
- Responsive design for all devices

## Technical Details

### Environment Variables

The application uses environment variables for secure configuration:

```env
# Required: Linear API Key for authentication and API access
VITE_LINEAR_API_KEY=your_linear_api_key

# Optional: Team ID for admin access
# This restricts access to only specified team's projects
VITE_TEAM_ID=your_team_id
```

#### API Key Usage
- Authenticate with Linear's GraphQL API
- Access project data and issues
- Create and manage customer requests
- Handle user permissions

#### Team ID Usage
- Restricts project visibility to a specific team
- Provides admin-level access control
- Helps organize and filter projects
- Enhances security by limiting scope

> ⚠️ Never commit your API key or Team ID to version control. Always use environment variables.

### API Integration

The application uses Linear's GraphQL API with the following main queries and mutations:

1. **Project Queries**
   ```graphql
   # Fetch projects with teams
   query {
     teams {
       nodes {
         projects {
           nodes {
             id
             name
             description
             state
           }
         }
       }
     }
   }
   ```

2. **Issue Management**
   ```graphql
   # Create issue with customer request label
   mutation CreateIssueWithLabel($input: IssueCreateInput!) {
     issueCreate(input: $input) {
       success
       issue {
         id
         title
         labels {
           nodes {
             name
           }
         }
       }
     }
   }
   ```

### Architecture

```
src/
├── components/          # Reusable UI components
├── context/            # React context providers
├── pages/              # Page components and routing
├── services/           # API and business logic
└── types/              # TypeScript type definitions
```

### Key Dependencies

1. **@apollo/client (^3.12.5)**
   - GraphQL client for Linear API integration
   - Handles caching and state management

2. **@mdxeditor/editor (^3.20.0)**
   - Rich text editing for customer requests
   - Markdown support and formatting

3. **antd (^5.23.0)**
   - UI component library
   - Provides theme support and responsive design

4. **react-router-dom (^7.1.1)**
   - Client-side routing
   - Navigation and URL management

### Performance Optimizations

1. **Code Splitting**
   - Route-based code splitting with React Router
   - Lazy loading of heavy components

2. **Caching**
   - Apollo Client caching for GraphQL queries
   - Browser caching for static assets

3. **Docker Optimization**
   - Multi-stage builds for smaller image size
   - Nginx configuration for static file serving
   - Gzip compression enabled

### Security Measures

1. **API Security**
   - Environment variables for sensitive data
   - API key validation
   - CORS configuration

2. **Data Handling**
   - Input sanitization
   - XSS prevention
   - Secure HTTP headers

### Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Getting Started

### Prerequisites
- Node.js 20 or higher
- Linear API key
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/feyyazcankose/linear-customer-views.git
cd linear-customer-views
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Required: Your Linear API key for authentication
VITE_LINEAR_API_KEY=your_linear_api_key

# Optional: Team ID for admin access (if you want to restrict access)
VITE_TEAM_ID=your_team_id
```

> Note: You can find your Linear API key in Linear's settings under "API" section. The Team ID can be found in the team settings or in the URL when viewing team projects.

4. Start the development server:
```bash
npm run dev
```