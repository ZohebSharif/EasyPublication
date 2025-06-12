import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lbl-top-header': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        theme?: string;
      }, HTMLElement>;
      'lbl-header': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        theme?: string;
      }, HTMLElement>;
      'lbl-container': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'wrapper-size'?: string;
        theme?: string;
      }, HTMLElement>;
      'lbl-search-form': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'placeholder-text'?: string;
        'search-url'?: string;
        'search-query-parameter'?: string;
        slot?: string;
      }, HTMLElement>;
      'lbl-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        type?: string;
        text?: string;
        'link-url'?: string;
        theme?: string;
      }, HTMLElement>;
      'lbl-bu-footer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'logo-url'?: string;
        'logo-title'?: string;
        'logo-sub-title'?: string;
      }, HTMLElement>;
      'lbl-icon-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        theme?: string;
      }, HTMLElement>;
      'lbl-icon-list-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'icon-id'?: string;
        'icon-url'?: string;
        'icon-title'?: string;
        slot?: string;
        icon?: string;
        'link-url'?: string;
        'link-text'?: string;
        theme?: string;
      }, HTMLElement>;
      'lbl-bottom-footer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
