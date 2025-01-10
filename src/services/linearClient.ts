import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

interface Project {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  targetDate: string | null;
  state: string;
}

const client = new ApolloClient({
  uri: 'https://api.linear.app/graphql',
  cache: new InMemoryCache(),
  headers: {
    authorization: import.meta.env.VITE_LINEAR_API_KEY || ''
  }
});

export const GET_PROJECTS = gql`
  query {
    teams {
      nodes {
        projects {
          nodes {
            id
            name
            description
            startDate
            targetDate
            state
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
    
    const allProjects = data.teams.nodes.reduce((acc: Project[], team: any) => {
      const projects = team.projects?.nodes || [];
      return [...acc, ...projects.map((project: any): Project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        targetDate: project.targetDate,
        state: project.state || 'backlog'
      }))];
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
      issues {
        nodes {
          id
        }
      }
    }
  }
`;

export const GET_PROJECT_EXISTS = gql`
  query CheckProject($projectId: String!) {
    project(id: $projectId) {
      id
    }
  }
`;

export const getProjectIssues = async (projectId: string) => {
  try {
    // Proje erişim kontrolü
    const projectAccess = localStorage.getItem('projectAccess');
    if (projectAccess !== 'all' && projectAccess !== projectId) {
      throw new Error('No access to this project');
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
      query: GET_PROJECT_EXISTS,
      variables: { projectId },
    });
    return !!data.project;
  } catch (error) {
    console.error('Error checking project:', error);
    return false;
  }
};

export const GET_ORGANIZATION = gql`
  query Organization {
    organization {
      id
      name
      logoUrl
    }
  }
`;

export const getOrganization = async () => {
  try {
    const { data } = await client.query({
      query: GET_ORGANIZATION,
    });
    return data.organization;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
};
