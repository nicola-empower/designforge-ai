export enum ViewState {
  PLAYGROUND = 'PLAYGROUND',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  BLUEPRINT = 'BLUEPRINT',
  CHAT = 'CHAT'
}

export interface DesignSystem {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: 'sans' | 'serif' | 'mono' | 'Inter' | 'Playfair Display' | 'Roboto' | 'Lato';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  layoutMode: 'landing' | 'dashboard' | 'ecommerce' | 'blog' | 'portfolio';
  darkMode: boolean;
  baseFontSize: number;
  headingText: string;
  subheadingText: string;
  bodyText: string;
  gridColumns: number;
  gridGap: number;
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface BlueprintData {
  overview: string;
  technicalStack: string[];
  components: string[];
  estimatedEffort: string;
}