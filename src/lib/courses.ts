/**
 * Maps a course title to a distinct accent color used by the redesigned
 * certificate. Keys are matched case-insensitively after trimming/collapsing
 * whitespace, so minor formatting differences from the scraped page still hit.
 *
 * The 17 known Anthropic course variations each get their own accent; anything
 * unrecognized falls back to Anthropic's signature coral via `getAccentColor`.
 */
export interface CourseAccent {
  /** Hex accent color, e.g. used for `--accent-color`. */
  color: string;
  /** Human-readable name for the accent, for debugging/UI affordances. */
  label: string;
}

export const DEFAULT_ACCENT: CourseAccent = {
  color: "#D97757",
  label: "Anthropic Coral",
};

const COURSE_ACCENTS: Record<string, CourseAccent> = {
  "claude code 101": { color: "#C15F3C", label: "Terracotta" },
  "introduction to agent skills": { color: "#2C5F6F", label: "Petrol Blue" },
  "claude code in action": { color: "#B85C38", label: "Burnt Sienna" },
  "building with the claude api": { color: "#6B5B95", label: "Violet" },
  "prompt engineering fundamentals": { color: "#4A7C59", label: "Forest" },
  "model context protocol (mcp) essentials": { color: "#1F6F78", label: "Teal" },
  "claude for business": { color: "#8C6A4A", label: "Taupe" },
  "ai fluency": { color: "#C9A227", label: "Gold" },
  "agentic workflows with claude": { color: "#7A4E7E", label: "Plum" },
  "claude code for teams": { color: "#A23E48", label: "Crimson" },
  "advanced tool use": { color: "#3D5A80", label: "Slate Blue" },
  "building agents with the sdk": { color: "#2E6E5A", label: "Emerald" },
  "claude in the enterprise": { color: "#5C4D7D", label: "Indigo" },
  "responsible ai deployment": { color: "#4C6B8A", label: "Steel" },
  "data analysis with claude": { color: "#B07D2B", label: "Amber" },
  "claude code security": { color: "#8E3B46", label: "Maroon" },
  "introduction to claude": { color: "#D97757", label: "Anthropic Coral" },
  "claude with amazon bedrock": { color: "#9C7A3C", label: "Bronze" },
};

/** A course's demonstrated-skills block, shown on the certificate. */
export interface CourseSkills {
  heading: string;
  items: string[];
}

const DEFAULT_HEADING =
  "The student has demonstrated proficiency in the following areas:";

export const DEFAULT_SKILLS: CourseSkills = {
  heading: DEFAULT_HEADING,
  items: [
    "Applying Claude's capabilities to real-world tasks.",
    "Designing effective prompts and structured workflows.",
    "Evaluating model outputs for quality, accuracy, and safety.",
    "Integrating Claude responsibly into applications.",
  ],
};

/**
 * Per-course skills shown on the certificate. Each of the 18 known courses has
 * authored, course-specific competencies inferred from its title/scope; unknown
 * courses fall back to {@link DEFAULT_SKILLS}.
 */
