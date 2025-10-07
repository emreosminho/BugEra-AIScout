/**
 * Type definitions for DOM component analysis
 * These types represent the structure of components extracted from web pages
 */

export type ComponentType = 
  | 'button'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'label'
  | 'link'
  | 'image'
  | 'heading'
  | 'form'
  | 'div'
  | 'span'
  | 'other';

export interface DOMComponent {
  id: string;
  type: ComponentType;
  tagName: string;
  text?: string;
  placeholder?: string;
  value?: string;
  href?: string;
  src?: string;
  alt?: string;
  name?: string;
  className?: string;
  role?: string;
  ariaLabel?: string;
  xpath?: string;
  cssSelector?: string;
  attributes: Record<string, string>;
  children?: DOMComponent[];
}

export interface AnalysisResult {
  url: string;
  timestamp: string;
  title: string;
  components: DOMComponent[];
  statistics: {
    totalComponents: number;
    componentsByType: Record<ComponentType, number>;
  };
}

export interface AnalysisOptions {
  url: string;
  waitForSelector?: string;
  timeout?: number;
  excludeSelectors?: string[];
  includeHidden?: boolean;
}

