import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: '/graphql',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  }
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'Authorization': import.meta.env.VITE_LINEAR_API_KEY,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
});

export const GET_PROJECTS = gql`
  query Teams {
    teams {
      nodes {
        id
        name
        projects {
          nodes {
            id
            name
            description
            icon
            color
            state
            updatedAt
          }
        }
      }
    }
  }
`;

export const getProjects = async () => {
  try {
    const { data } = await client.query({
      query: GET_PROJECTS
    });
    
    if (!data?.teams?.nodes) {
      throw new Error('No teams found');
    }
    
    const allProjects = data.teams.nodes.reduce((acc: any[], team: any) => {
      return [...acc, ...(team.projects?.nodes || [])];
    }, []);

    return { nodes: allProjects };
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const GET_PROJECT_ISSUES = gql`
  query ProjectIssues($projectId: String!) {
    project(id: $projectId) {
      id
      name
      description
      startDate
      targetDate
      issues(filter: { parent: { null: true } }) {
        nodes {
          id
          identifier
          number
          title
          description
          state {
            id
            name
            color
            type
          }
          priority
          labels {
            nodes {
              id
              name
              color
            }
          }
          projectMilestone {
            id
            name
            description
            targetDate
          }
        }
      }
      projectMilestones {
        nodes {
          id
          name
          description
          targetDate
        }
      }
    }
  }
`;

export const GET_PROJECT_ISSUE_COUNT = gql`
  query ProjectIssueCount($projectId: String!) {
    project(id: $projectId) {
      id
      name
      issues {
        nodes {
          id
        }
      }
    }
  }
`;

export const getProjectIssues = async (projectId: string) => {
  try {
    // Proje erişim kontrolü
    const projectAccess = localStorage.getItem('projectAccess');
    if (!projectAccess || (projectAccess !== 'all' && projectAccess !== projectId)) {
      return null;
    }

    const { data } = await client.query({
      query: GET_PROJECT_ISSUES,
      variables: { projectId }
    });
    return data.project;
  } catch (error) {
    console.error('Error fetching project issues:', error);
    throw error;
  }
};

export const getProjectIssueCount = async (projectId: string) => {
  try {
    const { data } = await client.query({
      query: GET_PROJECT_ISSUE_COUNT,
      variables: { projectId },
    });
    return data.project.issues.nodes.length;
  } catch (error) {
    console.error('Error fetching project issue count:', error);
    return 0;
  }
};

export const checkProjectExists = async (projectId: string): Promise<boolean> => {
  try {
    const { data } = await client.query({
      query: gql`
        query CheckProject($projectId: String!) {
          project(id: $projectId) {
            id
          }
        }
      `,
      variables: { projectId }
    });
    return !!data.project;
  } catch (error) {
    console.error('Error checking project:', error);
    return false;
  }
};