const COURSE_SKILLS: Record<string, CourseSkills> = {
  "claude code 101": {
    heading: DEFAULT_HEADING,
    items: [
      "Driving agentic coding workflows from the Claude Code CLI.",
      "Delegating multi-step engineering tasks to Claude.",
      "Reviewing, refining, and committing AI-generated changes.",
      "Configuring permissions and tools for safe automation.",
    ],
  },
  "introduction to agent skills": {
    heading: DEFAULT_HEADING,
    items: [
      "Understanding the structure and purpose of Agent Skills.",
      "Authoring reusable skills that extend Claude's capabilities.",
      "Invoking and composing skills within agent workflows.",
      "Packaging and sharing skills across teams.",
    ],
  },
  "claude code in action": {
    heading: DEFAULT_HEADING,
    items: [
      "Executing end-to-end coding tasks with the Claude Code agent.",
      "Orchestrating multi-file refactors and feature development.",
      "Extending workflows with tools, sub-agents, and custom commands.",
      "Validating and shipping AI-assisted changes with confidence.",
    ],
  },
  "building with the claude api": {
    heading: DEFAULT_HEADING,
    items: [
      "Authenticating and making requests to the Anthropic Messages API.",
      "Designing system prompts and managing multi-turn conversations.",
      "Implementing tool use (function calling) in API workflows.",
      "Handling streaming responses, errors, and token usage efficiently.",
    ],
  },
  "prompt engineering fundamentals": {
    heading: DEFAULT_HEADING,
    items: [
      "Crafting clear, structured prompts that produce reliable outputs.",
      "Applying techniques such as few-shot examples and chain-of-thought.",
      "Using XML tags and role prompting to steer Claude's responses.",
      "Iterating on and evaluating prompts for accuracy and consistency.",
    ],
  },
  "model context protocol (mcp) essentials": {
    heading: DEFAULT_HEADING,
    items: [
      "Understanding the Model Context Protocol architecture and goals.",
      "Connecting Claude to external tools and data via MCP servers.",
      "Configuring MCP clients within Claude applications.",
      "Exposing custom resources, tools, and prompts over MCP.",
    ],
  },
  "claude for business": {
    heading: DEFAULT_HEADING,
    items: [
      "Identifying high-value business use cases for Claude.",
      "Applying Claude to writing, analysis, and customer-facing workflows.",
      "Establishing responsible AI practices within an organization.",
      "Measuring impact and scaling adoption across teams.",
    ],
  },
  "ai fluency": {
    heading: DEFAULT_HEADING,
    items: [
      "Understanding how large language models work and where they fall short.",
      "Communicating effectively with AI systems to achieve goals.",
      "Critically evaluating AI outputs for accuracy and bias.",
      "Applying AI responsibly and ethically in everyday work.",
    ],
  },
  "agentic workflows with claude": {
    heading: DEFAULT_HEADING,
    items: [
      "Designing autonomous, multi-step agent workflows.",
      "Coordinating tool use, memory, and planning within agents.",
      "Decomposing complex goals into reliable agent tasks.",
      "Evaluating and safeguarding agentic systems in production.",
    ],
  },
  "claude code for teams": {
    heading: DEFAULT_HEADING,
    items: [
      "Standardizing Claude Code usage across an engineering team.",
      "Sharing custom commands, skills, and configuration at scale.",
      "Establishing review and permission practices for AI-assisted code.",
      "Improving team velocity with collaborative agentic workflows.",
    ],
  },
  "advanced tool use": {
    heading: DEFAULT_HEADING,
    items: [
      "Defining robust tool schemas for Claude's function calling.",
      "Orchestrating parallel and sequential tool invocations.",
      "Handling tool errors, retries, and result validation.",
      "Composing tools into sophisticated agentic pipelines.",
    ],
  },
  "building agents with the sdk": {
    heading: DEFAULT_HEADING,
    items: [
      "Building custom agents with the Claude Agent SDK.",
      "Configuring tools, permissions, and system prompts programmatically.",
      "Managing agent loops, context, and state across turns.",
      "Deploying and monitoring agents in production environments.",
    ],
  },
  "claude in the enterprise": {
    heading: DEFAULT_HEADING,
    items: [
      "Deploying Claude securely within enterprise environments.",
      "Integrating Claude with internal systems and data sources.",
      "Applying governance, compliance, and access controls.",
      "Scaling AI solutions across the organization.",
    ],
  },
  "responsible ai deployment": {
    heading: DEFAULT_HEADING,
    items: [
      "Applying Anthropic's principles for safe and responsible AI.",
      "Identifying and mitigating risks such as bias and misuse.",
      "Implementing human oversight and effective guardrails.",
      "Monitoring deployed systems for safety and reliability.",
    ],
  },
  "data analysis with claude": {
    heading: DEFAULT_HEADING,
    items: [
      "Exploring, cleaning, and summarizing datasets with Claude.",
      "Generating and interpreting analytical code and queries.",
      "Surfacing insights and clear narratives from raw data.",
      "Validating results for accuracy and statistical soundness.",
    ],
  },
  "claude code security": {
    heading: DEFAULT_HEADING,
    items: [
      "Configuring permissions and sandboxing for safe automation.",
      "Reviewing AI-generated code for security vulnerabilities.",
      "Managing secrets and access within agentic workflows.",
      "Applying secure-by-default practices with Claude Code.",
    ],
  },
  "introduction to claude": {
    heading: DEFAULT_HEADING,
    items: [
      "Understanding Claude's capabilities, strengths, and limitations.",
      "Interacting effectively with Claude through well-formed prompts.",
      "Applying Claude to writing, summarization, and analysis tasks.",
      "Recognizing responsible and safe usage practices.",
    ],
  },
  "claude with amazon bedrock": {
    heading: DEFAULT_HEADING,
    items: [
      "Accessing Anthropic models through AWS Bedrock infrastructure.",
      "Authenticating and invoking Claude via the Bedrock runtime API.",
      "Managing deployment, scaling, and security within AWS.",
      "Integrating Bedrock-hosted Claude into enterprise applications.",
    ],
  },
};

/** Returns the skills block for a course, falling back to a generic default. */
export function getCourseSkills(title: string): CourseSkills {
  return COURSE_SKILLS[normalizeCourseTitle(title)] ?? DEFAULT_SKILLS;
}

/** Normalizes a course title for map lookups. */
export function normalizeCourseTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Returns the accent for a course title, falling back to the default. */
export function getAccentColor(title: string): CourseAccent {
  return COURSE_ACCENTS[normalizeCourseTitle(title)] ?? DEFAULT_ACCENT;
}

export { COURSE_ACCENTS };
